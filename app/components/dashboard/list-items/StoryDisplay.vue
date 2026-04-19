<template>
    <div></div>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Story } from '~/types/story';

export default defineComponent({
    name: 'StoryDisplay',
    props: {
        story: {
            type: Object as PropType<Story>,
            required: true,
        }
    }
})
</script>