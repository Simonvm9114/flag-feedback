import { createButton } from '../src/components/Button';
import { createCard } from '../src/components/Card';
import { createHeading } from '../src/components/Heading';
import { createInput } from '../src/components/Input';
import { createLayout } from '../src/components/Layout';
import { createModePill } from '../src/components/ModePill';
import { createText } from '../src/components/Text';
import { UI_KIT_STYLES } from '../src/ui/kit-styles';

/** Builds the UI kit review surface inside an open Shadow Root (matches production encapsulation). */
function mountKitPreview(host: HTMLElement): void {
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = UI_KIT_STYLES;
  shadow.append(style);

  const layout = createLayout();

  layout.append(
    createHeading({ content: 'flag-feedback UI kit', level: 'lg', as: 'h1' }),
    createText({
      content: 'Tokens derived from the v1 experiment panel and Phase 2 visual direction.',
      tone: 'secondary',
    }),
    buildPaletteSection(),
    buildTypographySection(),
    buildSpacingSection(),
    buildComponentsSection(),
  );

  shadow.append(layout);
}

/** Renders labeled color swatches for token review. */
function buildPaletteSection(): HTMLElement {
  const section = document.createElement('section');
  section.style.marginTop = 'var(--ff-space-6)';
  section.append(createHeading({ content: 'Colors', level: 'md', as: 'h2' }));

  const swatches = document.createElement('div');
  swatches.style.display = 'flex';
  swatches.style.flexWrap = 'wrap';
  swatches.style.gap = 'var(--ff-space-3)';
  swatches.style.marginTop = 'var(--ff-space-3)';

  const tokens: Array<[string, string]> = [
    ['--ff-color-primary', 'primary'],
    ['--ff-color-surface', 'surface'],
    ['--ff-color-background', 'background'],
    ['--ff-color-text', 'text'],
    ['--ff-color-border', 'border'],
    ['--ff-color-success', 'success'],
    ['--ff-color-error', 'error'],
    ['--ff-color-pill-surface', 'pill'],
  ];

  for (const [variable, name] of tokens) {
    const item = document.createElement('div');
    item.style.textAlign = 'center';
    const box = document.createElement('div');
    box.style.width = '72px';
    box.style.height = '48px';
    box.style.borderRadius = 'var(--ff-radius-md)';
    box.style.background = `var(${variable})`;
    box.style.border = '1px solid var(--ff-color-border)';
    const label = document.createElement('div');
    label.className = 'ff-text ff-text--sm';
    label.textContent = name;
    item.append(box, label);
    swatches.append(item);
  }

  section.append(swatches);
  return section;
}

/** Renders heading and body scale samples. */
function buildTypographySection(): HTMLElement {
  const section = document.createElement('section');
  section.style.marginTop = 'var(--ff-space-6)';
  section.append(
    createHeading({ content: 'Typography', level: 'md', as: 'h2' }),
    createHeading({ content: 'Heading XL', level: 'xl', as: 'h3' }),
    createHeading({ content: 'Heading LG', level: 'lg', as: 'h3' }),
    createHeading({ content: 'Heading MD', level: 'md', as: 'h3' }),
    createText({ content: 'Body text — 14px system stack.' }),
    createText({ content: 'Secondary text', tone: 'secondary', size: 'sm' }),
  );
  return section;
}

/** Renders spacing scale bars. */
function buildSpacingSection(): HTMLElement {
  const section = document.createElement('section');
  section.style.marginTop = 'var(--ff-space-6)';
  section.append(createHeading({ content: 'Spacing', level: 'md', as: 'h2' }));

  const scale = ['1', '2', '3', '4', '5', '6'] as const;
  for (const step of scale) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = 'var(--ff-space-3)';
    row.style.marginTop = 'var(--ff-space-2)';
    const bar = document.createElement('div');
    bar.style.height = '12px';
    bar.style.width = `var(--ff-space-${step})`;
    bar.style.background = 'var(--ff-color-primary)';
    bar.style.borderRadius = '2px';
    const label = createText({ content: `--ff-space-${step}`, size: 'sm' });
    row.append(bar, label);
    section.append(row);
  }

  return section;
}

/** Renders all base components and variants. */
function buildComponentsSection(): HTMLElement {
  const section = document.createElement('section');
  section.style.marginTop = 'var(--ff-space-6)';
  section.append(createHeading({ content: 'Components', level: 'md', as: 'h2' }));

  const card = createCard([
    createInput({ label: 'Comment', placeholder: 'Describe your feedback…' }),
    createInput({
      label: 'With error',
      placeholder: 'Required',
      error: 'Please enter a value',
    }),
    createButton({ label: 'Submit feedback', variant: 'primary' }),
    createButton({ label: 'Cancel', variant: 'secondary' }),
  ]);
  card.classList.add('ff-card--stack');
  card.style.marginTop = 'var(--ff-space-3)';

  const pillRow = document.createElement('div');
  pillRow.style.marginTop = 'var(--ff-space-4)';
  pillRow.append(
    createText({ content: 'Mode indicator', size: 'sm' }),
    createModePill('Recording… tap to finish'),
  );

  section.append(card, pillRow);
  return section;
}

const host = document.getElementById('kit-host');
if (host) {
  mountKitPreview(host);
}
