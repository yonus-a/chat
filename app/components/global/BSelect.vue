<template>
    <div class="w-75 flex flex-col outline-none" 
         ref="dropdownRef" 
         tabindex="0"
         @keydown.down.prevent="highlightNext" 
         @keydown.up.prevent="highlightPrev" 
         @keydown.enter.prevent="selectHighlighted"
         @keydown.esc.prevent="closeDropdown">

        <span v-if="title" class="text-xs font-medium mb-1.5 select-none text-on-surface">
            {{ title }}
        </span>

        <div class="relative w-full">
            
            <div @click="toggleDropdown" 
                 class="h-12 w-full px-3 py-[10px] rounded-[10px] border flex items-center gap-x-2 transition-all duration-300 cursor-pointer bg-surface-rest"
                 :class="[
                    disabled ? 'opacity-50 pointer-events-none' : '',
                    // Shadow logic: 2/3 of the options menu shadow when open
                    isOpen ? 'shadow-[0_8px_10px_-3px_rgba(13,13,18,0.05)] dark:shadow-[0_8px_10px_-3px_rgba(0,0,0,0.26)]' : 'shadow-none',
                    // Border logic: Keep outline-container unless explicitly assigned color/error
                    (hasError || color === 'error') ? 'border-error' : (color !== 'primary' ? `border-${color}` : (isOpen ? ' border-primary' :' border-surface-variant-2'))
                 ]">
                
                <BIcon v-if="icon" :icon="icon" class="w-5 h-5 shrink-0 fill-on-background" />

                <div class="flex-1 flex items-center gap-x-2 overflow-x-auto overflow-y-hidden hide-scrollbar h-full">
                    
                    <template v-if="multiple && selectedItems.length > 0">
                        <div v-for="item in selectedItems" :key="item.value" @click.stop
                            class="flex items-center gap-x-2 h-7 bg-surface-variant-3 px-2 rounded-lg  shrink-0">
                            <span class="text-[14px] font-medium text-on-background whitespace-nowrap">{{ item.label }}</span>
                            <BIcon @click.stop="removeItem(item)" icon="PhX" class="w-[14px] h-[14px] cursor-pointer fill-on-background opacity-50 transition-opacity hover:opacity-100" />
                        </div>
                    </template>

                    <span v-if="!multiple && selectedItem && (!searchable || !isOpen)" 
                          class="text-[14px] font-medium select-none truncate text-on-background opacity-100 shrink-0">
                        {{ selectedItem.label }}
                    </span>

                    <span v-if="showPlaceholder" 
                          class="text-[14px] font-medium select-none truncate text-on-background opacity-50 shrink-0">
                        {{ placeholder }}
                    </span>

                    <input v-if="searchable && isOpen" 
                        ref="searchInput" 
                        v-model="searchQuery" 
                        @click.stop
                        class="flex-1 min-w-[60px] bg-transparent outline-none text-[14px] font-medium text-on-background placeholder:text-on-background/50 h-full"
                        :placeholder="multiple && selectedItems.length > 0 ? '' : placeholder" 
                    />
                </div>

              <!---
              <BIcon v-if="loading" icon="PhSpinner" class="w-6 h-6 shrink-0 fill-primary animate-spin" />
              -->
                <BIcon icon="PhCaretDown" 
                       class="w-5 h-5 fill-on-surface/50 shrink-0 fill-on-background transition-transform duration-300"
                       :class="[isOpen ? 'rotate-180' : '', disabled ? 'opacity-40' : '']" />
            </div>

            <transition name="dropdown-fade">
                <div v-if="isOpen"
                    class="absolute top-[calc(100%+6px)] left-0 w-full bg-surface rounded-[12px] p-[8px] z-50 flex flex-col shadow-[0_12px_16px_-4px_rgba(13,13,18,0.08)] dark:shadow-[0_12px_16px_-4px_rgba(0,0,0,0.4)]">
                    
                    <div v-if="loading" class="flex items-center justify-center h-[75px] w-full">
                        <BIcon icon="PhCircleNotch" class="w-[28px] h-[28px] animate-spin fill-outline" />
                    </div>

                    <template v-else>
                        <div v-if="allowCreate && searchQuery && !hasExactMatch" @click.stop="createOption"
                            :class="['flex items-center gap-x-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out mb-[2px] shrink-0', highlightedIndex === -1 ? 'bg-surface-container' : 'hover:bg-surface-container']">
                            <BIcon icon="PhPlus" class="w-6 h-6 fill-primary shrink-0" />
                            <span class="text-[14px] font-medium text-primary select-none">{{ t('general.addNew') || 'Add' }}: "{{ searchQuery }}"</span>
                        </div>

                        <div v-if="filteredOptions.length === 0 && (!allowCreate || !searchQuery)" 
                            class="flex items-center justify-center gap-x-2 py-6 text-on-background/50">
                            <span class="text-[14px] font-medium">{{ noResultText || t('addresses.noResults') || 'No results found!' }}</span>
                        </div>

                        <div v-if="filteredOptions.length > 0" class="overflow-y-auto max-h-50 " ref="optionsListRef">
                            <div :style="{ height: `${virtualizer.getTotalSize()}px`, position: 'relative', width: '100%' }">
                                <div v-for="virtualRow in virtualizer.getVirtualItems()" :key="virtualRow.key"
                                    :style="{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualRow.size - 2}px`, // Math to leave 2px gap
                                        transform: `translateY(${virtualRow.start}px)`
                                    }"
                                    @click.stop="toggleOption(filteredOptions[virtualRow.index])"
                                    :class="[
                                        'flex items-center gap-x-2 px-2 rounded-lg cursor-pointer transition-colors duration-200 ease-in-out',
                                        isSelected(filteredOptions[virtualRow.index]) || highlightedIndex === virtualRow.index ? 'bg-surface-container' : 'bg-transparent'
                                    ]">
                                    
                                    <div v-if="multiple" class="shrink-0 pointer-events-none">
                                        <DCheckBox :modelValue="isSelected(filteredOptions[virtualRow.index])" />
                                    </div>

                                    <BImage v-if="filteredOptions[virtualRow.index].image" :src="filteredOptions[virtualRow.index].image" class="w-6 max-w-6 max-h-6 min-h-6 min-w-6 rounded-sm h-6 shrink-0 object-cover" />
                                    <BIcon v-else-if="filteredOptions[virtualRow.index].icon" :icon="filteredOptions[virtualRow.index].icon" class="w-6 h-6 shrink-0" 
                                           :class="isSelected(filteredOptions[virtualRow.index]) ? 'fill-primary' : 'fill-on-background'" />
                                    
                                    <span class="text-[14px] font-medium line-clamp-1 text-ellipsis overflow-hidden flex-1" 
                                          :class="isSelected(filteredOptions[virtualRow.index]) ? 'text-primary' : 'text-on-background'">
                                        {{ filteredOptions[virtualRow.index].label }}
                                    </span>

                                    <BIcon v-if="isSelected(filteredOptions[virtualRow.index])" 
                                           icon="PhCheck" class="w-5 h-5 fill-primary ms-auto shrink-0" />
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

