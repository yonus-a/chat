<script setup lang="ts">
const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="min-h-screen transition-colors duration-300 bg-surface text-neutral-900 dark:text-neutral-50 flex flex-col items-center justify-center gap-6">
    
    <h1 class="text-4xl font-bold text-primary">
      Testing Theme Switching
    </h1>

    <div class="p-8 rounded-2xl border border-outline bg-surface-variant shadow-lg flex flex-col items-center gap-4">
      <p class="text-lg">
        Current Theme: <span class="font-mono font-bold uppercase">{{ colorMode.value }}</span>
      </p>

      <button 
        @click="toggleColorMode"
        class="px-6 py-3 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-all active:scale-95"
      >
        Switch to {{ colorMode.value === 'dark' ? 'Light' : 'Dark' }} Mode
      </button>
    </div>

    <div class="grid grid-cols-3 gap-4 mt-8">
      <div class="w-20 h-20 text-error bg-primary rounded-lg shadow flex items-center justify-center text-xs ">Primary</div>
      <div class="w-20 h-20 bg-secondary rounded-lg shadow flex items-center justify-center text-xs text-white">Secondary</div>
      <div class="w-20 h-20 bg-warning rounded-lg shadow flex items-center justify-center text-xs text-white">Warning</div>
    </div>
  </div>
</template>