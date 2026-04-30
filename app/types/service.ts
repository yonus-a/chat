import type { Contact } from "./chat";
import type { Invoice } from "./invoice";
import type { Clinic } from "./clinic";

export type InsitutionType = "public" | "private" | "semi-public";

export interface Fellowship {
  id: number;
  title: string;
}

export interface Provider extends Contact {
  expertise: string;
  service: Service;
  clinics: Clinic[];
  fellowships: Fellowship[];
  type: InsitutionType;
}

export interface Service {
  id: number;
  icon?: string;
  label: string;
  fellowships: Fellowship[];
  expertiseLevel: "speciality" | "sub-speciality";
  price: number;
}
