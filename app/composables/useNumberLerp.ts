import { ref, watch, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue';

export function useNumberLerp(
    targetValue: Ref<number> | ComputedRef<number>,
    isLoaded: Ref<boolean> | ComputedRef<boolean>,
    containerRef?: Ref<HTMLElement | null>,
    duration: number = 400
) {
    const animatedValue = ref(0);
    const hasTriggered = ref(false);
    const elementRef = containerRef || ref<HTMLElement | null>(null);
    let observer: IntersectionObserver | null = null;
    let isVisible = false;

    // Modified to accept a delay parameter
    const executeLerp = (delay: number = 0) => {
        if (hasTriggered.value || !isLoaded.value || !isVisible) return;
        
        hasTriggered.value = true; // Mark as triggered immediately to prevent duplicates

        setTimeout(() => {
            const target = targetValue.value;
            const start = performance.now();

            const step = (now: number) => {
                const progress = Math.min((now - start) / duration, 1);
                animatedValue.value = Math.round(progress * target);
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            
            if (observer) observer.disconnect();
        }, delay);
    };

    // Watcher triggers with 0ms delay (immediate lerp when data arrives on visible element)
    watch([isLoaded, targetValue], () => {
        executeLerp(0);
    });

    onMounted(() => {
        observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                isVisible = true;
                
                // If data is ALREADY loaded when we scroll into view, apply 300ms delay
                // If data is NOT loaded, we wait for the watch() above to trigger it with 0ms
                if (isLoaded.value) {
                    executeLerp(300);
                }
            }
        }, { threshold: 0.1 });

        if (elementRef.value) observer.observe(elementRef.value);
    });

    onUnmounted(() => {
        if (observer) observer.disconnect();
    });

    return { animatedValue, elementRef, hasTriggered };
}