<template>
    <div>Hello Chat</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n, useSeoMeta } from '#imports';
definePageMeta({
    layout: 'dashboard'
})

export default defineComponent({
    name: 'ChatPage',
    setup() {
        const { t } = useI18n()


        useSeoMeta({
            title: () => t('seo.dashboard.chat.title'),
            description: () => t('seo.dashboard.chat.description'),
            ogTitle: () => `${t('seo.siteName')} - ${t('seo.dashboard.chat.title')}`,
        });

        return {

        }
    }
})
</script>