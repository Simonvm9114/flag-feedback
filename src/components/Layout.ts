/** Creates a panel layout wrapper with consistent padding and width. */
export function createLayout(children: HTMLElement[] = []): HTMLDivElement {
  const layout = document.createElement('div');
  layout.className = 'ff-layout ff-root';
  layout.append(...children);
  return layout;
}
