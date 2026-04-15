<template>
    <div class=" w-full  h-full">
        <NuxtPage />
    </div>
</template>

<script lang="ts">


definePageMeta({
    layout: 'dashboard'
})

export default defineComponent({
    name: 'DashboardPageBase',

})
</script>