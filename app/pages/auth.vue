<template>
    <div class=" w-full flex flex-col items-center gap-y-16 h-full">
        <div></div>
    </div>
</template>

<script lang="ts">
import LocaleSwitch from '~/components/general/LocaleSwitch.vue';
import ThemeSwitch from '~/components/general/ThemeSwitch.vue';

definePageMeta({
    layout: 'dashboard'
})

export default defineComponent({
    name: 'AuthBasePage',
    components: {
        ThemeSwitch,
        LocaleSwitch,
    }
})
</script>