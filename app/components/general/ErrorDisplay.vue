<template>
    <div class=" w-full overflow-hidden h-5">
        <div class="flex items-center gap-x-1.5 transition-all duration-200 ease-in-out"
            :class="[error !== '' ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0']">
            <BIcon icon="PhWarningCircle" class="w-5 h-5 fill-error shrink-0" />
            <span class="text-xs text-error select-none">{{ localError }}</span>
        </div>
    </div>
</template>
<script lang="ts">
import { watch, defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'ErrorDisplay',
    props: {
        error: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        const localError = ref(props.error);

        watch(() => props.error, () => {
            if (props.error.trim().length === 0) {
                setTimeout(() => {
                    localError.value = props.error
                }, 200)
            } else {
                localError.value = props.error
            }
        })


        return {
            localError,
        }
    }
})
</script>