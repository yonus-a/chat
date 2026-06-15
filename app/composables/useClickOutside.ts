import { onMounted, onUnmounted,type Ref } from 'vue'

export const useClickOutside = (elRef: Ref<HTMLElement | null>, callback: () => void) => {
  const listener = (event: MouseEvent) => {
    if (!elRef.value || elRef.value.contains(event.target as Node)) {
      return
    }
    callback()
  }

  onMounted(() => {
    document.addEventListener('click', listener)
  })

  onUnmounted(() => {
    document.removeEventListener('click', listener)
  })
}