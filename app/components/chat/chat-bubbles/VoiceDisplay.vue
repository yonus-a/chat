<template>
    <div class="w-55 flex items-center gap-x-2.5 select-none text-on-surface">


        <div class="flex-1 h-7 relative flex items-center cursor-pointer overflow-hidden" @click="seekAudio">
            <audio ref="audioRef" :src="audioSrc" @timeupdate="onTimeUpdate" @ended="onEnded"></audio>

            <div class="absolute inset-0 flex items-center justify-between opacity-30">
                <div v-for="(h, idx) in staticWaveform" :key="'base-' + idx" :style="{ height: h + '%' }"
                    class="w-0.5 rounded-full bg-on-surface">
                </div>
            </div>

            <div class="absolute inset-0 flex items-center justify-between transition-all ease-linear"
                :class="[isPlaying ? 'duration-100' : 'duration-75']"
                :style="{ clipPath: `inset(0 ${100 - playProgress}% 0 0)` }">
                <div v-for="(h, idx) in staticWaveform" :key="'active-' + idx" :style="{ height: h + '%' }"
                    class="w-0.5 rounded-full bg-on-surface">
                </div>
            </div>
        </div>
        <div class="shrink-0 w-11 h-11 relative flex items-center justify-center cursor-pointer transition-colors duration-200"
            :class="[status === 'downloaded' ? ' bg-gradient-black dark:bg-gradient-gray rounded-xl' : 'rounded-full group']"
            @click="handleAction">
            <svg v-if="status !== 'downloaded'" class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="20" class="stroke-on-surface/20" stroke-width="2.5" fill="none" />
                <circle cx="22" cy="22" r="20" class="stroke-on-surface transition-all duration-200 ease-linear"
                    stroke-width="2.5" fill="none" stroke-linecap="round" :stroke-dasharray="circumference"
                    :stroke-dashoffset="dashOffset" />
            </svg>

            <BIcon v-if="status === 'idle'" icon="PhArrowDown" class="w-5 h-5 fill-on-surface transition-colors " />
            <BIcon v-else-if="status === 'downloading'" icon="PhX" class="w-5 h-5 fill-on-surface transition-colors " />

            <BIcon v-else-if="status === 'downloaded'" :icon="isPlaying ? 'PhPause' : 'PhPlay'" weight="light"
                class="w-5 h-5 text-white transition-transform duration-300"
                :class="[isPlaying ? 'scale-90' : ' scale-100']" />
        </div>


    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
    name: 'VoiceDisplay',
    props: {
        url: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const status = ref<'idle' | 'downloading' | 'downloaded'>('idle');
        const downloadProgress = ref(0);
        const playProgress = ref(0);
        const isPlaying = ref(false);
        const audioSrc = ref<string>('');

        const audioRef = ref<HTMLAudioElement | null>(null);
        let abortController: AbortController | null = null;
        const dbName = 'ChatFileCache';

        // --- Adjusted SVG Math for 44px Button (r=20) ---
        const circumference = 2 * Math.PI * 20; // ~125.6
        const dashOffset = computed(() => circumference - (downloadProgress.value / 100) * circumference);

        // --- HARDCODED WAVEFORM FROM IMAGE ---
        // 23 bars matching the exact high/low pattern of the image
        const staticWaveform = [
            20, 50, 90, 60, 30, 40, 80, 50, 30, 50, 80, 80,
            90, 30, 60, 40, 70, 90, 40, 70, 40, 60, 20
        ];

        // --- IDB & Logic (Unchanged core functionality) ---
        const getDB = () => new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);
            request.onupgradeneeded = () => request.result.createObjectStore('files');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        const checkLocalExistence = async () => {
            try {
                const db = await getDB();
                const tx = db.transaction('files', 'readonly');
                const store = tx.objectStore('files');

                store.get(props.url).onsuccess = (e: any) => {
                    if (e.target.result) {
                        audioSrc.value = URL.createObjectURL(e.target.result);
                        status.value = 'downloaded';
                    }
                };
            } catch (e) {
                console.warn('IDB check failed', e);
            }
        };

        const handleAction = async () => {
            if (status.value === 'downloaded' && audioRef.value) {
                if (isPlaying.value) {
                    audioRef.value.pause();
                    isPlaying.value = false;
                } else {
                    audioRef.value.play();
                    isPlaying.value = true;
                }
                return;
            }

            if (status.value === 'downloading') {
                abortController?.abort();
                status.value = 'idle';
                downloadProgress.value = 0;
                return;
            }

            status.value = 'downloading';
            downloadProgress.value = 0;
            abortController = new AbortController();

            try {
                const response = await fetch(props.url, { signal: abortController.signal });
                if (!response.ok) throw new Error('Network response failed');

                const contentType = response.headers.get('content-type') || 'audio/mpeg';
                const total = parseInt(response.headers.get('content-length') || '0', 10);
                let loaded = 0;
                const chunks: Uint8Array[] = [];
                const reader = response.body?.getReader();

                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        if (value) {
                            chunks.push(value);
                            loaded += value.length;
                            if (total) downloadProgress.value = Math.round((loaded / total) * 100);
                        }
                    }
                }

                const blob = new Blob(chunks, { type: contentType });
                const db = await getDB();
                const tx = db.transaction('files', 'readwrite');
                tx.objectStore('files').put(blob, props.url);

                audioSrc.value = URL.createObjectURL(blob);
                status.value = 'downloaded';

            } catch (error: any) {
                if (error.name !== 'AbortError') console.error('Voice download error:', error);
                status.value = 'idle';
                downloadProgress.value = 0;
            }
        };

        const onTimeUpdate = () => {
            if (!audioRef.value) return;
            const current = audioRef.value.currentTime;
            const total = audioRef.value.duration;
            if (total) playProgress.value = (current / total) * 100;
        };

        const onEnded = () => {
            isPlaying.value = false;
            playProgress.value = 0;
        };

        const seekAudio = (e: MouseEvent) => {
            if (status.value !== 'downloaded' || !audioRef.value) return;
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

            const newTime = clickPosition * audioRef.value.duration;
            if (isFinite(newTime)) {
                audioRef.value.currentTime = newTime;
                playProgress.value = clickPosition * 100;
            }
        };

        onMounted(() => checkLocalExistence());

        onBeforeUnmount(() => {
            if (audioSrc.value) URL.revokeObjectURL(audioSrc.value);
            abortController?.abort();
        });

        return {
            status,
            downloadProgress,
            playProgress,
            isPlaying,
            audioSrc,
            audioRef,
            circumference,
            dashOffset,
            staticWaveform,
            handleAction,
            onTimeUpdate,
            onEnded,
            seekAudio
        };
    }
});
</script>