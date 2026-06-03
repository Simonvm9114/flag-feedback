/** Returns a CSS selector token for a single element (tag + id, classes, or nth-child). */
function elementSelector(el: Element): string {
  const tag = el.tagName.toLowerCase();

  if (el.id) {
    return `${tag}#${el.id}`;
  }

  const classes = [...el.classList].filter((c) => c.length > 0).slice(0, 2);
  if (classes.length > 0) {
    return `${tag}.${classes.join('.')}`;
  }

  const parent = el.parentElement;
  if (parent) {
    const index = [...parent.children].indexOf(el) + 1;
    return `${tag}:nth-child(${index})`;
  }

  return tag;
}

/** Builds a CSS selector path up to maxDepth ancestor levels. */
export function buildSelectorPath(el: Element, maxDepth = 5): string {
  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current !== document.documentElement && parts.length < maxDepth) {
    parts.unshift(elementSelector(current));
    current = current.parentElement;
  }

  return parts.join(' > ');
}
