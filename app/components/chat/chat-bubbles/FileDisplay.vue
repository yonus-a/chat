<template>
    <div class=" w-full flex gap-x-2 select-none cursor-pointer">
        <div class=" flex flex-col gap-y-0.5">
            <div class=" text-on-surface text-label-md">File Name</div>
            <div class=" text-body-sm text-on-surface">300Kb</div>
        </div>
        <div class=" relative" v-if="isDownloaded || !isDownloading">
            <BIcon icon="PhFile" class=" fill-white w-10 h-10" weight="fill" />
            <div class=" absolute bottom-2 right-1 bg-error rounded-sm p-1 flex items-center justify-center ">
                <div class="text-center text-white  text-[6px] leading-1.5">PDF</div>
            </div>
        </div>
        <div v-else class=" w-10 h-10 relative cursor-pointer" @click="toggleDownload">
            <BIcon weight="thin" icon="PhCircleNotch" class=" animate-spin w-10 h-10 fill-on-surface/50" />
            <div class=" absolute top-0 left-0 w-full h-full flex items-center justify-center ">
                <BIcon icon="PhArrowDown" class=" w-4 h-4 fill-on-surface" />
            </div>
        </div>

    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'FileDisplay',
    props: {
        url: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        const isDownloaded = ref(false)
        const isDownloading = ref(true)

        const toggleDownload = () => {

        }

        return {
            isDownloading,
            toggleDownload,
            isDownloaded,
        }
    }
})
</script>