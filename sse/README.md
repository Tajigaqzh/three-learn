# Safe SSE Demo

This folder contains a dependency-free Node.js SSE example with heartbeat support.

## Run

```powershell
cd C:\Users\123\Desktop\demo-project\vite-project\sse
npm start
```

Open:

```text
http://localhost:3000
```

## Endpoints

- `GET /events`: SSE stream.
- `POST /broadcast`: send a JSON message to all connected clients.
- `GET /health`: simple health check.

## Heartbeat

The server sends SSE comment heartbeats:

```text
: heartbeat 2026-07-17T00:00:00.000Z

```

Browsers ignore comment heartbeats, but proxies and load balancers still see bytes on
the connection, which helps avoid idle timeouts.

## Environment Variables

```powershell
$env:PORT = "3000"
$env:SSE_HEARTBEAT_MS = "15000"
$env:SSE_MAX_STREAM_MS = "600000"
$env:SSE_MAX_CONNECTIONS_PER_IP = "5"
$env:SSE_ALLOWED_ORIGINS = "http://localhost:3000"
$env:SSE_TOKEN = "change-me"
npm start
```

When `SSE_TOKEN` is set, call `/events?token=change-me`. A browser `EventSource`
cannot send custom `Authorization` headers without a wrapper or polyfill, so query
tokens are shown only for local demos. For production, prefer an HttpOnly SameSite
cookie or put the stream behind your existing authenticated session.

## Safety Notes

- Uses `text/event-stream`, `no-cache`, `no-transform`, and `X-Accel-Buffering: no`.
- Cleans intervals and connection counters when the browser disconnects.
- Limits connections per IP.
- Supports CORS allow-listing through `SSE_ALLOWED_ORIGINS`.
- Sends a `done` event before server-side closes.
- Uses `id` fields so browsers can send `Last-Event-ID` on reconnect.
