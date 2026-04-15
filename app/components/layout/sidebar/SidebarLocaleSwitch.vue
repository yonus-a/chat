<template>
    <div class=" w-full aspect-square flex items-center justify-center">
        <div class=" w-5 h-5 rounded-full overflow-hidden">
            <BImage class=" w-full h-full min-w-full min-h-full " fit="cover" :src="flagUrl" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useLocale } from '#imports';
export default defineComponent({
    name: 'SidebarLocaleSwitch',
    setup() {

        const { flagUrl } = useLocale()

        return {
            flagUrl
        }
    }
})
</script>