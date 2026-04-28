<template>
    <div class=" flex items-center gap-x-5 select-none text-on-surface text-label-md">
        <div v-for="(tab, index) in tabs" :key="index" @click="setTab(index)">{{ tab }}</div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, watch } from 'vue';

export default defineComponent({
    name: 'TheTab',
    props: {
        modelValue: {
            type: Number,
            default: 0
        },
        tabs: {
            type: Array as PropType<String[]>,
            default: () => { }
        }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {

        const currentTab = ref(props.modelValue)

        watch(() => props.modelValue, () => {
            if (currentTab.value !== props.modelValue) {
                currentTab.value = props.modelValue
            }
        })

        const setTab = (index: number) => {
            emit('update:modelValue', index)
        }


        return {
            setTab,
            currentTab,
        }
    }
})
</script>