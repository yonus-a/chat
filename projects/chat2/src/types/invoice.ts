export interface Invoice {
  id: number;
  amount: number;
  date: Date;
  serviceId: number;
  status: "pending" | "approved" | "rejected" | "expired";
}
