<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const colorMode = useColorMode()
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Global Toggles
const isLoading = ref(false)
const isDisabled = ref(false)
const hasError = ref(false)
const isRtl = ref(false)

// Value States for Selects
const singleValue = ref(['ir'])
const multipleValue = ref(['us', 'gb'])
const searchableValue = ref('')
const createValue = ref([])

// Direction Switcher Logic
watch(isRtl, (newVal) => {
  if (process.client) {
    document.documentElement.dir = newVal ? 'rtl' : 'ltr'
  }
}, { immediate: true })

onMounted(() => {
  if (process.client) {
    document.documentElement.dir = isRtl.value ? 'rtl' : 'ltr'
  }
})

const toggleRTL = () => {
  isRtl.value = !isRtl.value
}

// Mock Options
const countryOptions = [
  { label: 'Iran', value: 'ir', icon: 'PhMapPin' },
  { label: 'United States', value: 'us', icon: 'PhMapPin' },
  { label: 'United Kingdom', value: 'gb', icon: 'PhMapPin' },
  { label: 'Germany', value: 'de', icon: 'PhMapPin' },
  { label: 'France', value: 'fr', icon: 'PhMapPin' },
  { label: 'Japan', value: 'jp', icon: 'PhMapPin' },
]

const fruitOptions = [
  { label: 'Apple', value: 'apple', image: 'https://cdn-icons-png.flaticon.com/512/415/415733.png' },
  { label: 'Banana', value: 'banana', image: 'https://cdn-icons-png.flaticon.com/512/2909/2909808.png' },
  { label: 'Orange', value: 'orange', image: 'https://cdn-icons-png.flaticon.com/512/1728/1728765.png' },
  { label: 'Strawberry', value: 'strawberry', image: 'https://cdn-icons-png.flaticon.com/512/590/590685.png' },
]

const handleCreate = (val: string) => {
  const newOpt = { label: val, value: val.toLowerCase() }
  countryOptions.push(newOpt)
  if (Array.isArray(createValue.value)) {
    createValue.value.push(newOpt.value)
  }
}
</script>

<template>
  <div
    class="min-h-screen transition-colors duration-300 bg-surface text-on-surface flex flex-col items-center py-12 gap-12">
<BButton text="Hello"/>
    <div
      class="p-6 rounded-2xl border border-outline bg-surface-variant shadow-lg flex flex-col items-center gap-6 w-full max-w-4xl mx-4">
      <h1 class="text-3xl font-bold text-primary">BSelect Component Playground</h1>

      <div class="flex gap-6 items-center flex-wrap justify-center text-sm">
        <button @click="toggleColorMode"
          class="px-4 py-2 rounded-lg bg-surface text-on-surface border border-outline hover:bg-surface-variant-2 font-medium transition-colors">
          Theme: <span class="font-bold uppercase text-primary">{{ colorMode.value }}</span>
        </button>

        <button @click="toggleRTL"
          class="px-4 py-2 rounded-lg bg-surface text-on-surface border border-outline hover:bg-surface-variant-2 font-medium transition-colors">
          dir: <span class="font-bold uppercase text-primary"> {{ isRtl ? 'RTL' : 'LTR' }}</span>
        </button>

        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" v-model="isLoading" class="w-4 h-4 accent-primary" />
          <span class="font-medium">Global Loading</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" v-model="isDisabled" class="w-4 h-4 accent-primary" />
          <span class="font-medium">Global Disabled</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" v-model="hasError" class="w-4 h-4 accent-primary" />
          <span class="font-medium">Force Error State</span>
        </label>
      </div>
    </div>

    <div class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 px-6">

      <div class="flex flex-col gap-8">
        <h2 class="text-xl font-bold text-secondary border-b border-outline pb-2">Core Features</h2>

        <BSelect 
          v-model="singleValue" 
          title="Standard Single Select" 
          placeholder="Pick a country" 
          icon="PhGlobe"
          :options="countryOptions" 
          :disabled="isDisabled"
          :loading="isLoading"
          caption="Simple selection with a prefix icon." 
        />

        <BSelect 
          v-model="multipleValue" 
          title="Multiple Selection" 
          placeholder="Choose multiple..." 
          multiple
          :options="countryOptions" 
          :disabled="isDisabled"
          :loading="isLoading"
          caption="Allows picking multiple items with tag chips." 
        />

        <BSelect 
          v-model="searchableValue" 
          title="Searchable Select" 
          placeholder="Search countries..." 
          searchable
          :options="countryOptions" 
          :disabled="isDisabled"
          :loading="isLoading"
        />
        
        <BSelect 
          v-model="createValue" 
          title="Tags / Allow Create" 
          placeholder="Type to create tag..." 
          multiple 
          searchable 
          allow-create
          @create="handleCreate"
          :options="countryOptions" 
          :disabled="isDisabled"
          :loading="isLoading"
        />
      </div>

      <div class="flex flex-col gap-8">
        <h2 class="text-xl font-bold text-secondary border-b border-outline pb-2">Visuals & States</h2>

        <BSelect 
          title="Items with Images" 
          placeholder="Select a fruit" 
          :options="fruitOptions" 
          :disabled="isDisabled"
          :loading="isLoading"
        />

        <div class="flex flex-col gap-4 p-4 rounded-xl bg-surface-container/30 border border-outline/50">
          <span class="text-xs font-bold text-neutral-500 uppercase">State Variations</span>
          
          <BSelect 
            title="Error State" 
            placeholder="This has an error" 
            :has-error="true" 
            message="Please select a valid option."
            :options="countryOptions" 
          />

          <BSelect 
            title="Success State" 
            color="success"
            placeholder="Verified selection" 
            message="Configuration is valid."
            :options="countryOptions" 
          />

          <BSelect 
            title="Warning State" 
            color="warning"
            placeholder="Restricted access" 
            message="Your region might have limited features."
            :options="countryOptions" 
          />
        </div>

        <div class="p-4 rounded-xl border border-dashed border-outline bg-surface-variant/20">
          <h3 class="text-sm font-bold mb-3">Debug Info</h3>
          <div class="text-xs space-y-1 font-mono opacity-70">
            <p>Single: {{ singleValue }}</p>
            <p>Multiple: {{ multipleValue }}</p>
            <p>RTL: {{ isRtl }}</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>