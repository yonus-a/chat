<template>
    <div class=" w-full">
        <div class="w-full rounded-xl bg-surface-variant-2 py-2 ltr:pl-3 rtl:pr-3 flex flex-col ">
            <div class="text-label-sm mb-3 text-on-surface select-none">{{ t('calendar.form.checkList') }}</div>

            <div class="w-full max-h-18 overflow-y-auto overflow-x-hidden pr-1 flex flex-col" ref="scrollContainer">
                <TransitionGroup name="checklist">
                    <div v-for="(check, index) in localCheckList" :key="check.id"
                        class="checklist-item shrink-0 overflow-hidden w-full flex items-center gap-x-3 py-1.5 origin-top">
                        <BCheckBox :disabled="!check.text.trim()" v-model="check.isChecked"
                            @update:modelValue="syncUpdate" />

                        <input ref="checkInputs" v-model="check.text" type="text"
                            class="flex-1 outline-none bg-transparent text-body-sm text-on-surface placeholder:text-on-surface/30"
                            :placeholder="t('general.write')" @keydown.enter.prevent="handleAction(index)"
                            @blur="handleAction(index)">
                    </div>
                </TransitionGroup>
            </div>

        </div>
        <ErrorDisplay :error="localError" />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, useTemplateRef, nextTick, onMounted, type PropType } from 'vue';
import type { EventChecklistItem } from '~/types/calendar';
import { useI18n } from '#imports';
import ErrorDisplay from '~/components/general/ErrorDisplay.vue';
export interface CheckListExposed {
    clear: () => void;
    validate: () => boolean;
}
export default defineComponent({
    name: 'CheckList',
    props: {
        modelValue: {
            type: Array as PropType<EventChecklistItem[]>,
            default: () => []
        },
    },
    components: {
        ErrorDisplay,
    },
    emits: ['update:modelValue'],
    setup(props, { emit, expose }) {
        const { t } = useI18n();
        const scrollContainer = useTemplateRef<HTMLElement>('scrollContainer');
        const inputRefs = useTemplateRef<HTMLInputElement[]>('checkInputs');

        const localCheckList = ref<EventChecklistItem[]>([]);
        const localError = ref('');



        // 3. Validation Logic
        const validate = (): boolean => {
            const defaultTitle = t('calendar.form.taskTitle');

            // Check if any item has been modified from default and isn't empty
            const hasRealContent = localCheckList.value.some(item =>
                item.text.trim().length > 0 && item.text !== defaultTitle
            );

            if (!hasRealContent) {
                localError.value = t('calendar.form.checkListError');
                return true;
            }

            localError.value = '';
            return false;
        };

        // 4. Updated Expose
        const resetList = () => {
            localCheckList.value = [
                createDefaultItem(t('calendar.form.taskTitle')),
                createDefaultItem('')
            ];
        };

        // Initial defaults helper
        const createDefaultItem = (text = '') => ({
            id: Math.floor(Math.random() * 1000000) + Date.now(),
            text,
            isChecked: false
        });

        // Local state


        const scrollToBottom = () => {
            nextTick(() => {
                if (scrollContainer.value) {
                    scrollContainer.value.scrollTo({
                        top: scrollContainer.value.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            });
        };

        // Sync incoming props
        watch(() => props.modelValue, (newVal) => {
            if (newVal && newVal.length > 0) {
                localCheckList.value = newVal.map(item => ({ ...item }));
            }
            else if ((!newVal || newVal.length === 0) && localCheckList.value.length === 0) {
                resetList();
            }
        }, { immediate: true, deep: true });

        const syncUpdate = () => {
            if (localError.value) localError.value = '';
            emit('update:modelValue', JSON.parse(JSON.stringify(localCheckList.value)));
        };

        const handleAction = (index: number) => {
            const item = localCheckList.value[index];
            const isLast = index === localCheckList.value.length - 1;
            const isEmpty = item.text.trim() === '';

            // CASE 1: Empty text and not the last item -> Remove it
            if (isEmpty && !isLast) {
                localCheckList.value.splice(index, 1);
                syncUpdate();
                return;
            }

            // CASE 2: Last item and has text -> Add a new one (max 10)
            if (!isEmpty && isLast) {
                if (localCheckList.value.length < 10) {
                    localCheckList.value.push(createDefaultItem());
                    syncUpdate();

                    setTimeout(() => {
                        scrollToBottom();
                    }, 200)

                    nextTick(() => {
                        const nextIndex = localCheckList.value.length - 1;
                        // Change 4: Access the input array via the new template ref
                        const allInputs = inputRefs.value;
                        if (allInputs && allInputs[nextIndex]) {
                            allInputs[nextIndex].focus();
                        }
                    });
                }
            }
            // Just sync if text was edited
            syncUpdate();
        };


        expose({
            clear: resetList,
            validate
        } as CheckListExposed);

        onMounted(() => {
            if (localCheckList.value.length === 0) {
                resetList();
            }
        });

        return {
            t,
            localCheckList,
            scrollContainer,
            localError,
            inputRefs,
            handleAction,
            syncUpdate
        };
    }
});
</script>

<style scoped>
/* Checklist Animations */
.checklist-enter-active,
.checklist-leave-active {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 40px;
    /* Approximate height of one item */
}

.checklist-enter-from,
.checklist-leave-to {
    opacity: 0;
    max-height: 0;
    transform: scaleY(0);
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;
}

/* Ensure smooth list moving */
.checklist-move {
    transition: transform 0.2s ease;
}
</style>