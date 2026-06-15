<template>
<button
    @click="handleClick"
    class="b-btn"
    :class="[`b-btn--${type}`,'select-none', { 'is-disabled': disabled , 'is-loading': loading }]"
    :style="buttonStyle"
  >

    <div class="b-btn__ghost-layer" aria-hidden="true">
      <BIcon v-if="text && leftIcon" :icon="leftIcon" :size="currentIconSize" class="shrink-0" />
      <BIcon v-else-if="!text && icon" :icon="icon" :size="currentIconSize" class="shrink-0" />
      <span v-if="text" class="whitespace-nowrap font-medium">{{ text }}</span>
      <BIcon v-if="text && rightIcon" :icon="rightIcon" :size="currentIconSize" class="shrink-0" />
    </div>

    <div class="b-btn__content-wrapper">
      <Transition name="fade">
        <div v-if="!loading" class="b-btn__content absolute inset-0">
          <BIcon v-if="text && leftIcon" :icon="leftIcon" :size="currentIconSize" class="fill-current shrink-0" />
          <BIcon v-else-if="!text && icon" :icon="icon" :size="currentIconSize" class="fill-current shrink-0" />
          <span v-if="text" class="whitespace-nowrap font-medium">{{ text }}</span>
          <BIcon v-if="text && rightIcon" :icon="rightIcon" :size="currentIconSize" class="fill-current shrink-0" />
        </div>
      </Transition>

      <Transition name="fade-delay">
        <div v-if="loading" class="b-btn__loading absolute inset-0">
          <BIcon icon="PhCircleNotch" class="animate-spin fill-current" :size="currentIconSize" />
        </div>
      </Transition>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';

/* =========================================================================
   BUTTON CONFIGURATION OBJECT
   Maps strict gradients, solid fallbacks, and exact border/opacity rules
   ========================================================================= */

// 1. Color Palette Definitions based on your rules
const COLOR_MAP: Record<string, any> = {
  primary: {
    fillBgImage: 'var(--background-image-diamond-primary-secondary)',
    fillBgColor: 'var(--color-primary)', // Base color fallback
    fillBorder: 'var(--color-primary)',
    fillText: 'var(--color-on-primary)',
    text: 'var(--color-primary)'
  },
  error: {
    fillBgImage: 'var(--background-image-diamond-error)',
    fillBgColor: 'var(--color-error)',
    fillBorder: 'var(--color-error)',
    fillText: 'var(--color-on-error)',
    text: 'var(--color-error)'
  },
  secondary: {
    fillBgImage: 'none',
    fillBgColor: 'var(--color-surface-variant-2)',
    fillBorder: 'var(--color-surface-variant-2)',
    fillText: 'var(--color-on-surface)',
    text: 'var(--color-secondary)'
  }
};

