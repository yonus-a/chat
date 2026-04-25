export interface Profile {
  id: number;
  name: string;
  lastName: string;
  nationality: "iranian" | "foriegner";
  nationalId: string;
  gender: "male" | "female" | null;
  imageUrl: string;
  birthDate: Date | null;
  balance: number;
}

export type UserRoleKey = "user" | "employee" | "business" | "support";

export interface RoleDetail {
  label: string;
  key: UserRoleKey;
}
