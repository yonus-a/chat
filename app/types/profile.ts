import type { Contact } from "./chat";
import type { Service } from "./service";
export type RelationTypes = "mother" | "father" | "sister" | "child" | "spouse";
export interface Profile {
  id: number;
  name: string;
  lastName: string;
  nationality: "iranian" | "foriegner";
  nationalId: string;
  email?: string | null;
  gender: "male" | "female" | null;
  imageUrl: string;
  birthDate: Date | null;
  placeOfBirth?: { provinceId: number | string; cityId: number | string } | null;
  relationShipStatus?: "single" | "married" | "divorced" | "widowed" | null;
  balance: number;
  phoneNumber: string;
  bloodType?: string;
  referral?: Referral;
}

export type UserRoleKey = "user" | "employee" | "business" | "support";

export interface RoleDetail {
  label: string;
  key: UserRoleKey;
}

export interface Referral {
  id: number;
  date: Date;
  priority: "high" | "medium" | "low";
  service: Service;
}

export interface FamilyMember extends Contact {
  relation: RelationTypes;
  isHeadOfHousehold: Boolean;
  livesWithMe: Boolean;
}
