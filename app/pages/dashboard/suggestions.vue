<template>
    <div class=" px-3 md:px-8 md:py-0 py-6 w-full h-full md:h-auto flex md:justify-between justify-center items-stretch gap-x-6">
        <div
            class=" max-w-99 w-full md:w-99 flex flex-col justify-between md:justify-start md:h-auto h-fullF  shrink-0 pt-4 p-6 md:bg-surface-variant rounded-3xl">
            <div class=" w-full">
                <div class=" mb-3 text-on-surface select-none text-label-sm">{{ t('suggestions.title') }}</div>
                <BInput :title="t('suggestions.subject')" :placeholder="t('suggestions.placeholder')"
                    v-model="title.value" :color="title.color" :message="title.message" />
                <BInput textarea :title="t('suggestions.description')" :placeholder="t('suggestions.placeholder')"
                    v-model="description.value" :color="description.color" :message="description.message" />
                <div class=" relative w-full">
                    <div v-file-pick="{ onSelect: onImagePick, accept: '.pdf,.doc,.docx,image/*' }">
                        <BInput icon="PhPaperclip" class=" cursor-pointer" readonly v-model="attachement.value"
                            :color="attachement.color" :message="attachement.message"
                            :title="t('suggestions.attachement')" :placeholder="t('suggestions.selectFile')" />
                    </div>
                    <div class="absolute top-10.5 ltr:right-3 rtl:left-3">
                        <BMenu ref="menuRef"
                            :options="[{ key: 'delete', icon: 'PhTrash', color: 'error', label: t('suggestions.deleteAttachement') }]"
                            @select="handleSelect">
                            <template #trigger>
                                <BIcon icon="PhDotsThreeOutline" class="  w-5 h-5 cursor-pointer text-on-surface " />
                            </template>
                            <!-- 
                            <div class=" flex flex-col gap-y-1 select-none w-60 p-1">
                                <div @click="removeFile"
                                class="hover:bg-error/10 bg-error/0 cursor-pointer group  transition-all duration-200 ease-in-out rounded-lg w-full flex items-center px-2.5 py-3 gap-x-2">
                                <BIcon class=" transition-all fill-error duration-200 ease-in-out w-5 h-5"
                                weight="bold" icon="PhTrash" />
                                <div class=" text-label-sm transition-all duration-200 text-error ease-in-out">
                                    {{ t('suggestions.deleteAttachement') }}</div>
                                </div>
                            </div>
                            -->
                        </BMenu>
                    </div>
                </div>
            </div>
            <BButton :text="t('suggestions.send')" @click="validateFields" :loading="isSending" :disabled="hasErrors"
                class=" min-w-full" />
        </div>
        <div class=" flex-1 hidden md:flex flex-col gap-y-6 items-center justify-center bg-surface-variant rounded-3xl">
            <div class=" w-50 h-50">
                <BImage no-loading class=" w-full h-full" :src="suggestionImage" />
            </div>
            <div class=" select-none text-on-surface w-full flex flex-col items-center gap-y-3">
                <div class=" text-title-md">{{ t('suggestions.ctaTitle') }}</div>
                <div class=" text-label-sm">{{ t('suggestions.ctaDescription') }}</div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { watch, defineComponent, ref } from 'vue';
import suggestionImage from '/images/dashboard/suggestions.webp'
import { useI18n } from '#imports';
import { useWindowSize } from '#imports';
import type { Menu } from '~/types/components/menu';
definePageMeta({
    layout: 'responsive',
    headerTitle: 'suggestions.title',
    layoutTransition: false
});
export default defineComponent({
    name: 'SuggestionsPage',
    setup() {
        const { t } = useI18n()
        const hasErrors = ref(false)
        const isSending = ref(false)
        const title = ref({ value: '', color: 'primary', message: '' })
        const description = ref({ value: '', color: 'primary', message: '' })
        const attachement = ref({ value: '', color: '', message: '' })
        const menuRef = ref<Menu | null>(null)
        const { width } = useWindowSize()
        //  const isMobile = computed(() => width.value < 768);

        //  onMounted(() => {
        //      checkLayout()
        //  })

        const checkLayout = () => {
            //   setPageLayout(isMobile.value ? 'mobile' : 'dashboard');
        }

        //  watch(() => isMobile.value, () => {
        //      checkLayout()
        //  }, { immediate: true });

        const validateFields = () => {
            if (isSending.value || hasErrors.value) return

            if (title.value.value.trim().length === 0) {
                hasErrors.value = true;
                title.value.color = 'error'
                title.value.message = t('suggestions.fieldRequired', { field: t('suggestions.subject') })
            }

            if (description.value.value.trim().length === 0) {
                hasErrors.value = true;
                description.value.color = 'error'
                description.value.message = t('suggestions.fieldRequired', { field: t('suggestions.subject') })
            }

            if (!hasErrors.value) {
                submitFields()
            }
        }

        const submitFields = async () => {
            if (isSending.value || hasErrors.value) return
            isSending.value = true;
            try {

            } catch (error) {

            } finally {
                isSending.value = false;
            }
        }


        watch(() => title.value.value, () => {
            title.value.message = ''
            title.value.color = 'primary'
            hasErrors.value = false
        })

        watch(() => description.value.value, () => {
            description.value.color = 'primary'
            description.value.message = ''
            hasErrors.value = false;
        })

        watch(() => attachement.value.value, () => {
            attachement.value.color = 'primary'
            attachement.value.message = ''
            hasErrors.value = false;
        })


        const MAX_FILE_SIZE_MB = 5;
        const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
        const ALLOWED_TYPES = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        // Update the function signature to destructure the incoming object
        // Replace your onImagePick function with this
        const onImagePick = (files: any[]) => {
            console.log('kir')
            // The file picker directive always returns an array
            if (!files || files.length === 0) return;

            const { file, path } = files[0];

            // 1. Reset state
            attachement.value.message = '';
            attachement.value.color = 'primary';
            hasErrors.value = false;

            // 2. Validate Format
            if (!ALLOWED_TYPES.includes(file.type)) {
                attachement.value.color = 'error';
                attachement.value.message = t('suggestions.invalidFormat');
                attachement.value.value = '';
                hasErrors.value = true;
                return;
            }

            // 3. Validate Size
            if (file.size > MAX_FILE_SIZE_BYTES) {
                attachement.value.color = 'error';
                attachement.value.message = t('suggestions.invalidFileSize', { size: `${MAX_FILE_SIZE_MB}MB` });
                attachement.value.value = '';
                hasErrors.value = true;
                return;
            }

            // 4. Success
            attachement.value.value = file.name;
        };

        const removeFile = () => {
            attachement.value.value = ''
            menuRef.value?.close()
        }

        useSeoMeta({
            title: () => t('seo.dashboard.suggestions.title'),
            description: () => t('seo.dashboard.suggestions.description'),
            ogTitle: () => `${t('seo.siteName')} - ${t('seo.dashboard.suggestions.title')}`,
        });

        const handleSelect = (key: string) => {
            switch (key) {
                case 'delete':
                    removeFile()
                    break;
            }
        }

        return {
            validateFields,
            t,
            suggestionImage,
            title,
            removeFile,
            description,
            menuRef,
            isSending,
            attachement,
            handleSelect,
            hasErrors,
            onImagePick,
        }
    }
})
</script>