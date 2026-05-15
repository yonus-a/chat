<template>
    <div class=" w-full">
        <div class=" w-full ">
            <BSelect :title="t('calendar.form.type.title')" :placeholder="t('general.select')"
                :options="eventTypeOptions" v-model="eventType.value" :color="eventType.color"
                :message="eventType.message" />
            <BInput :title="titleAndDescription.title" :placeholder="t('general.write')" v-model="eventTitle.value"
                :color="eventTitle.color" :message="eventTitle.message" />

            <BInput :title="titleAndDescription.description" :placeholder="t('general.write')"
                v-model="description.value" :color="description.color" :message="description.message" />
            <div :class="[eventType.value === 'task' ? 'h-auto opacity-100' : 'opacity-0 h-0']"
                class=" transition-all duration-200 ease-in-out overflow-hidden text-wrap whitespace-nowrap">
                <CheckList v-model="checkListData" ref="checkList" />
            </div>
            <BSelect multiple :title="t('calendar.form.addPerson')" :placeholder="t('general.select')"
                v-model="selectedUsers.value" :color="selectedUsers.color" :message="selectedUsers.message"
                :options="familyOptions" />
            <div :class="[eventType.value !== 'medicine' ? 'h-auto opacity-100 overflow-visible' : ' overflow-hiddenopacity-0 h-0']"
                class=" transition-all duration-200 ease-in-out overflow-hidden text-wrap whitespace-nowrap w-full">

                <div class=" w-full relative">
                    <div id="shit" class="absolute z-20 top-10.5 ltr:right-3 rtl:left-3 w-5 h-5 overflow-visible">
                        <BMenu :options="attachementOptions" @select="removeAttachement">
                            <template #trigger>
                                <BIcon icon="PhDotsThreeOutline" class="  w-5 h-5 cursor-pointer text-on-surface " />
                            </template>
                        </BMenu>
                    </div>
                    <BInput v-file-pick="{ onSelect: onImagePick, accept: '.pdf,.doc,.docx,image/*' }" readonly
                        icon="PhPaperclip" :color="attachement.color" :message="attachement.message"
                        v-model="attachement.value" :placeholder="t('general.select')"
                        :title="t('calendar.form.attachement')" />
                </div>
                <BSelect v-model="chosenColor.value" :color="chosenColor.color" :message="chosenColor.message"
                    :placeholder="t('general.select')" :title="t('calendar.form.color')" :options="colors" />
            </div>
        </div>
        <BButton class=" min-w-full w-full" color="primary" type="fill" :text="t('calendar.form.continue')"
            :disabled="hasErrors" @click="validateFields" />
    </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, watch, useTemplateRef, onMounted } from 'vue';
