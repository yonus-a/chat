import { ref, onMounted, onUnmounted } from "vue";

export function useWindowSize() {
  const width = ref(typeof window !== "undefined" ? window.innerWidth : 1024);
  const height = ref(typeof window !== "undefined" ? window.innerHeight : 768);

  function update() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }

  onMounted(() => {
    window.addEventListener("resize", update);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  return { width, height };
}
