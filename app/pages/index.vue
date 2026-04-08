<script setup lang="ts">
import { ref } from 'vue'

const colorMode = useColorMode()
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Global Toggles
const isLoading = ref(false)
const isDisabled = ref(false)
const isReadonly = ref(false)

const textValue = ref('')
const selectValue = ref('opt2')
const phoneValue = ref('')
const passValue = ref('')
const slugValue = ref('')

const selectOptions = [
  { title: 'Option 1 (Primary)', key: 'opt1', color: 'primary', icon: 'PhStar' },
  { title: 'Option 2 (Success)', key: 'opt2', color: 'success', icon: 'PhCheckCircle' },
  { title: 'Option 3 (Error)', key: 'opt3', color: 'error', icon: 'PhWarning' },
]
</script>

<template>
  <div class="min-h-screen transition-colors duration-300 bg-surface text-on-surface flex flex-col items-center py-12 gap-12">
    
    <div class="p-6 rounded-2xl border border-outline bg-surface-variant shadow-lg flex flex-col items-center gap-6 w-full max-w-4xl">
      <h1 class="text-3xl font-bold text-primary">Design System Playground</h1>
      
      <div class="flex gap-6 items-center flex-wrap justify-center">
        <button 
          @click="toggleColorMode"
          class="px-4 py-2 rounded-lg bg-surface text-on-surface border border-outline hover:bg-surface-variant-2 font-medium"
        >
          Theme: <span class="font-bold uppercase text-primary">{{ colorMode.value }}</span>
        </button>

        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" v-model="isLoading" class="w-5 h-5 accent-primary" />
          <span class="font-medium">Global Loading</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" v-model="isDisabled" class="w-5 h-5 accent-primary" />
          <span class="font-medium">Global Disabled</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" v-model="isReadonly" class="w-5 h-5 accent-primary" />
          <span class="font-medium">Global Readonly (Inputs)</span>
        </label>
      </div>
    </div>

    <div class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 px-6">
      
      <div class="flex flex-col gap-8">
        <h2 class="text-2xl font-bold text-secondary border-b border-outline pb-2">BInput Components</h2>
        
        <BInput 
          v-model="textValue" 
          title="Standard Input" 
          placeholder="Type something..." 
          icon="PhUser"
          :disabled="isDisabled"
          :readonly="isReadonly"
          caption="This is a standard text input with an icon."
        />

        <BInput 
          v-model="selectValue" 
          title="Select Dropdown" 
          type="select"
          :options="selectOptions"
          :disabled="isDisabled"
          message="Use Arrow Up/Down to navigate options!"
          color="success"
          required
        />

        <BInput 
          title="Payment Amount" 
          placeholder="0.00" 
          type="number"
          prefix="$"
          passfix="USD"
          :disabled="isDisabled"
          :readonly="isReadonly"
        />

        <BInput 
          v-model="phoneValue"
          title="Phone Number" 
          type="phone"
          placeholder="912 345 6789"
          :disabled="isDisabled"
          :readonly="isReadonly"
        />

        <BInput 
          v-model="passValue"
          title="Password" 
          type="password"
          placeholder="Enter secret..."
          :disabled="isDisabled"
          :readonly="isReadonly"
        />

        <div class="flex flex-col gap-4 mt-4">
          <BInput title="Error State" placeholder="Invalid data" color="error" message="This field is required!" />
          <BInput title="Warning State" placeholder="Careful..." color="warning" message="Caps lock is on." />
          <BInput title="Success State" placeholder="Looks good" color="success" message="Username available." />
        </div>

      </div>

      <div class="flex flex-col gap-8">
        <h2 class="text-2xl font-bold text-secondary border-b border-outline pb-2">BButton Components</h2>

        <section class="flex flex-col gap-3">
          <span class="text-sm font-bold text-neutral-500 uppercase">Primary Variants</span>
          <div class="flex items-center gap-4 flex-wrap">
            <BButton text="Fill" type="fill" color="primary" :loading="isLoading" :disabled="isDisabled" />
            <BButton text="Outline" type="outline" color="primary" :loading="isLoading" :disabled="isDisabled" />
            <BButton text="Ghost" type="ghost" color="primary" :loading="isLoading" :disabled="isDisabled" />
          </div>
        </section>

        <section class="flex flex-col gap-3">
          <span class="text-sm font-bold text-neutral-500 uppercase">Error Variants</span>
          <div class="flex items-center gap-4 flex-wrap">
            <BButton text="Fill" type="fill" color="error" :loading="isLoading" :disabled="isDisabled" />
            <BButton text="Outline" type="outline" color="error" :loading="isLoading" :disabled="isDisabled" />
            <BButton text="Ghost" type="ghost" color="error" :loading="isLoading" :disabled="isDisabled" />
          </div>
        </section>

        <section class="flex flex-col gap-3">
          <span class="text-sm font-bold text-neutral-500 uppercase">Sizes & Icons</span>
          <div class="flex items-end gap-4 flex-wrap">
            <BButton text="Extra Small" size="xs" :loading="isLoading" :disabled="isDisabled" />
            <BButton text="Small" size="sm" :loading="isLoading" :disabled="isDisabled" />
            <BButton text="Medium" left-icon="PhUser" :loading="isLoading" :disabled="isDisabled" />
            <BButton text="Large" right-icon="PhArrowRight" size="lg" :loading="isLoading" :disabled="isDisabled" />
            <BButton icon="PhHeart" color="secondary" type="fill" size="md" :loading="isLoading" :disabled="isDisabled" />
          </div>
        </section>

      </div>
    </div>
  </div>
</template>