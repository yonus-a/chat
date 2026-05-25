
export const inputTypes = ['password', 'number','slug', 'text', 'phone'] as const;
export const inputColors = ['primary', 'error', 'success', 'warning'] as const;
export const enterKeyHints = ['search', 'go', 'done', 'next', 'send', 'enter'] as const;

// Add this array for the validator
export const autocompleteValues = [
    'on', 'off', 'name', 'email', 'username', 
    'new-password', 'current-password', 'tel', 
    'street-address', 'postal-code'
] as const;

export type InputType = typeof inputTypes[number];
export type InputColor = typeof inputColors[number];
export type EnterKeyHint = typeof enterKeyHints[number];

// Use the array to derive the type, but allow (string & {}) to keep it open-ended for custom fields
export type Autocomplete = typeof autocompleteValues[number] | (string & {});

export interface Input {
  focus: () => void;
  blur: () => void;
}