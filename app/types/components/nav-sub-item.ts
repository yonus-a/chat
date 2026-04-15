export interface NavSubItem {
  label: string;
  icon?: string;
  to: string;
  disabled?: boolean;
  children?: NavSubItem[]; // Support for nested children
}

