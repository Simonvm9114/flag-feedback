export type HeadingLevel = 'md' | 'lg' | 'xl';

export type HeadingOptions = {
  content: string;
  level?: HeadingLevel;
  as?: 'h1' | 'h2' | 'h3';
};

/** Creates a heading element for panel titles and sections. */
export function createHeading(options: HeadingOptions): HTMLHeadingElement {
  const tag = options.as ?? 'h2';
  const heading = document.createElement(tag);
  heading.className = `ff-heading ff-heading--${options.level ?? 'md'}`;
  heading.textContent = options.content;
  return heading;
}
