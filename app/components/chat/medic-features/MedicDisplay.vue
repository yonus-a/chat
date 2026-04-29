<template>
    <div class=" w-full px-3 gap-x-2 flex justify-between rounded-xl transition-all duration-200 ease-in-out items-center cursor-pointer"
        :class="[isSelected ? ' bg-surface-variant' : ' bg-surface-variant/0']">
        <div v-loading="loading" :class="[loading ? ' rounded-full overflow-hidden' : ' rounded-none overflow-visible']"
            class=" w-10 h-10 shrink-0 ">
            <ContactAvatar :contact="medic" />
        </div>
        <div class="flex justify-center flex-col flex-1 select-none h-full">
            <div class=" text-label-md text-on-surface " v-loading="loading">{{ medic.name }} {{ medic.lastName }}</div>
            <div class=" text-body-sm text-on-surface/50" v-loading="loading">{{ expertise }}</div>
        </div>
        <div class=" shrink-0 w-5  flex flex-col items-center justify-center h-full">
            <div class="w-5 h-5 rounded-full overflow-hidden">
                <div class=" w-full h-full " v-loading="loading">
                    <div :class="[isSelected ? 'scale-100 opacity-100' : 'opacity-0 scale-0']"
                        class=" transition-all duration-200 ease-in-out w-full bg-primary h-full rounded-full flex items-center justify-center overflow-hidden">
                        <div class=" w-2.5 h-2.5 bg-surface rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Contact } from '~/types/chat';
import ContactAvatar from '../contact/ContactAvatar.vue';
export default defineComponent({
    name: 'MedicDisplay',
    props: {
        medic: {
            type: Object as PropType<Contact>,
            required: true,
        },
        expertise: {
            type: String,
            default: ''
        },
        isSelected: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: true,
        }
    },
    components: {
        ContactAvatar,
    },
    setup() {

        return {

        }
    }
})
</script>