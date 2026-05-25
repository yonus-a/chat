export interface Toast {
  openToast: (
    message: string,
    color: "success" | "error" | "warning" | "info",
    duration?: number,
  ) => void;
  closeToast: () => void;
}
