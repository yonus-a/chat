export type ModalState = "error" | "warning" | "success";

export interface Modal {
  /**
   * Opens the modal with the specified configuration.
   * @param title - The main heading of the modal.
   * @param description - The supporting text or body content.
   * @param color - The visual state/theme ('error', 'warning', or 'success').
   * @param action - Whether to display the primary action button (defaults to false).
   * @param actionText - Custom label for the primary action button.
   */
  openModal: (
    title: string,
    description: string,
    color: ModalState,
    action?: boolean,
    actionText?: string,
  ) => void;

  /**
   * Programmatically closes the modal and the underlying popup.
   */
  closeModal: () => void;
}
