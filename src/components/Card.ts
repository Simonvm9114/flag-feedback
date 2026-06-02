/** Creates a content card container. */
export function createCard(children: HTMLElement[] = []): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'ff-card';
  card.append(...children);
  return card;
}
