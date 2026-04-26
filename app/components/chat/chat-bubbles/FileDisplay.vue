<template>
    <div class="w-full flex gap-x-2 select-none items-center">
        <div class="flex text-left flex-col gap-y-0.5 flex-1 min-w-0">
            <div class="text-on-surface text-label-md truncate">{{ fileName }}</div>
            <div dir="ltr" class="text-body-sm text-on-surface/70">{{ formattedSize }}</div>
        </div>

        <div class="relative shrink-0 cursor-pointer active:scale-95 transition-transform"
            v-if="status === 'downloaded'" @click="toggleDownload">
            <BIcon icon="PhFile" class="fill-white w-10 h-10" :class="[isMine ? '' : 'drop-shadow-sm']" weight="fill" />
            <div class="absolute bottom-2 right-0 bg-error rounded-sm px-1 py-0.5 flex items-center justify-center">
                <div class="text-center text-white text-[7px] font-bold leading-none uppercase tracking-wide">
                    {{ fileExt }}
                </div>
            </div>
        </div>

        <div v-else class="w-10 h-10 relative cursor-pointer shrink-0 group" @click="toggleDownload">
            <svg class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" class="stroke-on-surface/20" stroke-width="2" fill="none" />
                <circle cx="20" cy="20" r="18" class="stroke-on-surface transition-all duration-200 ease-linear"
                    stroke-width="2" fill="none" stroke-linecap="round" :stroke-dasharray="circumference"
                    :stroke-dashoffset="dashOffset" />
            </svg>

            <div class="absolute inset-0 flex items-center justify-center transition-colors ">
                <BIcon v-if="status === 'downloading'" icon="PhX" class="w-4 h-4 " />
                <BIcon v-else icon="PhArrowDown" class="w-4 h-4 fill-on-surface " />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n, useLocale } from '#imports';
export default defineComponent({
    name: 'FileDisplay',
    props: {
        url: {
            type: String,
            required: true
        },
        isMine: {
            type: Boolean,
            default: true,
        }
    },
    setup(props) {
        const { t } = useI18n()
        const { dir } = useLocale()


        // State
        const status = ref<'idle' | 'downloading' | 'downloaded'>('idle');
        const progress = ref(0);
        const fetchedSize = ref<number | null>(null);
        let abortController: AbortController | null = null;

        const dbName = 'ChatFileCache';

        // --- IDB Helper: Opens/Creates the database ---
        const getDB = () => new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);
            request.onupgradeneeded = () => request.result.createObjectStore('files');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        const checkLocalExistence = async () => {
            const db = await getDB();
            const tx = db.transaction('files', 'readonly');
            const store = tx.objectStore('files');
            const request = store.get(props.url); // Keyed by URL

            request.onsuccess = () => {
                if (request.result) status.value = 'downloaded';
            };
        };

        // --- SVG Math ---
        const circumference = 2 * Math.PI * 18; // ~113.1
        const dashOffset = computed(() => {
            return circumference - (progress.value / 100) * circumference;
        });

        // --- URL Parsing ---
        const fileName = computed(() => {
            try {
                const urlObj = new URL(props.url);
                const path = urlObj.pathname;
                return decodeURIComponent(path.split('/').pop() || 'Unknown_File');
            } catch {
                return 'File';
            }
        });

        // Fix 2: Robust extension extraction and forced Uppercase
        const fileExt = computed(() => {
            const name = fileName.value;
            const lastDot = name.lastIndexOf('.');
            if (lastDot !== -1) {
                return name.substring(lastDot + 1).toUpperCase().substring(0, 4);
            }
            return 'FILE';
        });
        // --- Size Formatting ---
        const formatBytes = (bytes: number) => {
            if (bytes === 0) return '0 KB';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        };

        const formattedSize = computed(() => {
            if (status.value === 'downloading' && fetchedSize.value) {
                const downloaded = (progress.value / 100) * fetchedSize.value;
                return `${formatBytes(downloaded)} / ${formatBytes(fetchedSize.value)}`;
            }
            return fetchedSize.value ? formatBytes(fetchedSize.value) : t('chat.file.calculating');
        });

        // --- Initialization ---
        const getFileSize = async () => {
            try {
                // Perform a lightweight HEAD request just to get the size
                const res = await fetch(props.url, { method: 'HEAD' });
                const length = res.headers.get('Content-Length');
                if (length) fetchedSize.value = parseInt(length, 10);
            } catch (e) {
                console.warn('Could not fetch file size upfront:', e);
                fetchedSize.value = 0; // Fallback
            }
        };

        // --- Download Logic ---
        const toggleDownload = async () => {
            // 1. OPEN MODE: Retrieve from IndexedDB and trigger system download prompt
            if (status.value === 'downloaded') {
                const db = await getDB();
                const tx = db.transaction('files', 'readonly');
                const store = tx.objectStore('files');

                const fileBlob = await new Promise<Blob | undefined>((res) => {
                    store.get(props.url).onsuccess = (e: any) => res(e.target.result);
                });

                if (fileBlob) {
                    // Trigger native download/open prompt
                    const blobUrl = URL.createObjectURL(fileBlob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = fileName.value; // Forces the browser to download rather than navigate
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                } else {
                    status.value = 'idle';
                    toggleDownload();
                }
                return;
            }

            // 2. CANCEL MODE
            if (status.value === 'downloading') {
                abortController?.abort();
                status.value = 'idle';
                progress.value = 0;
                return;
            }

            // 3. DOWNLOAD MODE
            status.value = 'downloading';
            progress.value = 0;
            abortController = new AbortController();

            try {
                const response = await fetch(props.url, { signal: abortController.signal });
                if (!response.ok) throw new Error('Network response failed');

                // Extract the exact file type from the server
                const contentType = response.headers.get('content-type') || 'application/octet-stream';
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
                            if (total) progress.value = Math.round((loaded / total) * 100);
                        }
                    }
                }

                // --- THE FIX: Pass the contentType into the Blob ---
                const blob = new Blob(chunks, { type: contentType });

                // Save to IndexedDB. The Blob retains its type here!
                const db = await getDB();
                const tx = db.transaction('files', 'readwrite');
                tx.objectStore('files').put(blob, props.url);

                status.value = 'downloaded';

                // Trigger native download/open prompt
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = fileName.value;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);

            } catch (error: any) {
                if (error.name === 'AbortError') {
                    console.log('Download cancelled');
                } else {
                    console.error('Download error:', error);
                }
                status.value = 'idle';
                progress.value = 0;
            }
        };

        onMounted(() => {
            getFileSize();
            checkLocalExistence();
        });

        return {
            status,
            progress,
            fileName,
            fileExt,
            formattedSize,
            circumference,
            dashOffset,
            dir,
            toggleDownload
        };
    }
});
</script>