<template>
    <div class="pb-8 pt-3  flex justify-between items-center w-full">
        <div></div>
        <div class="text-label-sm select-none text-on-surface">
            {{ title }}
        </div>
        <BIcon class="rtl:rotate-0 ltr:rotate-180 fill-on-surface cursor-pointer" @click="goBack" icon="PhArrowLeft" />
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from '#imports';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'MobileNavigation',
    props: {
        title: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        const router = useRouter()

        const goBack = () => {
            router.go(-1)
        }


        return {
            goBack,
        }
    }
})
</script>