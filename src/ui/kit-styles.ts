import componentsCss from './components.css?inline';
import tokensCss from './tokens.css?inline';

/** Combined UI kit CSS for injection into the feedback portal Shadow Root. */
export const UI_KIT_STYLES = `${tokensCss}\n${componentsCss}`;
