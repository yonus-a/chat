<template>
    <div class=" w-dvw h-dvh flex">
        <div class=" basis-1/2">
            <BImage :src="backgroundImage" fit="cover" class=" min-w-full min-h-full max-w-full max-h-full h-full w-full"/>
        </div>
        <div class=" basis-1/2">
            <NuxtPage />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import backgroundImage from '/images/auth/auth-bg.webp'

export default defineComponent({
    name:'DashboardLayout',
    setup(){


        return{
            backgroundImage,
        }
    }
})
</script>