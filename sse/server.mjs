import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(__dirname, 'public');

const port = numberFromEnv('PORT', 3000);
const heartbeatMs = numberFromEnv('SSE_HEARTBEAT_MS', 15000);
const maxStreamMs = numberFromEnv('SSE_MAX_STREAM_MS', 10 * 60 * 1000);
const maxConnectionsPerIp = numberFromEnv('SSE_MAX_CONNECTIONS_PER_IP', 5);
const token = process.env.SSE_TOKEN || '';
const allowedOrigins = parseCsv(process.env.SSE_ALLOWED_ORIGINS);
const isDevelopment = process.env.NODE_ENV !== 'production';

const clients = new Map();
const connectionCountByIp = new Map();

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
]);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    setBaseSecurityHeaders(res);

    if (req.method === 'GET' && url.pathname === '/') {
      await serveStaticFile(res, 'index.html');
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/public/')) {
      await serveStaticFile(res, url.pathname.replace('/public/', ''));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, {
        ok: true,
        clients: clients.size,
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/events') {
      handleSse(req, res, url);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/fetch-stream') {
      if (!isOriginAllowed(req)) {
        sendJson(res, 403, { error: 'Origin is not allowed' });
        return;
      }

      if (!isAuthorized(req, url)) {
        sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }

      const body = await readJsonBody(req, 16 * 1024);
      await handleFetchStream(req, res, body);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/broadcast') {
      if (!isAuthorized(req, url)) {
        sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }

      const body = await readJsonBody(req, 16 * 1024);
      const payload = {
        message: String(body.message || ''),
        at: new Date().toISOString(),
      };

      broadcast('message', payload);
      sendJson(res, 202, {
        ok: true,
        clients: clients.size,
      });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'Internal server error' });
    } else {
      res.end();
    }
  }
});

server.keepAliveTimeout = heartbeatMs + 5000;
server.headersTimeout = heartbeatMs + 10000;
server.requestTimeout = 0;

