import { ref } from "vue";

export interface Toast {
  message: string;
  type: "success" | "error" | "warning" | "info";
  id: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useAppToast() {
  function openToast(
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    duration: number = 3000,
  ) {
    const id = nextId++;
    toasts.value.push({ message, type, id });

    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  }

  function closeToast(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, openToast, closeToast };
}
