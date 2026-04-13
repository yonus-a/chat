<template>
    <div id="image" :class="[
        'overflow-hidden relative transition-all duration-500 ease-in-out',
        autoSize ? 'w-auto h-auto' : 'w-full h-full'
    ]">
        <div :style="fitToContent ? { height: elementHeight + 'px' } : {}" :class="[
            'w-full transition-all duration-500 ease-in-out flex justify-center items-center',
            autoSize ? 'relative' : 'absolute inset-0 h-full',
            showImage ? 'bg-transparent animate-none' : !noLoading ? 'bg-black/20 animate-pulse' : '',
        ]">
            <NuxtImg :alt="alt" @load="loadImage" :src="displayedImage" :class="[
                'select-none transition-all duration-500 ease-in-out',
                autoSize ? 'w-full h-auto block' : 'w-full h-full',
                imageFitContentStyle,
                showImage ? ' opacity-100' : ' opacity-0',
            ]" />
        </div>

        <div :title="title" :class="[
            'absolute inset-0 flex z-10 justify-center items-center pointer-events-none',
            autoSize ? 'h-full' : ''
        ]">
            <div class="relative w-full h-full pointer-events-auto">
                <div ref="content" :class="['content', fitToContent ? '' : 'w-full h-full']">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, onMounted, watch, ref, computed } from 'vue'

export default defineComponent({
    name: 'DopeImage',
    props: {
        src: {
            type: String,
            default: '',
        },
        title: {
            type: String,
            default: '',
        },
        alt: {
            type: String,
            default: '',
        },
        fit: {
            type: String,
            default: 'fit',
        },
        fitToContent: {
            type: Boolean,
            default: false,
        },
        hasFade: {
            type: Boolean,
            default: false,
        },
        noLoading: {
            type: Boolean,
            default: false
        },
        autoSize: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const isLoaded = ref(false)
        const loadImage = () => {
            isLoaded.value = true
        }
        const imageTransitionComplete = ref(true)
        const currentImage = computed(() => {
            return props.src
        })
        const content = ref<HTMLElement | null>(null)
        const elementHeight = ref(0)
        const displayedImage = ref(props.src)

        let resizeObserver: ResizeObserver | null = null

        const updateElementHeight = () => {
            if (content.value) {
                elementHeight.value = content.value.offsetHeight - 13
            }
        }

        onMounted(() => {
            if (content.value) {
                resizeObserver = new ResizeObserver(updateElementHeight)
                resizeObserver.observe(content.value)
            }
            updateElementHeight()
        })

        onUnmounted(() => {
            if (resizeObserver && content.value) {
                resizeObserver.unobserve(content.value)
                resizeObserver.disconnect()
            }
        })

        watch(currentImage, (newImage, oldImage) => {
            if (props.hasFade) {
                isLoaded.value = false
                imageTransitionComplete.value = false
                setTimeout(() => {
                    imageTransitionComplete.value = true
                    displayedImage.value = props.src
                    updateElementHeight()
                }, 200)
            } else {
                displayedImage.value = props.src
                updateElementHeight()
            }
        })

        const imageFitContentStyle = computed(() => {
            return 'object-' + props.fit
        })

        const showImage = computed(() => {
            return isLoaded.value && props.src !== '' && imageTransitionComplete.value
        })

        return {
            loadImage,
            showImage,
            imageFitContentStyle,
            elementHeight,
            imageTransitionComplete,
            displayedImage,
            content,
        }
    },
})
</script>