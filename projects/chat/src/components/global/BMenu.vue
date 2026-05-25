<template>
  <div ref="menuRef" class="b-menu">
    <div class="b-menu__trigger" @click="toggle">
      <slot name="trigger" />
    </div>
    <Transition name="menu">
      <div
        v-if="isOpen"
        v-click-outside="close"
        class="b-menu__content"
        :class="[`b-menu--${position}`]"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

withDefaults(
  defineProps<{
    position?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  }>(),
  {
    position: "bottom-end",
  },
);

const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

function toggle() {
  isOpen.value = !isOpen.value;
}

function close() {
  isOpen.value = false;
}

const vClickOutside = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    const handler = (event: Event) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (!el.contains(target) && !menuRef.value?.contains(target)) {
        binding.value();
      }
    };

    (el as HTMLElement & { __clickOutside?: (event: Event) => void }).__clickOutside = handler;
    document.addEventListener("click", handler);
  },
  unmounted(el: HTMLElement) {
    const element = el as HTMLElement & { __clickOutside?: (event: Event) => void };
    if (element.__clickOutside) {
      document.removeEventListener("click", element.__clickOutside);
      delete element.__clickOutside;
    }
  },
};

defineExpose({ close, toggle, isOpen });
</script>

<style scoped>
.b-menu {
  position: relative;
  display: inline-flex;
}

.b-menu__trigger {
  cursor: pointer;
}

.b-menu__content {
  position: absolute;
  z-index: var(--chat-z-dropdown);
  min-width: 180px;
  background: var(--chat-surface);
  border: 1px solid var(--chat-border);
  border-radius: var(--chat-radius-md);
  box-shadow: var(--chat-shadow-md);
  padding: var(--chat-spacing-xs);
}

.b-menu--bottom-start { top: 100%; left: 0; margin-top: var(--chat-spacing-xs); }
.b-menu--bottom-end { top: 100%; right: 0; margin-top: var(--chat-spacing-xs); }
.b-menu--top-start { bottom: 100%; left: 0; margin-bottom: var(--chat-spacing-xs); }
.b-menu--top-end { bottom: 100%; right: 0; margin-bottom: var(--chat-spacing-xs); }

.menu-enter-active, .menu-leave-active {
  transition: all var(--chat-transition-fast);
}
.menu-enter-from, .menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
