let instanceCounter = 0;

/** Portal container appended to document.body with an open Shadow Root. */
export type Portal = {
  container: HTMLElement;
  shadowRoot: ShadowRoot;
};

/** Creates a body portal with an open shadow root for package-owned UI. */
export function createPortal(): Portal {
  instanceCounter += 1;
  const container = document.createElement('div');
  container.id = `flag-feedback-portal-${instanceCounter}`;
  container.setAttribute('data-flag-feedback-portal', 'true');

  const shadowRoot = container.attachShadow({ mode: 'open' });
  document.body.appendChild(container);

  return { container, shadowRoot };
}

/** Removes a portal container from the document. */
export function destroyPortal(portal: Portal): void {
  portal.container.remove();
}