import { useI18n, useProfileStore } from '#imports';
import type { DropdownOption } from '~/types/components/select';
import CheckList, { type CheckListExposed } from './CheckList.vue';
import { useCalendarStore } from '#imports';
export default defineComponent({
    name: 'CreateEvent',
    components: {
        CheckList,
    },
    props: {
        initialData: {
            type: Object as PropType<Record<string, any> | null>,
            default: null
        }
    },
    emits: ['close', 'submit'],
    setup(props, { emit }) {
        const { t } = useI18n()
        const profileStore = useProfileStore()
        const calendarStore = useCalendarStore()
        const checkListRef = useTemplateRef<CheckListExposed>('checkList');
        const hasErrors = ref(false)
        const colors = computed(() => calendarStore.colors)
        const chosenColor = ref({
            value: colors.value[0]?.value,
            message: '',
            color: 'primary'
        });
        const eventType = ref({ value: 'task', message: '', color: 'primary' })
        const eventTitle = ref({ value: '', message: '', color: 'primary' })
        const description = ref({ value: '', message: '', color: 'primary' })
        const selectedUsers = ref({ value: [], message: '', color: 'primary' })
        const attachement = ref({ value: '', color: '', message: '' })

        const checkListData = ref(
            (props.initialData?.eventType === 'task' && props.initialData?.checkList)
                ? [...props.initialData.checkList]
                : []
        );


        watch(() => props.initialData, (newData) => {
            if (newData) {
                eventType.value.value = newData.eventType || 'task';
                eventTitle.value.value = newData.title || '';
                description.value.value = newData.description || '';

                if (newData.eventType !== 'medicine') {
                    selectedUsers.value.value = newData.selectedUsers || [];

                    // FIX: Extract file name from full URL
                    let attUrl = newData.attachement || '';
                    if (attUrl && attUrl.includes('/')) {
                        attUrl = attUrl.split('/').pop() || attUrl;
                    }
                    attachement.value.value = attUrl;

                    // FIX: colors.value is an array, must use
                    chosenColor.value.value = newData.color || colors.value[0]?.value;
                }

                if (newData.eventType === 'task' && newData.checkList) {
                    checkListData.value = [...newData.checkList];
                }
            } else {
                eventType.value.value = 'task';
                eventTitle.value.value = '';
                description.value.value = '';
                selectedUsers.value.value = [];
                attachement.value.value = '';
                checkListData.value = [];
                const randomIdx = Math.floor(Math.random() * colors.value.length);
                chosenColor.value.value = colors.value[randomIdx]?.value || 'red';

                hasErrors.value = false;
                eventTitle.value.color = 'primary';
                eventTitle.value.message = '';
                description.value.color = 'primary';
                description.value.message = '';
            }
        }, { immediate: true, deep: true });







        const titleAndDescription = computed(() => {
            return eventType.value.value !== 'medicine'
                ? { title: t('calendar.form.eventTitle'), description: t('calendar.form.descriptions') }
                : { title: t('calendar.form.medicineName'), description: t('calendar.form.medicineDescription') };
        });


        const clearFieldError = (fieldRef: any) => {
            if (fieldRef.value.color === 'error') {
                fieldRef.value.color = 'primary';
                fieldRef.value.message = '';
                hasErrors.value = false;
            }
        };

        // Watch fields individually to clear specific errors smoothly
        watch(() => eventTitle.value.value, () => clearFieldError(eventTitle));
        watch(() => description.value.value, () => clearFieldError(description));

        watch(() => eventType.value.value, (newType, oldType) => {
            if (newType === oldType) return;
            clearFieldError(eventType);

            // Wait 250ms (200ms animation + 50ms buffer) before clearing hidden fields
            setTimeout(() => {
                if (newType === 'medicine') {
                    attachement.value.value = '';
                    checkListRef.value?.clear();
                } else if (newType === 'event') {
                    checkListRef.value?.clear();
                }
            }, 250);
        });



        const attachementOptions = computed(() => [{ key: 'delete', icon: 'PhTrash', color: 'error', label: t('calendar.form.deleteAttachement') }])



        watch(() => checkListData.value, () => {
            if (eventType.value.value === 'task' && hasErrors.value) {
                hasErrors.value = false;

                if (eventType.value.color === 'error') {
                    eventType.value.color = 'primary';
                    eventType.value.message = '';
                }
            }
        }, { deep: true, immediate: true });


        const attachementsTitles = computed(() => '')

        const removeAttachement = () => {
            attachement.value.value = ''
        }


        const familyOptions = computed((): DropdownOption[] => {
            return (profileStore.familyMembers || []).map((member) => ({
                label: `${member.name} ${member.lastName}`.trim(),
                value: member.id,
                image: member.imageUrl || '/images/no-avatar.webp',
            }));
        });

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


        const onImagePick = (files: any[]) => {
            if (!files || files.length === 0) return;

            const { file, path } = files[0];

            attachement.value.message = '';
            attachement.value.color = 'primary';
            hasErrors.value = false;

            if (!ALLOWED_TYPES.includes(file.type)) {
                attachement.value.color = 'error';
                attachement.value.message = t('calendar.form.invalidFormat');
                attachement.value.value = '';
                hasErrors.value = true;
                return;
            }

            if (file.size > MAX_FILE_SIZE_BYTES) {
                attachement.value.color = 'error';
                attachement.value.message = t('calendar.form.invalidFileSize', { size: `${MAX_FILE_SIZE_MB}MB` });
                attachement.value.value = '';
                hasErrors.value = true;
                return;
            }

            attachement.value.value = file.name;
        };


        const eventTypeOptions = computed(() => [
            {
                label: t('calendar.form.type.task'),
                value: 'task'
            },
            {
                label: t('calendar.form.type.medicine'),
                value: 'medicine'
            },
            {
                label: t('calendar.form.type.event'),
                value: 'event'
            },
            //  {
            //      label: t('calendar.form.type.service'),
            //      value: 'service'
            //  },
        ])


        const validateFields = () => {
            let isValid = true;
            hasErrors.value = false;

            // 1. Required Fields
            if (!eventTitle.value.value.trim()) {
                eventTitle.value.color = 'error';
                eventTitle.value.message = t('validation.required', { field: titleAndDescription.value.title });
                isValid = false;
            }
            if (!description.value.value.trim()) {
                description.value.color = 'error';
                description.value.message = t('validation.required', { field: titleAndDescription.value.description });
                isValid = false;
            }

            // 2. Conditional Validations
            if (eventType.value.value === 'task') {
                if (checkListRef.value && checkListRef.value.validate()) {
                    isValid = false;
                }
            }

            // 3. Prevent submit if file picker threw an error earlier
            if (attachement.value.color === 'error') isValid = false;

            if (!isValid) {
                hasErrors.value = true;
                return;
            }

            submitFields();
        };

        const submitFields = () => {
            // Build the exact payload needed, stripping out UI formatting states
            const payload: Record<string, any> = {
                eventType: eventType.value.value,
                title: eventTitle.value.value,
                description: description.value.value,
                selectedUsers: selectedUsers.value.value,
            };
            if (eventType.value.value !== 'medicine') {
                payload.selectedUsers = selectedUsers.value.value;
                payload.attachement = attachement.value.value;
                payload.color = chosenColor.value.value;
            }

            if (eventType.value.value === 'task') {
                payload.checkList = checkListData.value;
            }

            emit('submit', payload);
        };


        const close = () => {
            emit('close')
        }

        return {
            t,
            eventTypeOptions,
            checkListRef,
            colors,
            close,
            eventType,
            familyOptions,
            eventTitle,
            attachementOptions,
            removeAttachement,
            attachement,
            description,
            selectedUsers,
            onImagePick,
            attachementsTitles,
            titleAndDescription,
            checkListData,
            hasErrors,
            chosenColor,
            validateFields,
        }
    }
})
</script>