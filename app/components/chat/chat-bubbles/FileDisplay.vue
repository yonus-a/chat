<template>
    <div class="w-full flex gap-x-2 select-none items-center">
        <div class="flex text-left flex-col gap-y-0.5 flex-1 min-w-0">
            <div class="text-on-surface text-label-md truncate">{{ fileName }}</div>
            <div dir="ltr" class="text-body-sm text-on-surface/70">{{ formattedSize }}</div>
        </div>

        <div class="relative shrink-0 cursor-pointer active:scale-95 transition-transform"
            v-if="status === 'downloaded' && !isUploading" @click="toggleDownload">
            <BIcon icon="PhFile" class="fill-white w-10 h-10" :class="[isMine ? '' : 'drop-shadow-sm']" weight="fill" />
            <div class="absolute bottom-2 right-0 bg-error rounded-sm px-1 py-0.5 flex items-center justify-center">
                <div class="text-center text-white text-[7px] font-bold leading-none uppercase tracking-wide">
                    {{ fileExt }}
                </div>
            </div>
        </div>

        <div v-else class="w-10 h-10 relative shrink-0 group"
            :class="[isUploading ? 'cursor-default' : 'cursor-pointer']" @click="toggleDownload">
            <svg class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" class="stroke-on-surface/20" stroke-width="2" fill="none" />
                <circle cx="20" cy="20" r="18" class="stroke-on-surface transition-all duration-200 ease-linear"
                    stroke-width="2" fill="none" stroke-linecap="round" :stroke-dasharray="circumference"
                    :stroke-dashoffset="dashOffset" />
            </svg>

            <div class="absolute inset-0 flex items-center justify-center transition-colors">
                <BIcon v-if="isUploading" icon="PhUploadSimple" class="w-4 h-4 fill-on-surface" />
                <BIcon v-else-if="status === 'downloading'" icon="PhX" class="w-4 h-4 fill-on-surface" />
                <BIcon v-else icon="PhArrowDown" class="w-4 h-4 fill-on-surface" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n, useLocale, formatBytes } from '#imports';
import { useChatActionStore } from '~/stores/chatActionStore';

export default defineComponent({
    name: 'FileDisplay',
    props: {
        url: { type: String, required: true },
        isMine: { type: Boolean, default: true },
        messageId: { type: Number, required: false },
        isSent: { type: Boolean, default: true }
    },
    setup(props) {
        const { t } = useI18n();
        const { dir } = useLocale();
        const chatActionStore = useChatActionStore();

        const status = ref<'idle' | 'downloading' | 'downloaded'>('idle');
        const progress = ref(0);
        const fetchedSize = ref<number | null>(null);
        let abortController: AbortController | null = null;
        const dbName = 'ChatFileCache';

        // Read global upload state
        const uploadData = computed(() => props.messageId ? chatActionStore.uploadProgress.get(props.messageId) : null);
        const isUploading = computed(() => !props.isSent && uploadData.value);

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
            const request = store.get(props.url);
            request.onsuccess = () => { if (request.result) status.value = 'downloaded'; };
        };

        const circumference = 2 * Math.PI * 18;
        const dashOffset = computed(() => {
            if (isUploading.value && uploadData.value) {
                return circumference - (uploadData.value.progress / 100) * circumference;
            }
            return circumference - (progress.value / 100) * circumference;
        });

        const fileName = computed(() => {
            try {
                const urlObj = new URL(props.url);
                return decodeURIComponent(urlObj.pathname.split('/').pop() || 'Unknown_File');
            } catch { return 'File'; }
        });

        const fileExt = computed(() => {
            const name = fileName.value;
            const lastDot = name.lastIndexOf('.');
            return lastDot !== -1 ? name.substring(lastDot + 1).toUpperCase().substring(0, 4) : 'FILE';
        });

        const formattedSize = computed(() => {
            if (isUploading.value && uploadData.value) {
                // Map the mock percentage to the REAL fetched file size, fallback to store total if HEAD request is still pending
                const realTotal = fetchedSize.value || uploadData.value.total;
                const currentUploaded = (uploadData.value.progress / 100) * realTotal;

                return `${formatBytes(currentUploaded)} / ${formatBytes(realTotal)}`;
            }
            if (status.value === 'downloading' && fetchedSize.value) {
                const downloaded = (progress.value / 100) * fetchedSize.value;
                return `${formatBytes(downloaded)} / ${formatBytes(fetchedSize.value)}`;
            }
            return fetchedSize.value ? formatBytes(fetchedSize.value) : t('chat.file.calculating');
        });

        const getFileSize = async () => {
            try {
                if (props.url.startsWith('blob:')) {
                    const res = await fetch(props.url);
                    if (!res.ok) throw new Error('Local blob read failed');
                    const blob = await res.blob();
                    fetchedSize.value = blob.size;
                } else {
                    const res = await fetch(props.url, { method: 'HEAD' });
                    const length = res.headers.get('Content-Length');
                    if (length) fetchedSize.value = parseInt(length, 10);
                }
            } catch (e) {
                console.error('CRASH: Could not fetch real file size:', e);
                // Keeping 0 here only so the UI doesn't display "NaN / NaN" if a network link is permanently dead
                fetchedSize.value = 0;
            }
        };

        const toggleDownload = async () => {
            if (isUploading.value) return;

            if (status.value === 'downloaded') {
                const db = await getDB();
                const tx = db.transaction('files', 'readonly');
                const store = tx.objectStore('files');

                const fileBlob = await new Promise<Blob | undefined>((res) => {
                    store.get(props.url).onsuccess = (e: any) => res(e.target.result);
                });

                if (fileBlob) {
                    const blobUrl = URL.createObjectURL(fileBlob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = fileName.value;
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

            if (status.value === 'downloading') {
                abortController?.abort();
                status.value = 'idle';
                progress.value = 0;
                return;
            }

            status.value = 'downloading';
            progress.value = 0;
            abortController = new AbortController();

            try {
                const response = await fetch(props.url, { signal: abortController.signal });
                if (!response.ok) throw new Error('Network response failed');

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

                const blob = new Blob(chunks, { type: contentType });
                const db = await getDB();
                const tx = db.transaction('files', 'readwrite');
                tx.objectStore('files').put(blob, props.url);

                status.value = 'downloaded';
            } catch (error: any) {
                status.value = 'idle';
                progress.value = 0;
            }
        };

        onMounted(() => {
            getFileSize();
            checkLocalExistence();
        });

        return {
            status, progress, fileName, fileExt, formattedSize,
            circumference, dashOffset, dir, toggleDownload, isUploading
        };
    }
});
</script>