export type CardOptions = {
  children?: HTMLElement[];
  stack?: boolean;
};

/** Creates a content card container. */
export function createCard({ children = [], stack = false }: CardOptions = {}): HTMLDivElement {
  const card = document.createElement('div');
  card.className = stack ? 'ff-card ff-card--stack' : 'ff-card';
  card.append(...children);
  return card;
}
