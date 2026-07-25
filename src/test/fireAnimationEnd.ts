import { fireEvent } from '@testing-library/react';

/**
 * jsdom has no `window.AnimationEvent`, which fools React's feature-detection
 * (it probes for vendor-prefixed style properties like `WebkitAnimation`,
 * which jsdom exposes generically) into registering `onAnimationEnd` against
 * the vendor-prefixed `webkitAnimationEnd` DOM event instead of the standard
 * `animationend`. Real browsers dispatch the standard event, so this only
 * matters here — `fireEvent.animationEnd` fires the standard event and is
 * silently swallowed under jsdom.
 */
export function fireAnimationEnd(element: Element) {
  fireEvent(element, new Event('webkitAnimationEnd', { bubbles: true }));
}