server.listen(port, () => {
  console.log(`SSE server listening on http://localhost:${port}`);
  console.log(`Heartbeat interval: ${heartbeatMs}ms`);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function handleSse(req, res, url) {
  if (!isOriginAllowed(req)) {
    sendJson(res, 403, { error: 'Origin is not allowed' });
    return;
  }

  if (!isAuthorized(req, url)) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return;
  }

  const ip = getClientIp(req);
  const nextCount = (connectionCountByIp.get(ip) || 0) + 1;
  if (nextCount > maxConnectionsPerIp) {
    sendJson(res, 429, { error: 'Too many SSE connections' });
    return;
  }

  connectionCountByIp.set(ip, nextCount);

  const clientId = randomUUID();
  const lastEventId = req.headers['last-event-id'] || url.searchParams.get('lastEventId') || null;
  let closed = false;
  let eventId = Number.parseInt(String(lastEventId || '0'), 10);
  if (!Number.isFinite(eventId) || eventId < 0) {
    eventId = 0;
  }

  setCorsHeaders(req, res);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const client = {
    id: clientId,
    ip,
    res,
    createdAt: Date.now(),
    send(event, data) {
      eventId += 1;
      writeSse(res, {
        id: eventId,
        event,
        data,
      });
    },
    heartbeat() {
      writeComment(res, `heartbeat ${new Date().toISOString()}`);
    },
    close(reason = 'server-close') {
      if (closed) {
        return;
      }

      closed = true;
      clearInterval(heartbeatTimer);
      clearTimeout(maxAgeTimer);
      clients.delete(clientId);
      decrementIpConnection(ip);

      if (!res.destroyed && !res.writableEnded) {
        try {
          writeSse(res, {
            id: eventId + 1,
            event: 'done',
            data: { reason },
          });
          res.end();
        } catch {
          res.destroy();
        }
      }
    },
  };

  clients.set(clientId, client);

  req.socket.setKeepAlive(true);
  req.socket.setNoDelay(true);
  req.setTimeout(0);

  const heartbeatTimer = setInterval(() => {
    client.heartbeat();
  }, heartbeatMs);

  const maxAgeTimer = setTimeout(() => {
    client.close('max-stream-age');
  }, maxStreamMs);

  req.on('close', () => {
    if (!closed) {
      closed = true;
      clearInterval(heartbeatTimer);
      clearTimeout(maxAgeTimer);
      clients.delete(clientId);
      decrementIpConnection(ip);
    }
  });

  writeComment(res, 'connected');
  writeSse(res, {
    id: eventId,
    event: 'ready',
    data: {
      clientId,
      heartbeatMs,
      lastEventId,
      serverTime: new Date().toISOString(),
    },
  });
}

async function handleFetchStream(req, res, body) {
  const prompt = String(body.prompt || '');
  let closed = false;

  req.on('close', () => {
    closed = true;
  });

  setCorsHeaders(req, res);
  res.writeHead(200, {
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  req.socket.setKeepAlive(true);
  req.socket.setNoDelay(true);
  req.setTimeout(0);

  const heartbeatTimer = setInterval(() => {
    if (!closed && !res.destroyed && !res.writableEnded) {
      writeJsonLine(res, {
        type: 'ping',
        at: new Date().toISOString(),
      });
    }
  }, 5000);

  const chunks = [
    'fetch can use POST, so the request can include a JSON body.',
    `The server received: ${prompt}`,
    'ReadableStream reads the response body as chunks arrive.',
    'This response is NDJSON: one JSON object per line.',
    'If nothing is written for too long, a heartbeat can keep the connection active.',
  ];

  try {
    writeJsonLine(res, {
      type: 'start',
      prompt,
      at: new Date().toISOString(),
    });

    for (const [index, text] of chunks.entries()) {
      await delay(900);
      if (closed || res.destroyed || res.writableEnded) {
        return;
      }

      writeJsonLine(res, {
        type: 'chunk',
        index,
        text,
        at: new Date().toISOString(),
      });
    }

    await delay(900);
    if (!closed && !res.destroyed && !res.writableEnded) {
      writeJsonLine(res, {
        type: 'done',
        at: new Date().toISOString(),
      });
      res.end();
    }
  } finally {
    clearInterval(heartbeatTimer);
  }
}

function broadcast(event, data) {
  for (const client of clients.values()) {
    client.send(event, data);
  }
}

function writeSse(res, { id, event, data }) {
  const lines = [];
  if (id !== undefined && id !== null) {
    lines.push(`id: ${id}`);
  }
  if (event) {
    lines.push(`event: ${event}`);
  }

  const body = typeof data === 'string' ? data : JSON.stringify(data);
  for (const line of body.split(/\r?\n/)) {
    lines.push(`data: ${line}`);
  }

  res.write(`${lines.join('\n')}\n\n`);
}

function writeComment(res, comment) {
  res.write(`: ${comment}\n\n`);
}

function writeJsonLine(res, payload) {
  res.write(`${JSON.stringify(payload)}\n`);
}

function isOriginAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) {
    return true;
  }

  if (allowedOrigins.length === 0) {
    return isDevelopment && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  }

  return allowedOrigins.includes(origin);
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (!origin) {
    return;
  }

  if (isOriginAllowed(req)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
}

function isAuthorized(req, url) {
  if (!token) {
    return true;
  }

  const authHeader = req.headers.authorization || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const queryToken = url.searchParams.get('token') || '';

  return bearer === token || queryToken === token;
}

async function readJsonBody(req, maxBytes) {
  let size = 0;
  let raw = '';

  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error('Request body too large');
      error.statusCode = 413;
      throw error;
    }
    raw += chunk;
  }

  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw);
}

async function serveStaticFile(res, fileName) {
  const normalized = normalize(fileName).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(publicDir, normalized);

  if (!filePath.startsWith(publicDir)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  try {
    const content = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes.get(extname(filePath)) || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(content);
  } catch {
    sendJson(res, 404, { error: 'Not found' });
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function setBaseSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
  );
}

function decrementIpConnection(ip) {
  const count = connectionCountByIp.get(ip) || 0;
  if (count <= 1) {
    connectionCountByIp.delete(ip);
  } else {
    connectionCountByIp.set(ip, count - 1);
  }
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.socket.remoteAddress || 'unknown';
}

function numberFromEnv(name, fallback) {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function parseCsv(value = '') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function shutdown() {
  console.log('Shutting down SSE server...');
  for (const client of clients.values()) {
    client.close('shutdown');
  }

  server.close(() => {
    process.exit(0);
  });
}
