<template>
    <div :class="[disabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100 ']"
        class=" w-full max-w-90 flex flex-col outline-none" :tabindex="tabindex" @keyup.tab="openOnTab"
        @keydown.down.prevent="highlightNext" @keydown.up.prevent="highlightPrev"
        @keydown.enter.prevent="selectHighlighted" @keydown.esc.prevent="closeDropdown">

        <span v-if="title" class=" pointer-events-none text-label-md mb-1.5 select-none text-on-surface">
            {{ title }}
        </span>

        <div ref="dropdownRef" class="relative w-full">

            <div @click="toggleDropdown"
                class="h-12 w-full px-3 py-2.5 rounded-[10px] border flex items-center gap-x-1.5 transition-all duration-300 cursor-pointer "
                :class="containerClasses">

                <BIcon v-if="icon" :icon="icon" class="w-5 h-5 shrink-0 fill-on-surface/50" />

                <div class="flex-1 flex items-center gap-x-2 overflow-x-auto overflow-y-hidden hide-scrollbar h-full">

                    <template v-if="multiple && selectedItems.length > 0">
                        <div v-for="item in selectedItems" :key="item.value" @click.stop
                            class="flex items-center gap-x-2 h-7 bg-surface-variant-3 px-2 rounded-lg  shrink-0">
                            <span class="text-sm font-medium text-on-surface whitespace-nowrap">{{ item.label
                                }}</span>
                            <BIcon @click.stop="removeItem(item)" icon="PhX"
                                class="w-3.5 h-3.5 cursor-pointer fill-on-surface opacity-50 transition-opacity hover:opacity-100" />
                        </div>
                    </template>
                    <BImage class=" max-w-6 max-h-6 min-w-6 min-h-6 w-6 h-6 rounded-full overflow-hidden"
                        v-if="!multiple && selectedItem?.image && selectedItem" :src="selectedItem.image" />
                    <div v-if="!multiple && selectedItem?.color && selectedItem"
                        class="w-6 aspect-square rounded-full shrink-0" :style="{ background: selectedItem.color }">
                    </div>
                    <span v-if="!multiple && selectedItem && (!searchable || !isOpen)"
                        class="text-sm font-medium select-none truncate text-on-surface opacity-100 shrink-0">
                        {{ selectedItem.label }}
                    </span>

                    <span v-if="showPlaceholder"
                        class="text-sm font-medium select-none truncate text-on-surface opacity-50 shrink-0">
                        {{ placeholder }}
                    </span>

                    <input v-if="searchable && isOpen" ref="searchInput" v-model="searchQuery" @click.stop
                        @keydown.down.prevent="highlightNext" @keydown.up.prevent="highlightPrev"
                        @keydown.enter.prevent="selectHighlighted"
                        class="flex-1 min-w-15 max-w-full bg-transparent outline-none text-sm font-medium text-on-surface placeholder:text-on-surface/50 h-full"
                        :placeholder="multiple && selectedItems.length > 0 ? '' : placeholder" />
                </div>

                <!---
              <BIcon v-if="loading" icon="PhSpinner" class="w-6 h-6 shrink-0 fill-primary animate-spin" />
              -->
                <BIcon icon="PhCaretDown"
                    class="w-5 h-5 fill-on-surface/50 shrink-0 fill-on-surface transition-transform duration-300"
                    :class="[isOpen ? 'rotate-180' : '', disabled ? 'opacity-40' : '']" />
            </div>

            <transition name="dropdown-fade">
                <div v-if="isOpen" :class="[
                    'absolute border overflow-hidden border-outline left-0 right-0 bg-surface rounded-xl z-50 flex flex-col shadow-[0_12px_16px_-4px_rgba(13,13,18,0.08)] dark:shadow-[0_12px_16px_-4px_rgba(0,0,0,0.4)]',
                    openDirection === 'up' ? 'bottom-[calc(100%+6px)] origin-bottom' : 'top-[calc(100%+6px)] origin-top'
                ]">

                    <div v-if="isLoading" class="flex items-center justify-center h-18.75 w-full">
                        <BIcon icon="PhCircleNotch" class="w-7 h-7 animate-spin fill-outline" />
                    </div>

                    <template v-else>
                        <div v-if="allowCreate && searchQuery && !hasExactMatch" @click.stop="createOption"
                            :class="['flex items-center gap-x-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out mb-0.5 shrink-0', highlightedIndex === -1 ? 'bg-surface-container' : 'hover:bg-surface-container']">
                            <BIcon icon="PhPlus" class="w-6 h-6 fill-primary shrink-0" />
                            <span class="text-sm font-medium text-primary select-none">{{ t('general.addNew') ||
                                'Add' }}: "{{ searchQuery }}"</span>
                        </div>

                        <div v-if="filteredOptions.length === 0 && (!allowCreate || !searchQuery) && !isLoading"
                            class="flex items-center justify-center gap-x-2 py-6 text-on-surface/50">
                            <span class="text-sm select-none font-medium">{{
                                t('general.noResultFound', {
                                    search: searchQuery, item: noResultText !== '' ? noResultText :
                                        t('general.result')
                                }) }}</span>
                        </div>

                        <div v-if="filteredOptions.length > 0" class="overflow-y-auto  max-h-50 " ref="optionsListRef">
                            <div
                                :style="{ height: `${virtualizer.getTotalSize()}px`, position: 'relative', width: '100%' }">
                                <div v-for="virtualRow in virtualizer.getVirtualItems()" :key="virtualRow.key" :style="{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualRow.size - 2}px`, // Math to leave 2px gap
                                    transform: `translateY(${virtualRow.start}px)`
                                }" @click.stop="toggleOption(filteredOptions[virtualRow.index])" :class="[
                                    'flex items-center gap-x-2 px-2  cursor-pointer transition-colors duration-200 ease-in-out',
                                    isSelected(filteredOptions[virtualRow.index]) || highlightedIndex === virtualRow.index ? ' bg-surface-variant-2' : 'bg-transparent'
                                ]">

                                    <div v-if="multiple" class="shrink-0 pointer-events-none">
                                        <BCheckBox :modelValue="isSelected(filteredOptions[virtualRow.index])" />
                                    </div>

                                    <BImage v-if="filteredOptions[virtualRow.index].image"
                                        :src="filteredOptions[virtualRow.index].image"
                                        class="w-6 max-w-6 max-h-6 min-h-6 min-w-6 rounded-sm h-6 shrink-0 object-cover" />
                                    <div v-else-if="filteredOptions[virtualRow.index]?.color"
                                        class="rounded-full overflow-hidden w-6 aspect-square shrink-0"
                                        :style="{ background: filteredOptions[virtualRow.index]?.color }">
                                    </div>
                                    <BIcon v-else-if="filteredOptions[virtualRow.index].icon"
                                        :icon="filteredOptions[virtualRow.index].icon" class="w-6 h-6 shrink-0"
                                        :class="isSelected(filteredOptions[virtualRow.index]) ? 'fill-primary' : 'fill-on-surface'" />

                                    <span class="text-sm font-medium line-clamp-1 text-ellipsis overflow-hidden flex-1"
                                        :class="isSelected(filteredOptions[virtualRow.index]) ? 'text-primary' : 'text-on-surface'">
                                        {{ filteredOptions[virtualRow.index].label }}
                                    </span>

                                    <BIcon v-if="isSelected(filteredOptions[virtualRow.index])" icon="PhCheck"
                                        class="w-5 h-5 fill-primary ms-auto shrink-0" />
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </transition>
        </div>

        <div class="w-full overflow-hidden transition-all h-5 duration-300 ease-in-out"
            :class="[message ? ' opacity-100 mt-1.5' : ' opacity-0 mt-0']">
            <div class="flex items-center gap-x-1.5">
                <BIcon v-if="message" :icon="messageIcon" class="w-4 h-4 shrink-0" :class="messageColorClass" />
                <span class="text-xs select-none" :class="messageColorClass">{{ message }}</span>
            </div>
        </div>

    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, onUnmounted, type PropType, nextTick } from 'vue';
