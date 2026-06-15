export interface NavSubItem {
  label: string;
  icon?: string;
  to: string;
  roles?: string[];
  disabled?: boolean;
  children?: NavSubItem[]; // Support for nested children
}
