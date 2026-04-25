<template>
    <div class=" py-5 w-full">
        
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { ExtendedMessage } from '~/types/chat';
import { useProfileStore } from '#imports';
export default defineComponent({
    name: 'ChatBubble',
    props: {
        message: {
            type: Object as PropType<ExtendedMessage>,
            required: true,
        },
        previousMessage: {
        }
    },
    setup(props) {
        const profileStore = useProfileStore()
        const isMine = computed(()=>props.message.senderId===profileStore.userData.)

        const formattedTime = computed(() => {
            return new Date(props.message.date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        });

        return {
            formattedTime,
        }
    }
})

</script>