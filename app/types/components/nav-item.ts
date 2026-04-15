import { type NavSubItem } from "./nav-sub-item";
export interface NavItem {
  key: string; 
  label: string;
  icon: string;
  to?: string;
  roles: string[];
  disabled?: boolean;
  links?: NavSubItem[];
}
