<template>
    <div @click="toggleMenu" class=" px-2.5 py-3 select-none cursor-pointer flex items-center gap-x-2">
        <div class=" select-none cursor-pointer rounded-full overflow-hidden w-5 h-5">
            <div class=" w-full h-full rounded-full bg-primary"></div>
        </div>
        <div class=" select-none text-body-sm text-on-surface">{{ currentRole?.label }}</div>
        <div :class="[!isOpen ? '  rotate-0' : 'rotate-180']"
            class=" w-5 h-5 flex items-center justify-center transition-all duration-200 ease-in-out">
            <BIcon icon="PhCaretDown" class=" w-5 h-5 fill-on-surface/50" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useProfileStore } from '#imports';
export default defineComponent({
    name: 'RoleSwitcher',
    setup() {
        const profileStore = useProfileStore()
        const currentRole = computed(() => profileStore.currentRole)
        const isOpen = ref(false)

        const toggleMenu = () => {
            isOpen.value = !isOpen.value
        }

        const openMenu = () => {
            isOpen.value = true;
        }

        const closeMenu = () => {
            isOpen.value = false;
        }

        const selectRole = () => {

        }

        return {
            currentRole,
            isOpen,
            toggleMenu,
        }
    }
})
</script>