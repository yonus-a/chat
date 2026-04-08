<template>
  <button
    @click="handleClick"
    :class="[
      'relative inline-grid place-items-center border-solid border-2 outline-none overflow-hidden',
      'transition-colors duration-300 ease-in-out', 
      cursorClass,
      sizeClasses,
      variantClasses
    ]"
  >
    <div 
      class="col-start-1 row-start-1 invisible flex items-center justify-center pointer-events-none select-none"
      :class="[text ? 'gap-x-2' : '']"
      aria-hidden="true"
    >
      <DIcon v-if="text && leftIcon" :icon="leftIcon" :size="iconPixelSize" class="shrink-0" />
      <DIcon v-else-if="!text && icon" :icon="icon" :size="iconPixelSize" class="shrink-0" />
      <span v-if="text" class="font-medium whitespace-nowrap">{{ text }}</span>
      <DIcon v-if="text && rightIcon" :icon="rightIcon" :size="iconPixelSize" class="shrink-0" />
    </div>

    <div class="col-start-1 row-start-1 flex items-center justify-center w-full h-full relative">
      
      <Transition 
        enter-active-class="transition-opacity duration-300 absolute"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 absolute"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="!loading" 
          class="flex items-center justify-center w-full h-full absolute inset-0"
          :class="[text ? 'gap-x-2' : '']"
        >
          <DIcon v-if="text && leftIcon" :icon="leftIcon" :size="iconPixelSize" class="fill-current shrink-0" />
          <DIcon v-else-if="!text && icon" :icon="icon" :size="iconPixelSize" class="fill-current shrink-0" />
          <span v-if="text" class="font-medium whitespace-nowrap select-none">{{ text }}</span>
          <DIcon v-if="text && rightIcon" :icon="rightIcon" :size="iconPixelSize" class="fill-current shrink-0" />
        </div>
      </Transition>

      <Transition 
        enter-active-class="transition-opacity duration-300 absolute delay-75"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 absolute"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="loading" 
          class="flex items-center justify-center w-full h-full absolute inset-0"
        >
          <DIcon icon="PhCircleNotch" class="animate-spin fill-current" :size="iconPixelSize" />
        </div>
      </Transition>

    </div>
  </button>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';

const props = defineProps({
  color: {
    type: String as PropType<'error' | 'primary' | 'secondary'>,
    default: 'primary'
  },
  type: {
    type: String as PropType<'outline' | 'fill' | 'ghost'>,
    default: 'fill'
  },
  text: {
    type: String,
    default: ''
  },
  leftIcon: {
    type: String,
    default: ''
  },
  rightIcon: {
    type: String,
    default: ''
  },
  size: {
    type: String as PropType<'lg' | 'md' | 'sm' | 'xs'>,
    default: 'md'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit('click', event);
};

const cursorClass = computed(() => {
  if (props.loading) return 'cursor-default';
  if (props.disabled) return 'cursor-not-allowed';
  return 'cursor-pointer';
});

// --- SIZING LOGIC (Enforces Square Icons + Padding) ---
const sizeClasses = computed(() => {
  const isIconOnly = !props.text;
  
  switch (props.size) {
    case 'lg':
      return [
        'rounded-[12px] text-[16px]',
        isIconOnly ? 'w-[48px] h-[48px]' : 'py-[14px] px-[24px]'
      ];
    case 'md':
      return [
        'rounded-[10px] text-[14px]',
        isIconOnly ? 'w-[40px] h-[40px]' : 'py-[10px] px-[20px]'
      ];
    case 'sm':
      return [
        'rounded-[9px] text-[12px]',
        isIconOnly ? 'w-[36px] h-[36px]' : 'py-[10px] px-[16px]'
      ];
    case 'xs':
      return [
        'rounded-[8px] text-[10px]',
        isIconOnly ? 'w-[30px] h-[30px]' : 'py-[10px] px-[12px]'
      ];
    default:
      return '';
  }
});

const iconPixelSize = computed(() => {
  switch (props.size) {
    case 'lg': return 20;
    case 'md': return 20;
    case 'sm': return 16;
    case 'xs': return 14;
    default: return 20;
  }
});

// --- VARIANT / COLOR LOGIC (-300 Active States applied) ---
const variantClasses = computed(() => {
  const t = props.type;
  const c = props.color;
  const disabled = props.disabled || props.loading;

  if (t === 'fill') {
    if (c === 'primary') {
      if (disabled) return 'bg-primary-200 border-primary-200 text-greyscale-0';
      return 'bg-primary border-primary text-greyscale-0 hover:bg-primary-600 active:bg-primary-700';
    }
    if (c === 'secondary') {
      if (disabled) return 'bg-greyscale-200 border-greyscale-200 text-greyscale-0';
      return 'bg-greyscale-900 border-greyscale-900 text-greyscale-0 hover:bg-greyscale-700 active:bg-greyscale-800';
    }
    if (c === 'error') {
      if (disabled) return 'bg-error-200 border-error-200 text-greyscale-0';
      return 'bg-error border-error text-greyscale-0 hover:bg-error-600 active:bg-error-700';
    }
  }

  if (t === 'outline') {
    if (c === 'primary') {
      if (disabled) return 'bg-transparent border-primary-200 text-primary-200';
      return 'bg-transparent border-primary text-primary hover:bg-primary-50 active:bg-primary-300 active:text-greyscale-0 active:border-primary-300';
    }
    if (c === 'secondary') {
      if (disabled) return 'bg-transparent border-greyscale-200 text-greyscale-200';
      return 'bg-transparent border-greyscale-100 text-greyscale-900 hover:bg-greyscale-50 active:bg-greyscale-300 active:text-greyscale-0 active:border-greyscale-100';
    }
    if (c === 'error') {
      if (disabled) return 'bg-transparent border-error-200 text-error-200';
      return 'bg-transparent border-error text-error hover:bg-error-20 active:bg-error-300 active:text-greyscale-0 active:border-error-300';
    }
  }

  if (t === 'ghost') {
    if (c === 'primary') {
      if (disabled) return 'bg-transparent border-transparent text-primary-200';
      return 'bg-transparent border-transparent text-primary hover:bg-primary-50 active:bg-primary-300 active:text-greyscale-0';
    }
    if (c === 'secondary') {
      if (disabled) return 'bg-transparent border-transparent text-greyscale-200';
      return 'bg-transparent border-transparent text-greyscale-900 hover:bg-greyscale-50 active:bg-greyscale-300 active:text-greyscale-0';
    }
    if (c === 'error') {
      if (disabled) return 'bg-transparent border-transparent text-error-200';
      return 'bg-transparent border-transparent text-error-500 hover:bg-error-20 active:bg-error-300 active:text-greyscale-0';
    }
  }

  return '';
});
</script>