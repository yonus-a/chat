<template>
    <div class=" w-100 aspect-square">
        <div>Form Bitch</div>
        <MapBox />
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import { useI18n } from '#imports';
import type { Address } from '~/types/address';
import MapBox from './MapBox.vue';
export default defineComponent({
    name: 'AddressForm',
    props: {
        address: {
            type: Object as PropType<Address>,
            default: () => { }
        }
    },
    components: {
        MapBox,
    },
    setup(props, { emit }) {
        const { t } = useI18n()


        return {
            t,
        }
    }
})
</script>