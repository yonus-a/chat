<template>
    <div class="w-full flex items-center gap-x-3 select-none max-w-[300px]">
        <div 
            class="shrink-0 w-12 h-12 relative flex items-center justify-center cursor-pointer transition-all duration-200"
            :class="[status === 'downloaded' ? 'bg-[#1C1E22] rounded-2xl shadow-inner' : 'rounded-full group']"
            @click="handleAction"
        >
            <svg v-if="status !== 'downloaded'" class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="22" class="stroke-on-surface/20" stroke-width="2.5" fill="none" />
                <circle 
                    cx="24" cy="24" r="22" 
                    class="stroke-on-surface transition-all duration-200 ease-linear"
                    stroke-width="2.5" fill="none" stroke-linecap="round"
                    :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" 
                />
            </svg>

            <BIcon v-if="status === 'idle'" icon="PhArrowDown" class="w-5 h-5 fill-on-surface transition-colors group-hover:fill-primary" />
            <BIcon v-else-if="status === 'downloading'" icon="PhX" class="w-5 h-5 fill-on-surface transition-colors group-hover:fill-primary" />
            
            <BIcon 
                v-else-if="status === 'downloaded'" 
                :icon="isPlaying ? 'PhPause' : 'PhPlay'" 
                weight="light" 
                class="w-7 h-7 text-white transition-transform duration-300"
                :class="[isPlaying ? 'scale-90' : 'ml-1 scale-100']"
            />
        </div>

        <div class="flex-1 h-8 relative flex items-center cursor-pointer overflow-hidden" @click="seekAudio">
            <audio 
                ref="audioRef" 
                :src="audioSrc" 
                @timeupdate="onTimeUpdate" 
                @ended="onEnded"
            ></audio>

            <div class="absolute inset-0 flex items-center justify-between gap-x-[2px] opacity-30">
                <div v-for="(h, idx) in waveformHeights" :key="'base-'+idx" 
                     :style="{ height: h + '%' }" 
                     class="flex-1 rounded-full bg-current">
                </div>
            </div>

            <div class="absolute inset-0 flex items-center justify-between gap-x-[2px] text-current transition-all ease-linear"
                 :class="[isPlaying ? 'duration-100' : 'duration-75']"
                 :style="{ clipPath: `inset(0 ${100 - playProgress}% 0 0)` }">
                <div v-for="(h, idx) in waveformHeights" :key="'active-'+idx" 
                     :style="{ height: h + '%' }" 
                     class="flex-1 rounded-full bg-current">
                </div>
            </div>
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
        // State
        const status = ref<'idle' | 'downloading' | 'downloaded'>('idle');
        const downloadProgress = ref(0);
        const playProgress = ref(0);
        const isPlaying = ref(false);
        const audioSrc = ref<string>('');
        
        const audioRef = ref<HTMLAudioElement | null>(null);
        let abortController: AbortController | null = null;
        const dbName = 'ChatFileCache';

        // --- SVG Math for Download Ring ---
        const circumference = 2 * Math.PI * 22; // ~138.2
        const dashOffset = computed(() => circumference - (downloadProgress.value / 100) * circumference);

        // --- Waveform Generator ---
        // Generates a pseudo-random wave based on the URL so it always looks the same
        const waveformHeights = computed(() => {
            const heights: number[] = [];
            let seed = props.url.length;
            for (let i = 0; i < 36; i++) {
                seed = (seed * 9301 + 49297) % 233280;
                const rand = seed / 233280;
                // Height between 20% and 100%
                heights.push(20 + Math.floor(rand * 80));
            }
            return heights;
        });

        // --- IndexedDB Cache Helpers ---
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
                        // Found in cache! Create source URL
                        audioSrc.value = URL.createObjectURL(e.target.result);
                        status.value = 'downloaded';
                    }
                };
            } catch (e) {
                console.warn('IDB check failed', e);
            }
        };

        // --- Action Logic ---
        const handleAction = async () => {
            // 1. PLAY / PAUSE MODE
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

            // 2. CANCEL DOWNLOAD MODE
            if (status.value === 'downloading') {
                abortController?.abort();
                status.value = 'idle';
                downloadProgress.value = 0;
                return;
            }

            // 3. START DOWNLOAD MODE
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

                // Save to Cache
                const db = await getDB();
                const tx = db.transaction('files', 'readwrite');
                tx.objectStore('files').put(blob, props.url); 
                
                // Set audio source
                audioSrc.value = URL.createObjectURL(blob);
                status.value = 'downloaded';

            } catch (error: any) {
                if (error.name !== 'AbortError') console.error('Voice download error:', error);
                status.value = 'idle';
                downloadProgress.value = 0;
            }
        };

        // --- Audio Controls ---
        const onTimeUpdate = () => {
            if (!audioRef.value) return;
            const current = audioRef.value.currentTime;
            const total = audioRef.value.duration;
            if (total) {
                playProgress.value = (current / total) * 100;
            }
        };

        const onEnded = () => {
            isPlaying.value = false;
            playProgress.value = 0;
        };

        const seekAudio = (e: MouseEvent) => {
            if (status.value !== 'downloaded' || !audioRef.value) return;
            // Calculate where the user clicked on the waveform
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            
            // Apply new time
            const newTime = clickPosition * audioRef.value.duration;
            if (isFinite(newTime)) {
                audioRef.value.currentTime = newTime;
                playProgress.value = clickPosition * 100;
            }
        };

        onMounted(() => {
            checkLocalExistence();
        });

        onBeforeUnmount(() => {
            // Clean up the URL object to prevent memory leaks
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
            waveformHeights,
            handleAction,
            onTimeUpdate,
            onEnded,
            seekAudio
        };
    }
});
</script>