const BUTTON_CONFIG = {
  // SIZING CONFIGURATION
  sizes: {
    lg: { px: '24px', py: '14px', radius: '12px', fontSize: 'var(--text-label-lg)', iconOnly: '48px', iconSize: 20 },
    md: { px: '20px', py: '10px', radius: '10px', fontSize: 'var(--text-label-md)', iconOnly: '40px', iconSize: 20 },
    sm: { px: '16px', py: '10px', radius: '9px', fontSize: '12px', iconOnly: '36px', iconSize: 20 },
    xs: { px: '12px', py: '10px', radius: '8px', fontSize: '10px', iconOnly: '30px', iconSize: 14 }
  },

  // FOCUS STATE
  focus: { width: '3px', offset: '2px' },

  // VARIANTS
  variants: {
    fill: (c: string) => {
      const map = COLOR_MAP[c] || COLOR_MAP.primary;
      return {
        base: { bgImage: map.fillBgImage, bg: map.fillBgColor, text: map.fillText, border: map.fillBorder, opacity: '1' },
        hover: { bgImage: map.fillBgImage, bg: map.fillBgColor, text: map.fillText, border: map.fillBorder, opacity: '1' },
        active: { bgImage: map.fillBgImage, bg: map.fillBgColor, text: map.fillText, border: map.fillBorder, opacity: '1' },
        disabled: { bgImage: map.fillBgImage, bg: map.fillBgColor, text: map.fillText, border: map.fillBorder, opacity: '0.65' } // 65% opacity requested
      }
    },
   outline: (c: string) => {
      const map = COLOR_MAP[c] || COLOR_MAP.primary;
      return {
        base:     { bgImage: 'none', bg: 'transparent',                    text: map.text, border: 'var(--color-outline)', opacity: '1' },
        hover:    { bgImage: 'none', bg: 'var(--color-surface-variant-3)', text: map.text, border: map.text,               opacity: '1' },
        active:   { bgImage: 'none', bg: 'var(--color-outline)',           text: map.text, border: map.text,               opacity: '1' },
        disabled: { bgImage: 'none', bg: 'transparent',                    text: map.text, border: 'var(--color-outline)', opacity: '0.5' }
      }
    },
    ghost: (c: string) => {
      const map = COLOR_MAP[c] || COLOR_MAP.primary;
      return {
        base:     { bgImage: 'none', bg: 'transparent',                    text: map.text, border: 'transparent', opacity: '1' },
        hover:    { bgImage: 'none', bg: 'var(--color-surface-variant-3)', text: map.text, border: 'transparent', opacity: '1' },
        active:   { bgImage: 'none', bg: 'var(--color-outline)',           text: map.text, border: 'transparent', opacity: '1' },
        disabled: { bgImage: 'none', bg: 'transparent',                    text: map.text, border: 'transparent', opacity: '0.5' }
      }
    }
  }
};

/* --- PROPS --- */
const props = defineProps({
  color: { type: String as PropType<'primary' | 'secondary' | 'error' | 'warning'>, default: 'primary' },
  type: { type: String as PropType<'fill' | 'outline' | 'ghost'>, default: 'fill' },
  size: { type: String as PropType<'lg' | 'md' | 'sm' | 'xs'>, default: 'md' },
  text: { type: String, default: '' },
  leftIcon: { type: String, default: '' },
  rightIcon: { type: String, default: '' },
  icon: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['click']);

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return event.preventDefault();
  emit('click', event);
};

const isIconOnly = computed(() => !props.text && (props.icon || props.leftIcon));
const currentIconSize = computed(() => BUTTON_CONFIG.sizes[props.size].iconSize);

/* --- COMPUTED CSS VARIABLES INJECTOR --- */
const buttonStyle = computed(() => {
  const size = BUTTON_CONFIG.sizes[props.size];
  const variantMap = BUTTON_CONFIG.variants[props.type](props.color);

  return {
    '--b-pad-inline': isIconOnly.value ? '0' : size.px,
    '--b-pad-block': isIconOnly.value ? '0' : size.py,
    '--b-width': isIconOnly.value ? size.iconOnly : 'auto',
    '--b-height': isIconOnly.value ? size.iconOnly : 'auto',
    '--b-radius': size.radius,
    '--b-font-size': size.fontSize,

    '--b-focus-width': BUTTON_CONFIG.focus.width,
    '--b-focus-offset': BUTTON_CONFIG.focus.offset,
    '--b-focus-color': `var(--color-${props.color})`,

    // Dynamic Variables 
    '--b-bg-image': variantMap.base.bgImage,
    '--b-bg-color': variantMap.base.bg,
    '--b-text': variantMap.base.text,
    '--b-border': variantMap.base.border,
    '--b-opacity': variantMap.base.opacity,

    '--b-hover-bg-color': variantMap.hover.bg,
    '--b-hover-text': variantMap.hover.text,
    '--b-hover-border': variantMap.hover.border,

    '--b-active-bg-color': variantMap.active.bg,
    '--b-active-text': variantMap.active.text,
    '--b-active-border': variantMap.active.border,

    '--b-disabled-bg-color': variantMap.disabled.bg,
    '--b-disabled-text': variantMap.disabled.text,
    '--b-disabled-border': variantMap.disabled.border,
    '--b-disabled-opacity': variantMap.disabled.opacity,
  };
});
</script>

