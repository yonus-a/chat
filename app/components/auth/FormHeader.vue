<template>
    <div class="pb-4 border-b-2 mb-4 border-b-outline-variant flex w-full items-center gap-x-4">
        <div class="shrink-0 w-21 aspect-square rounded-3xl flex justify-center items-center bg-diamond-primary-secondary">
            <div class="w-15 h-15">
                <BImage noLoading :src="logoImage" class="w-full min-w-full max-w-full h-full max-h-full min-h-full" />
            </div>
        </div>
        <div class="select-none text-on-surface h-full flex flex-col justify-between">
            <div class="text-head-sm">{{ title }}</div>
            <div class="text-body-md" dir="ltr">{{ description }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import logoImage from '/images/logo/logo-light.svg';

defineProps<{
    title: string;
    description: string;
}>();
</script>