/**
 * Override CSS custom properties for the chat theme.
 * Pass a partial record of variable names (without the -- prefix) to values.
 *
 * @example
 * setChatTheme({
 *   'chat-primary': '#ff6600',
 *   'chat-bubble-mine': '#ff6600',
 *   'chat-bg': '#1a1a2e',
 *   'chat-text': '#eaeaea',
 * });
 */
export function setChatTheme(
  vars: Record<string, string>,
  target: HTMLElement = document.documentElement,
) {
  for (const [key, value] of Object.entries(vars)) {
    const prop = key.startsWith("--") ? key : `--${key}`;
    target.style.setProperty(prop, value);
  }
}

/**
 * Reset all chat theme variables to their default values.
 */
export function resetChatTheme(target: HTMLElement = document.documentElement) {
  const styles = target.style;
  for (let i = styles.length - 1; i >= 0; i--) {
    const prop = styles[i];
    if (prop.startsWith("--chat-")) {
      target.style.removeProperty(prop);
    }
  }
}
