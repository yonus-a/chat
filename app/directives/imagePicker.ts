import type { ObjectDirective } from "vue";

const imagePickerDirective: ObjectDirective = {
  mounted(el, binding) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg, image/png, image/webp, image/gif";
    input.style.display = "none";

    // Safety: Handle null or function bindings
    const config =
      (typeof binding.value === "function"
        ? { onSelect: binding.value, multiple: false }
        : binding.value) || {};

    input.multiple = !!config.multiple;
    el.appendChild(input);

    el.addEventListener("click", () => {
      // Trigger the reset if provided in a custom hook or handled by component @click
      input.click();
    });

    input.addEventListener("change", (event) => {
      const inputElement = event.target as HTMLInputElement;
      const rawFiles = Array.from(inputElement.files || []);
      const validFiles = rawFiles.filter((f) => f.type !== "image/svg+xml");

      if (validFiles.length === 0) return;

      const processed = validFiles.map((file) => ({
        file,
        path: URL.createObjectURL(file),
      }));

      if (typeof config.onSelect === "function") {
        // --- PREDICTABLE RETURN LOGIC ---
        if (config.multiple) {
          // ALWAYS return the array if multiple is true
          config.onSelect(processed);
        } else {
          // ONLY return (path, file) for legacy/single mode
          config.onSelect(processed[0].path, processed[0].file);
        }
      }
      inputElement.value = "";
    });
  },
};

export default imagePickerDirective;