import { useI18n } from '#imports';
import { useVirtualizer } from '@tanstack/vue-virtual';
import type { DropdownOption } from '~/types/components/select';

export default defineComponent({
    name: 'DopeDropDown',
    emits: ['update:modelValue', 'create', 'search'],
    props: {
        modelValue: {
            type: [String, Number, Array] as PropType<any>,
            default: () => []
        },
        options: {
            type: Array as PropType<DropdownOption[]>,
            default: () => []
        },
        tabindex: { type: Number, default: 0 },
        title: { type: String, default: '' },
        placeholder: { type: String, default: 'Select...' },
        message: { type: String, default: '' },
        icon: { type: String, default: '' },
        disabled: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
        searchable: { type: Boolean, default: false },
        allowCreate: { type: Boolean, default: false },
        hasError: { type: Boolean, default: false },
        color: { type: String, default: 'primary' },
        loading: { type: Boolean, default: false },
        remoteSearch: { type: Boolean, default: false },
        noResultText: { type: String, default: '' },
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const isOpen = ref(false);
        const searchQuery = ref('');
        const dropdownRef = ref<HTMLElement | null>(null);
        const searchInput = ref<HTMLInputElement | null>(null);
        const optionsListRef = ref<HTMLElement | null>(null);
        const isLoading = computed(()=> props.loading)
        const highlightedIndex = ref(-1);
        let searchTimeout: ReturnType<typeof setTimeout> | null = null;


        const openDirection = ref<'down' | 'up'>('down');

        const calculatePosition = () => {
            if (!dropdownRef.value) return;
            const rect = dropdownRef.value.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // 260px is the approx max-height of your dropdown (max-h-50 + padding + search input)
            const requiredSpace = 260;

            // If there's not enough space below, AND there is enough space above, open UP
            if (spaceBelow < requiredSpace && rect.top > requiredSpace) {
                openDirection.value = 'up';
            } else {
                openDirection.value = 'down';
            }
        };

        // --- Error/Message Styling ---
        const messageColorClass = computed(() => {
            if (props.hasError || props.color === 'error') return 'text-error fill-error';
            if (props.color === 'success') return 'text-secondary fill-secondary';
            if (props.color === 'warning') return 'text-warning fill-warning';
            return 'text-on-surface/50 fill-on-surface/50';
        });

        const messageIcon = computed(() => {
            if (props.hasError || props.color === 'error') return 'PhWarningCircle';
            if (props.color === 'success') return 'PhCheckCircle';
            if (props.color === 'warning') return 'PhWarning';
            return 'PhInfo';
        });

        // --- Search Logic ---
        watch(searchQuery, (newVal) => {
            highlightedIndex.value = -1;
            if (props.remoteSearch && props.searchable) {
                if (searchTimeout) clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => { emit('search', newVal); }, 300);
            }
        });

        const filteredOptions = computed(() => {
            if (!props.searchable || props.remoteSearch || !searchQuery.value) return props.options;
            const query = searchQuery.value.toLowerCase();
            return props.options.filter(opt => opt.label.toLowerCase().includes(query));
        });

        const hasExactMatch = computed(() => {
            return props.options.some(opt => opt.label.toLowerCase() === searchQuery.value.toLowerCase().trim());
        });

        // --- TanStack Virtualizer ---
        const virtualizerOptions = computed(() => {
            const el = optionsListRef.value;
            return {
                count: filteredOptions.value.length,
                getScrollElement: () => el,
                estimateSize: () => 42,
                overscan: 5,
            };
        });

        const virtualizer = useVirtualizer(virtualizerOptions);

        // --- Keyboard Navigation ---
        const highlightNext = () => {
            if (!isOpen.value) return toggleDropdown();
            if (highlightedIndex.value < filteredOptions.value.length - 1) {
                highlightedIndex.value++;
                scrollToHighlighted();
            }
        };

        const highlightPrev = () => {
            if (!isOpen.value) return;
            if (highlightedIndex.value > 0) {
                highlightedIndex.value--;
                scrollToHighlighted();
            } else if (props.allowCreate && searchQuery.value && !hasExactMatch.value) {
                highlightedIndex.value = -1;
            }
        };

        const selectHighlighted = () => {
            if (!isOpen.value) return;
            if (highlightedIndex.value === -1 && props.allowCreate && searchQuery.value) {
                createOption();
            } else if (highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
                toggleOption(filteredOptions.value[highlightedIndex.value]);
            }
        };

        const scrollToHighlighted = () => {
            nextTick(() => {
                if (highlightedIndex.value >= 0 && virtualizer.value) {
                    // Navigate Tanstack Virtual scroll
                    virtualizer.value.scrollToIndex(highlightedIndex.value, { align: 'auto' });
                }
            });
        };

        // --- Selection States ---
        const isSelected = (option: DropdownOption) => {
            if (props.multiple && Array.isArray(props.modelValue)) {
                return props.modelValue.includes(option.value);
            }
            return props.modelValue === option.value;
        };

        const selectedItems = computed(() => {
            if (!props.multiple) return [];
            const values = Array.isArray(props.modelValue) ? props.modelValue : [];
            return props.options.filter(opt => values.includes(opt.value));
        });

        const selectedItem = computed(() => {
            if (props.multiple) return null;
            return props.options.find(opt => opt.value === props.modelValue) || null;
        });

        const showPlaceholder = computed(() => {
            if (props.searchable && isOpen.value) return false;
            if (props.multiple) return selectedItems.value.length === 0;
            return !selectedItem.value;
        });

        // --- Methods ---
        const toggleDropdown = () => {
            if (props.disabled) return;
            if (!isOpen.value) {
                calculatePosition();
                isOpen.value = true;

                // Highlight initialization
                if (!props.multiple && selectedItem.value) {
                    const idx = filteredOptions.value.findIndex(opt => opt.value === selectedItem.value!.value);
                    highlightedIndex.value = idx >= 0 ? idx : 0;
                } else {
                    highlightedIndex.value = 0;
                }

                if (props.searchable) {
                    setTimeout(() => searchInput.value?.focus(), 50);
                    if (props.remoteSearch && !searchQuery.value) emit('search', '');
                }

                nextTick(() => {
                    scrollToHighlighted();
                });
            } else {
                closeDropdown();
            }
        };

        const closeDropdown = () => {
            isOpen.value = false;
            searchQuery.value = '';
            highlightedIndex.value = -1;
        };

        const toggleOption = (option: DropdownOption) => {
            if (props.multiple) {
                const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
                const index = currentValues.indexOf(option.value);
                if (index > -1) currentValues.splice(index, 1);
                else currentValues.push(option.value);

                emit('update:modelValue', currentValues);

                if (props.searchable && !props.remoteSearch) {
                    searchQuery.value = '';
                    searchInput.value?.focus();
                }
            } else {
                emit('update:modelValue', option.value);
                closeDropdown();
            }
        };

        const removeItem = (option: DropdownOption) => {
            if (!props.multiple) return;
            const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
            const index = currentValues.indexOf(option.value);
            if (index > -1) {
                currentValues.splice(index, 1);
                emit('update:modelValue', currentValues);
            }
        };

        const createOption = () => {
            if (!searchQuery.value.trim()) return;
            emit('create', searchQuery.value.trim());
            searchQuery.value = '';
            if (!props.multiple) closeDropdown();
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        onMounted(() => document.addEventListener('mousedown', handleClickOutside));
        onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));
        const openOnTab = () => {
            if (!isOpen.value) toggleDropdown();
        };

        const containerClasses = computed(() => {
            const classes = [];
            const c = props.color;
            const isError = props.hasError || c === 'error';

            // --- Background Logic ---
            if (isOpen.value) {
                classes.push('bg-surface');
            } else if (isError) {
                classes.push('bg-error/10');
            } else if (c === 'warning') {
                classes.push('bg-warning/10');
            } else if (c === 'success' || c === 'secondary') {
                // Mapping secondary to success as per your design system
                classes.push('bg-secondary/10');
            } else {
                classes.push('bg-surface-rest');
            }

            // --- Border Logic ---
            if (isError) {
                classes.push('border-error');
            } else if (c === 'warning') {
                classes.push('border-warning');
            } else if (c === 'success' || c === 'secondary') {
                classes.push('border-secondary');
            } else if (isOpen.value) {
                classes.push('border-primary');
            } else {
                classes.push('border-outline');
            }

            // --- Shadow Logic ---
            if (isOpen.value) {
                classes.push('shadow-[0_8px_10px_-3px_rgba(13,13,18,0.05)] dark:shadow-[0_8px_10px_-3px_rgba(0,0,0,0.26)]');
            } else {
                classes.push('shadow-none');
            }

            // --- Disabled Logic ---
            if (props.disabled) {
                classes.push('opacity-50 pointer-events-none');
            }

            return classes;
        });

        return {
            t, isOpen, searchQuery, dropdownRef, searchInput, optionsListRef, highlightedIndex,
            filteredOptions, hasExactMatch, isSelected,
            selectedItems, selectedItem, showPlaceholder,
            messageColorClass, messageIcon, virtualizer,
            toggleDropdown, closeDropdown, toggleOption, removeItem, createOption,
            highlightNext, highlightPrev, selectHighlighted, openOnTab, containerClasses,
            openDirection,isLoading,
        };
    }
});
</script>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
    transition: all 0.2s ease-in-out;
    /* transform-origin is now handled dynamically by Tailwind classes */
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
    opacity: 0;
    transform: scaleY(0.95);
    /* Removed translateY so it doesn't jump the wrong way when opening up */
}

/* Horizontal & Vertical Scrollbar Hiding */
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}

.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>