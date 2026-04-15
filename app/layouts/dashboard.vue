<template>
    <div class=" bg-surface w-dvw h-dvh flex items-center">
        <div class=" shrink-0 h-full">
            <SideBar />
        </div>
        <div class=" flex-1 h-full">
            <NuxtPage />
        </div>
    </div>
</template>
<script lang="ts" setup>
import SideBar from '~/components/layout/SideBar.vue';


</script>