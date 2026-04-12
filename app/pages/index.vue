<template>
  <div class="p-10 flex flex-col gap-y-12 bg-surface min-h-screen">
    
    <section class="flex flex-col gap-y-6">
      <h2 class="text-head-sm text-on-surface">Buttons (Native PrimeVue)</h2>
      <Button label="Verify" />

      <div class="flex flex-wrap gap-4 items-center">
        <Button label="Primary Fill" severity="primary" />
        <Button label="Secondary Fill" severity="secondary" />
        <Button label="Danger Fill" severity="error" />
        <Button label="Warning Fill" severity="warning" />
        <Button label="Loading State" loading />
        <Button label="Disabled" disabled />
      </div>

      <div class="flex flex-wrap gap-4 items-center">
        <Button label="Primary Outline" severity="primary" outlined />
        <Button label="Secondary Outline" severity="secondary" outlined />
        <Button label="Danger Outline" severity="danger" outlined />
        <Button label="Warning Outline" severity="warning" outlined />
      </div>

      <div class="flex flex-wrap gap-4 items-center">
        <Button label="Primary Ghost" severity="primary" text />
        <Button label="Secondary Ghost" severity="secondary" text />
        <Button label="Danger Ghost" severity="danger" text />
        <Button label="Warning Ghost" severity="warning" text />
      </div>

      <div class="flex flex-wrap gap-4 items-end">
        <Button label="Large" size="large" />
        <Button label="Normal" />
        <Button label="Small" size="small" />
      </div>

      <div class="flex flex-wrap gap-4 items-center">
        <Button icon="PhPlus" label="With Icon" />
        <Button icon="PhHeart" rounded /> </div>
    </section>

    <section class="flex flex-col gap-y-6 max-w-sm">
      <h2 class="text-head-sm text-on-surface">Inputs (Native PrimeVue)</h2>
      
      <div class="flex flex-col gap-y-4">
        <label class="text-label-sm text-on-surface">Standard Input</label>
        <InputText v-model="text1" placeholder="Type something..." />

        <label class="text-label-sm text-on-surface">Invalid State</label>
        <InputText v-model="text2" invalid placeholder="Error state..." />

        <label class="text-label-sm text-on-surface">Disabled Input</label>
        <InputText v-model="text3" disabled placeholder="Can't touch this" />
      </div>
    </section>

    <section class="flex flex-col gap-y-6 max-w-sm">
      <h2 class="text-head-sm text-on-surface">Dropdowns (Native PrimeVue)</h2>
      
      <div class="flex flex-col gap-y-4">
        <label class="text-label-sm text-on-surface">Single Select</label>
        <Select 
          v-model="selectedCity" 
          :options="cities" 
          optionLabel="name" 
          placeholder="Select a City" 
          class="w-full"
        />

        <label class="text-label-sm text-on-surface">Invalid Select</label>
        <Select 
          v-model="selectedCity2" 
          :options="cities" 
          optionLabel="name" 
          invalid 
          placeholder="Select with error" 
          class="w-full"
        />
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const text1 = ref('');
const text2 = ref('');
const text3 = ref('Disabled value');

const selectedCity = ref();
const selectedCity2 = ref();
const cities = ref([
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
]);
</script>

<style>
/* Optional: Add Phosphor Icons support if using strings for icons.
  Since you mentioned @phosphor-icons/vue in your package.json, 
  ensure they are available globally or imported.
*/
</style>