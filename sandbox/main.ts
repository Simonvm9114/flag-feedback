import { initFeedback } from 'flag-feedback';

// ── Log panel ──────────────────────────────────────────────────────────────

const logOutput = document.getElementById('log-output') as HTMLPreElement;
let logReady = false;

function log(msg: string, level: 'info' | 'ok' | 'error' = 'info'): void {
  if (!logReady) {
    logOutput.innerHTML = '';
    logReady = true;
  }
  const line = document.createElement('div');
  line.className = `log-${level}`;
  const time = new Date().toLocaleTimeString([], { hour12: false });
  line.textContent = `${time}  ${msg}`;
  logOutput.prepend(line);
}

// Mirror console.error into the log panel so validation failures are visible on screen
const origConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  origConsoleError(...args);
  log(args.map(String).join(' '), 'error');
};

// Intercept fetch — log the outgoing POST payload without actually sending it.
// Replace with a real endpoint (or remove this override) when you want live submission tests.
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = input instanceof Request ? input.url : String(input);
  const method = (init?.method ?? 'GET').toUpperCase();
  log(`${method} → ${url}`, 'info');
  if (init?.body) {
    try {
      log(JSON.stringify(JSON.parse(init.body as string), null, 2), 'info');
    } catch {
      log(String(init.body), 'info');
    }
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// ── US-01: Import check ────────────────────────────────────────────────────

const importStatus = document.getElementById('import-status')!;
if (typeof initFeedback === 'function') {
  importStatus.textContent = '✓ initFeedback imported from installed flag-feedback package';
  importStatus.className = 'status-ok';
} else {
  importStatus.textContent = '✗ import failed — check the console';
  importStatus.className = 'status-error';
}

// ── US-02: Activator placement ─────────────────────────────────────────────

// Bind activators already in the markup (nav + aside)
for (const el of document.querySelectorAll<HTMLElement>('[data-activator]')) {
  initFeedback({ activator: el, endpoint: 'https://example.com/api/feedback' });
  const placement = el.dataset.placement ?? el.parentElement?.tagName.toLowerCase();
  log(`Activator bound — placed in <${placement}>`, 'ok');
}

// US-02: also bind an activator inside a plain <div> (third container type)
const divSlot = document.getElementById('div-activator-slot')!;
const divActivator = document.createElement('button');
divActivator.type = 'button';
divActivator.className = 'activator';
divActivator.style.cssText = 'background: #059669;';
divActivator.textContent = 'Feedback (div)';
divSlot.appendChild(divActivator);
initFeedback({ activator: divActivator, endpoint: 'https://example.com/api/feedback' });
log('Activator bound — placed in <div>', 'ok');

// ── US-04: Endpoint validation ─────────────────────────────────────────────

const endpointScenarios: Record<string, { endpoint: string; valid: boolean }> = {
  'ep-https': { endpoint: 'https://example.com/api/feedback', valid: true },
  'ep-localhost': { endpoint: 'http://localhost/api/feedback', valid: true },
  'ep-127': { endpoint: 'http://127.0.0.1:3000/api/feedback', valid: true },
  'ep-empty': { endpoint: '', valid: false },
  'ep-relative': { endpoint: '/api/feedback', valid: false },
  'ep-http-ext': { endpoint: 'http://example.com/api/feedback', valid: false },
};

for (const [id, { endpoint, valid }] of Object.entries(endpointScenarios)) {
  document.getElementById(id)?.addEventListener('click', () => {
    const el = document.createElement('button');
    const instance = initFeedback({ activator: el, endpoint });
    if (valid) {
      log(`✓ Accepted: "${endpoint}"`, 'ok');
    }
    instance.destroy();
  });
}

// ── US-05: App metadata ────────────────────────────────────────────────────

document.getElementById('meta-all')?.addEventListener('click', () => {
  const el = document.createElement('button');
  initFeedback({
    activator: el,
    endpoint: 'https://example.com/api/feedback',
    appId: 'sandbox-app',
    gitCommit: 'abc1234',
    gitRepo: 'https://github.com/example/repo.git',
  }).destroy();
  log('Initialized with appId="sandbox-app", gitCommit="abc1234", gitRepo set', 'ok');
});

document.getElementById('meta-none')?.addEventListener('click', () => {
  const el = document.createElement('button');
  initFeedback({ activator: el, endpoint: 'https://example.com/api/feedback' }).destroy();
  log('Initialized with no app metadata', 'ok');
});

document.getElementById('meta-subset')?.addEventListener('click', () => {
  const el = document.createElement('button');
  initFeedback({
    activator: el,
    endpoint: 'https://example.com/api/feedback',
    appId: 'sandbox-app',
  }).destroy();
  log('Initialized with only appId="sandbox-app"', 'ok');
});

// ── Batch 2: Feedback panel & composition ─────────────────────────────────
// US-07 truncation helper — opens the first panel if closed, then fills the textarea.
document.getElementById('fill-long-comment')?.addEventListener('click', () => {
  const portals = document.querySelectorAll<HTMLElement>('[data-flag-feedback-portal]');
  if (!portals.length) {
    log('No widget initialized — reload the page', 'error');
    return;
  }

  // Use the first portal; open its panel if not already visible
  const portal = portals[0];
  const overlay = portal.shadowRoot?.querySelector('.ff-panel-overlay');
  if (!overlay?.classList.contains('ff-panel-overlay--visible')) {
    // Click the nav activator to open its panel (first activator bound)
    const activator = document.querySelector<HTMLElement>('button.activator[data-placement="nav"]');
    activator?.click();
  }

  // Fill after a microtask so show() has run and reset is done
  setTimeout(() => {
    const textarea = portal.shadowRoot?.querySelector<HTMLTextAreaElement>('textarea');
    if (textarea) {
      textarea.value = 'x'.repeat(10_001);
      log(
        'Filled textarea with 10,001 "x" characters — select a category and click Submit to verify truncation',
        'info',
      );
    }
  }, 0);
});
