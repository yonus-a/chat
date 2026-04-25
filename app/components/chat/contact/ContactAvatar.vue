<template>
    <div class=" w-full h-full relative ">
        <BImage :src="contact.imageUrl" v-if="hasImage"
            class=" w-full h-full min-w-full rounded-full overflow-hidden min-h-full max-w-full max-h-full" />
        <div v-else class=" w-full h-full bg-primary/10 flex items-center justify-center rounded-full overflow-hidden ">
            <div class=" select-none text-primary text-sm font-semibold">{{ initials }}</div>
        </div>
        <div v-if="contact.isOnline && showOnline"
            class="absolute right-0 bottom-0 bg-primary rounded-full w-2.5 h-2.5 border-2 border-surface"></div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Contact } from '~/types/chat';

export default defineComponent({
    name: 'ChatAvatar',
    props: {
        contact: {
            type: Object as PropType<Contact>,
            required: true,
        },
        showOnline: {
            type: Boolean,
            default: true,
        }
    },
    setup(props) {
        const hasImage = computed(() => props.contact.imageUrl && props.contact.imageUrl.trim().length > 0)

        const initials = computed(() => {
            // Accessing directly from props.contact
            const first = props.contact?.name?.trim() || '';
            const last = props.contact?.lastName?.trim() || '';

            if (!first && !last) return '';

            const firstInitial = first.charAt(0);
            const lastInitial = last.charAt(0);

            // RTL Detection (Persian/Arabic range)
            const isRTL = /[\u0600-\u06FF]/.test(firstInitial);

            if (isRTL) {
                // Return with space for RTL: "ا ص"
                return lastInitial ? `${firstInitial} ${lastInitial}` : firstInitial;
            } else {
                // Return without space for English: "AS"
                return (firstInitial + lastInitial).toUpperCase();
            }
        });

        return {
            hasImage,
            initials,
        }
    }
})
</script>