export interface DropdownOption {
    label: string;
    value: string | number;
    icon?: string;
    image?: string; 
}

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
        noResultText: { type: String, default: '' }
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const isOpen = ref(false);
        const searchQuery = ref('');
        const dropdownRef = ref<HTMLElement | null>(null);
        const searchInput = ref<HTMLInputElement | null>(null);
        const optionsListRef = ref<HTMLElement | null>(null);
        const highlightedIndex = ref(-1);
        let searchTimeout: ReturnType<typeof setTimeout> | null = null;

        // --- Error/Message Styling ---
        const messageColorClass = computed(() => {
            if (props.hasError || props.color === 'error') return 'text-error fill-error';
            if (props.color === 'success') return 'text-success fill-success';
            if (props.color === 'warning') return 'text-warning fill-warning';
            return 'text-on-background/50 fill-on-background/50';
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
        const virtualizerOptions = computed(() => ({
            count: filteredOptions.value.length,
            getScrollElement: () => optionsListRef.value,
            estimateSize: () => 42, // 40px item height + 2px gap = 42px
            overscan: 5,
        }));
        
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

        return {
            t, isOpen, searchQuery, dropdownRef, searchInput, optionsListRef, highlightedIndex,
            filteredOptions, hasExactMatch, isSelected,
            selectedItems, selectedItem, showPlaceholder,
            messageColorClass, messageIcon, virtualizer,
            toggleDropdown, closeDropdown, toggleOption, removeItem, createOption,
            highlightNext, highlightPrev, selectHighlighted
        };
    }
});
</script>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
    transition: all 0.2s ease-in-out;
    transform-origin: top;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
    opacity: 0;
    transform: translateY(-5px) scaleY(0.95);
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