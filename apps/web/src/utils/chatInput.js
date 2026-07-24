export const isImeKeyEvent = (event) =>
  Boolean(event?.isComposing || event?.keyCode === 229);