<style scoped>
.b-btn {
  position: relative;
  display: inline-grid;
  place-items: center;
  box-sizing: border-box;
  /* Ensures borders are 1px INSIDE the div */
  transition: all 0.3s ease-in-out;
  cursor: pointer;
  overflow: hidden;

  /* Strict 1px border rule applied here */
  border-width: 1px;
  border-style: solid;

  padding-inline: var(--b-pad-inline);
  padding-block: var(--b-pad-block);
  width: var(--b-width);
  height: var(--b-height);
  border-radius: var(--b-radius);
  font-size: var(--b-font-size);

  /* Apply Gradients and Solid Colors */
  background-image: var(--b-bg-image);
  background-color: var(--b-bg-color);
  color: var(--b-text);
  border-color: var(--b-border);
  opacity: var(--b-opacity);
  --b-hover-overlay: rgba(0, 0, 0, 0.1);
}

.b-btn:focus-visible {
  outline: var(--b-focus-width) solid var(--b-focus-color);
  outline-offset: var(--b-focus-offset);
}

/* Base Light/Dark Hover Overlays */
:where(.dark) .b-btn {
  --b-hover-overlay: rgba(255, 255, 255, 0.1); /* White/10 */
}

/* =========================================================
   FIX 1: SMOOTH ANIMATION FOR FILL GRADIANT OVERLAY
   ========================================================= */
.b-btn--fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--b-hover-overlay);
  opacity: 0; /* Hidden by default */
  transition: opacity 0.3s ease-in-out; /* Smooth fade in/out */
  pointer-events: none;
  z-index: 1;
}

.b-btn--fill:hover:not(.is-disabled)::after {
  opacity: 1; /* Fade in smoothly on hover */
}

/* Ensure content stays above the overlay */
.b-btn__content-wrapper {
  z-index: 2;
}


/* =========================================================
   FIX 2: GLOBAL HOVER / ACTIVE STATES (Outline & Ghost)
   ========================================================= */
.b-btn:hover:not(.is-disabled) {
  background-color: var(--b-hover-bg-color);
  color: var(--b-hover-text);
  border-color: var(--b-hover-border);
}

.b-btn:active:not(.is-disabled) {
  background-color: var(--b-active-bg-color);
  color: var(--b-active-text);
  border-color: var(--b-active-border);
  transition: all 0.1s ease-out; /* Snappy press effect */
}

/* Add brightness press effect specifically to fill mode */
.b-btn--fill:active:not(.is-disabled) {
  filter: brightness(0.9);
  transition: filter 0.1s ease-out;
}

/* Disabled State */
.b-btn.is-disabled {
  cursor: not-allowed;
  background-color: var(--b-disabled-bg-color);
  color: var(--b-disabled-text);
  border-color: var(--b-disabled-border);
  opacity: var(--b-disabled-opacity);
}

/* --- INNER LAYERS --- */
.b-btn__ghost-layer {
  grid-column: 1; grid-row: 1; visibility: hidden;
  display: flex; align-items: center; gap: 8px; pointer-events: none;
}
.b-btn__content-wrapper {
  grid-column: 1; grid-row: 1; position: relative;
  display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;
}
.b-btn__content, .b-btn__loading {
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 100%;
}

/* --- TRANSITIONS --- */
.fade-enter-active, .fade-leave-active, .fade-delay-enter-active {
  transition: opacity 0.3s ease; position: absolute;
}
.fade-delay-enter-active { transition-delay: 0.1s; }
.fade-enter-from, .fade-leave-to, .fade-delay-enter-from { opacity: 0; }
.fade-enter-to, .fade-leave-from, .fade-delay-enter-to { opacity: 100; }
</style>