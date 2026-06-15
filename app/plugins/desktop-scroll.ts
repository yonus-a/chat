import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('desktop-scroll', {
        mounted(el: HTMLElement) {
            let isDown = false;
            let startX: number;
            let scrollLeft: number;

            // Apply base classes
            el.classList.add('cursor-grab', 'select-none');

            const start = (e: MouseEvent) => {
                isDown = true;
                el.classList.add('cursor-grabbing');
                el.classList.remove('cursor-grab');
                startX = e.pageX - el.offsetLeft;
                scrollLeft = el.scrollLeft;
            };

            const stop = () => {
                isDown = false;
                el.classList.remove('cursor-grabbing');
                el.classList.add('cursor-grab');
            };

            const move = (e: MouseEvent) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - el.offsetLeft;
                const walk = (x - startX) * 2; // Scroll speed multiplier
                el.scrollLeft = scrollLeft - walk;
            };

            el.addEventListener('mousedown', start);
            el.addEventListener('mouseleave', stop);
            el.addEventListener('mouseup', stop);
            el.addEventListener('mousemove', move);

            // Store cleanup function on the element
            (el as any)._desktopScrollCleanup = () => {
                el.removeEventListener('mousedown', start);
                el.removeEventListener('mouseleave', stop);
                el.removeEventListener('mouseup', stop);
                el.removeEventListener('mousemove', move);
            };
        },
        unmounted(el: HTMLElement) {
            if ((el as any)._desktopScrollCleanup) {
                (el as any)._desktopScrollCleanup();
            }
        }
    });
});