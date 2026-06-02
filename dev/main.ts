import { initFeedback } from '../src/index';

const activator = document.getElementById('activator');
if (activator instanceof HTMLElement) {
  initFeedback({
    activator,
    endpoint: 'http://127.0.0.1:3000/api/feedback',
  });
}
