<template>
    <div class="flex flex-col w-full h-dvh bg-surface">
        <div class="w-full shrink-0 h-16 flex justify-between items-center px-5 border-b border-b-outline-variant">
            <div class="w-5"></div>

            <div class="select-none text-on-surface text-label-lg font-bold">
                {{ headerTitle ? t(headerTitle) : '' }}
            </div>

            <BIcon v-if="showBack" :icon="backIcon || 'PhArrowLeft'" class="cursor-pointer w-6 h-6 fill-on-surface"
                @click="handleBack" />
            <div v-else class="w-6"></div>
        </div>

        <div class="w-full flex-1 overflow-hidden">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n, useLocalePath } from '#imports';
const localePath = useLocalePath()
const props = defineProps<{
    headerTitle?: string;
    backPath?: string;
    backIcon?: string;
    showBack?: boolean;
}>();

const { t } = useI18n();
const router = useRouter();

const handleBack = () => {
    if (props.backPath) {
        router.push(localePath(props.backPath));
    } else {
        router.go(-1);
    }
};
</script>