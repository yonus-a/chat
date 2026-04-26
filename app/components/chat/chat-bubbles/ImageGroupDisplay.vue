<template>
    <Teleport to="body">
        <div @click.self="closeImage"
            :class="[isOpen ? ' md:bg-black/10 dark:md:bg-white/10 bg-black dark:bg-white md:backdrop-blur-lg pointer-events-auto' : 'md:bg-black/0 dark:md:bg-white/0 bg-black/0 dark:bg-white/0 backdrop-blur-none pointer-events-none']"
            class=" transition-all flex flex-col duration-200 ease-in-out fixed top-0 left-0 z-100 w-dvw h-dvh">

            <div class=" w-full p-3 flex justify-between items-center">
                <BIcon icon="PhX" :class="[isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0']"
                    class=" transition-all duration-200 ease-in-out shrink-0 w-6 h-6 fill-surface cursor-pointer md:fill-on-surface"
                    @click="closeImage" />
            </div>

            <div class=" w-full gap-y-6 flex-1 flex flex-col items-center justify-center overflow-hidden">
                <div @click.self="closeImage"
                    class=" w-full shrink-0 flex-1 md:flex-auto md:h-[75vh] flex justify-center items-center">

                    <div @click.self="closeImage"
                        class=" transition-all pointer-events-none duration-300 flex items-center justify-center ease-in-out overflow-hidden origin-center w-full"
                        :class="[isOpen ? 'h-full opacity-100' : 'h-0 opacity-0']">

                        <BCarousel v-if="isMobile && images.length > 0 && selectedImage !== -1" :items="images"
                            v-model="selectedImage" class="w-full h-full pointer-events-auto">
                            <template #slide="{ item }">
                                <BImage no-loading auto-aspect
                                    class="w-full md:rounded-xl overflow-hidden min-h-[50vh] min-w-dvw md:min-w-auto md:w-[70vw] h-full md:max-h-[75vh] md:h-[75vh] max-w-dvw md:max-w-[70vw] max-h-[50vh] pointer-events-none"
                                    :src="item" />
                            </template>
                        </BCarousel>

                        <BImage v-else-if="!isMobile && images.length > 0" auto-aspect
                            class="w-full md:rounded-xl overflow-hidden min-h-[50vh] min-w-dvw md:min-w-auto md:w-[70vw] h-full md:max-h-[75vh] md:h-[75vh] max-w-dvw md:max-w-[70vw] max-h-[50vh] pointer-events-auto"
                            :src="selectedImage !== -1 ? images[selectedImage] : ''" />

                    </div>
                </div>

                <div v-if="images.length > 1"
                    class=" pb-3 px-4 shrink-0 flex items-center justify-start md:justify-center transition-all duration-200 ease-in-out gap-x-3 w-full max-w-full overflow-x-auto scrollbar-hide snap-x"
                    :class="[isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']">

                    <div @click.stop="selectImage(index)"
                        class="cursor-pointer h-20 shrink-0 transition-all duration-200 ease-in-out rounded-xl overflow-hidden aspect-square border-2 snap-center"
                        :class="[selectedImage == index ? 'border-primary' : 'border-primary/0']"
                        v-for="(image, index) in images" :key="index">
                        <BImage fit="cover" :src="image" class="w-full h-full " />
                    </div>

                </div>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts">
import { defineComponent, type PropType, onUnmounted, onMounted, ref, watch, computed } from 'vue';
import { useWindowSize } from '#imports';
import BCarousel from '~/components/global/BCarousel.vue';

export default defineComponent({
    name: 'ImageDisplay',
    components: { BCarousel },
    props: {
        images: {
            type: Array as PropType<String[]>,
            default: () => []
        }
    },
    setup(props, { expose }) {
        const isOpen = ref(false);
        const selectedImage = ref(0);

        // Mobile Breakpoint Check
        const { width } = useWindowSize();
        const isMobile = computed(() => width.value < 768);

        watch(() => props.images, (newImages) => {
            if (selectedImage.value >= newImages.length) {
                selectedImage.value = 0;
            }
        });

        // --- Core Download Feature ---
        const downloadImage = async () => {
            if (selectedImage.value === -1 || !props.images[selectedImage.value]) return;
            const url = props.images[selectedImage.value] as string;

            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = url.split('/').pop() || 'dope-image.jpg';
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error("Failed to download image:", error);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen.value) closeImage();
            if (e.key === 'ArrowRight' && isOpen.value && selectedImage.value < props.images.length - 1) {
                selectedImage.value++;
            }
            if (e.key === 'ArrowLeft' && isOpen.value && selectedImage.value > 0) {
                selectedImage.value--;
            }
        };

        const handlePopState = () => {
            if (isOpen.value) isOpen.value = false;
        };

        const openImage = (index: number) => {
            selectedImage.value = index;
            isOpen.value = true;
            window.history.pushState({ viewerOpen: true }, '');
            window.addEventListener('popstate', handlePopState);
        };

        const closeImage = () => {
            if (!isOpen.value) return;
            isOpen.value = false;
            window.removeEventListener('popstate', handlePopState);
            if (window.history.state?.viewerOpen) {
                window.history.back();
            }
            setTimeout(() => {
                selectedImage.value = -1;
            }, 300);
        };

        onMounted(() => window.addEventListener('keydown', handleKeyDown));
        onUnmounted(() => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('popstate', handlePopState);
            if (isOpen.value && window.history.state?.viewerOpen) {
                window.history.back();
            }
        });

        expose({
            open: (index: number) => { openImage(index) },
            close: () => { closeImage() },
            download: () => { downloadImage() }
        });

        return {
            isOpen,
            selectedImage,
            closeImage,
            openImage,
            selectImage: (index: number) => { selectedImage.value = index },
            downloadImage,
            isMobile
        };
    }
});
</script>