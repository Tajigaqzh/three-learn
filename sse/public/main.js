const connectButton = document.querySelector('#connect');
const closeButton = document.querySelector('#close');
const sendButton = document.querySelector('#send');
const messageInput = document.querySelector('#message');
const statusEl = document.querySelector('#status');
const logEl = document.querySelector('#log');
const fetchStreamButton = document.querySelector('#fetch-stream');
const cancelFetchStreamButton = document.querySelector('#cancel-fetch-stream');
const streamPromptInput = document.querySelector('#stream-prompt');
const fetchStatusEl = document.querySelector('#fetch-status');
const fetchLogEl = document.querySelector('#fetch-log');

let eventSource = null;
let fetchStreamController = null;

connectButton.addEventListener('click', connect);
closeButton.addEventListener('click', close);
sendButton.addEventListener('click', broadcast);
fetchStreamButton.addEventListener('click', startFetchStream);
cancelFetchStreamButton.addEventListener('click', cancelFetchStream);

function connect() {
  close();

  eventSource = new EventSource('/events');
  statusEl.textContent = 'Connecting';
  log('client', 'connecting');

  eventSource.addEventListener('open', () => {
    statusEl.textContent = 'Connected';
    log('client', 'connected');
  });

  eventSource.addEventListener('ready', (event) => {
    log('ready', parseJson(event.data));
  });

  eventSource.addEventListener('message', (event) => {
    log('message', parseJson(event.data));
  });

  eventSource.addEventListener('done', (event) => {
    log('done', parseJson(event.data));
    close();
  });

  eventSource.addEventListener('error', () => {
    if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
      statusEl.textContent = 'Disconnected';
      return;
    }

    statusEl.textContent = 'Disconnected, retrying';
    log('client', 'connection lost; EventSource will retry automatically');
  });
}

function close() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }

  statusEl.textContent = 'Disconnected';
}

async function broadcast() {
  const message = messageInput.value.trim();
  if (!message) {
    return;
  }

  const response = await fetch('/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  log('broadcast', await response.json());
}

async function startFetchStream() {
  cancelFetchStream();

  const prompt = streamPromptInput.value.trim();
  if (!prompt) {
    return;
  }

  const controller = new AbortController();
  fetchStreamController = controller;
  fetchStatusEl.textContent = 'Streaming';
  fetchLogEl.textContent = '';

  let lastChunkAt = Date.now();
  const idleTimeoutMs = 30000;
  const watchdog = setInterval(() => {
    if (Date.now() - lastChunkAt > idleTimeoutMs) {
      logFetch('client', `idle timeout after ${idleTimeoutMs}ms`);
      controller.abort();
    }
  }, 5000);

  try {
    const response = await fetch('/fetch-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    if (!response.ok) {
      logFetch('error', await response.text());
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      lastChunkAt = Date.now();
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        handleStreamLine(line);
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      handleStreamLine(buffer);
    }

    fetchStatusEl.textContent = 'Done';
  } catch (error) {
    if (error.name === 'AbortError') {
      fetchStatusEl.textContent = 'Cancelled';
      logFetch('client', 'stream cancelled');
    } else {
      fetchStatusEl.textContent = 'Failed';
      logFetch('error', error.message);
    }
  } finally {
    clearInterval(watchdog);
    if (fetchStreamController === controller) {
      fetchStreamController = null;
    }
  }
}

function cancelFetchStream() {
  if (fetchStreamController) {
    fetchStreamController.abort();
    fetchStreamController = null;
  }
}

function handleStreamLine(line) {
  if (!line.trim()) {
    return;
  }

  const payload = parseJson(line);
  logFetch(payload.type || 'chunk', payload);
}

function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function log(type, value) {
  const line = `[${new Date().toLocaleTimeString()}] ${type}: ${
    typeof value === 'string' ? value : JSON.stringify(value)
  }\n`;
  logEl.textContent += line;
  logEl.scrollTop = logEl.scrollHeight;
}

function logFetch(type, value) {
  const line = `[${new Date().toLocaleTimeString()}] ${type}: ${
    typeof value === 'string' ? value : JSON.stringify(value)
  }\n`;
  fetchLogEl.textContent += line;
  fetchLogEl.scrollTop = fetchLogEl.scrollHeight;
}
