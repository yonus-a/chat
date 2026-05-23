<template>
    <div></div>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Popup } from '~/types/components/popup';

export default defineComponent({
    name: 'ProfileDetailsPopup',
    props: {
        mode: {
            type: String as PropType<'full' | 'name' | 'lastName' | 'birthDate' | 'nationalCode' | 'nationality' | ''>,
            required: true,
        }
    },
    setup(props, { emit, expose }) {


        expose()

        return {

        }
    }
})
</script>