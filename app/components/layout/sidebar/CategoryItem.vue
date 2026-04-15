<template>
    <div class=" w-full flex flex-col gap-y-1">
        <div class=" w-10 h-10 aspect-square flex items-center justify-center transition-all duration-200 ease-in-out cursor-pointer rounded-xl"
            :class="[isActive ? 'bg-primary/20' : 'bg-primary/0']">
            <BIcon :icon="routeItem.icon" class=" w-5 h-5 transition-all duration-200 ease-in-out"
                :class="[isActive ? 'fill-primary' : 'fill-on-surface/50']" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, type PropType } from 'vue';
import type { NavItem } from '~/types/components/nav-item';
export default defineComponent({
    name: 'CategoryItem',
    props: {
        routeItem: {
            type: Object as PropType<NavItem>,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {


        onMounted(()=>{
            console.log(props.routeItem)
        })
        return {

        }
    }
})
</script>