<template>
    <div class=" w-full h-full">
        Hello
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
export default defineComponent({
    name: 'CalendarGrid',
    props: {
        range: {
            type: Object as PropType<{ start: Date; end: Date } | null>,
            required: true,
        },
        mode: {
            type: String as PropType<'daily' | 'weekly' | 'monthly'>,
            default: 'monthly'
        }
    },
    setup(props) {

        return {

        }
    }
})
</script>