/** Concatenates all style fragments into the full STYLES export. */
import { STYLES_BASE } from './base.js';
import { STYLES_BUTTON } from './button.js';
import { STYLES_PANEL } from './panel.js';
import { STYLES_COMPONENTS } from './components.js';

export const STYLES = STYLES_BASE + STYLES_BUTTON + STYLES_PANEL + STYLES_COMPONENTS;
