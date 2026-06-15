<template>
    <div class="b-input-wrapper">

        <div class=" text-label-sm mb-1.5 select-none text-on-surface">{{ title }}</div>
        <div :style="inputStyle" class="w-full relative">
            <div id="shit" v-show="type === 'date'" class="absolute inset-0 z-20  h-full w-full">

                <BMenu ref="dateMenuRef">
                    <template #trigger>
                        <div v-if="type === 'date'" class="w-full cursor-pointer h-11"></div>
                    </template>
                    <BDatePicker :model-value="parsedModelDate" @update:model-value="handleDateSelect"
                        @close="closeDateMenu" />
                </BMenu>
            </div>
            <div v-if="options.length > 0"
                class=" rtl:origin-left ltr:origin-right flex items-center ltr:rtl:rounded-r-(--i-radius) rtl:rounded-l-(--i-radius) h-full absolute z-10  rtl:left-0 ltr:right-0">
                <BMenu @select="handleOptionSelect" :options="options">
                    <template #trigger="{ isOpen }">
                        <div class="flex rtl:pl-4 ltr:pr-4 cursor-pointer text-on-surface/50 items-center gap-x-3">
                            <div class=" border h-5 border-outline"></div>
                            <div class=" text-body-md select-none">{{ selectedOption }}</div>
                            <BIcon class="  transition-all duration-200 ease-in-out "
                                :class="[isOpen ? 'rotate-180' : 'rotate-0']" icon="PhCaretDown" />
                        </div>
                    </template>
                </BMenu>
            </div>
            <input v-if="!textarea && preset !== 'time'" ref="inputField" :id="`b-input-${uniqueId}`"
                :key="finalInputType" :name="`field-${uniqueId}`"
                :readonly="readonly || type === 'date' || (type === 'password' && !isFocus)" :maxlength="maxlength"
                :type="finalInputType" v-model="inputValue" class="b-input" :class="[
                    {
                        'font-latin': latin,
                        'is-focused': isFocus,
                        'is-readonly': readonly,
                        'is-disabled': disabled,
                        'b-input-password-mask': type === 'password' && !showPassword && (autocomplete === 'off' || autocomplete === 'new-password')
                    },
                    textAlign
                ]" :tabindex="tabindex" :autocomplete="finalAutocomplete" :enterkeyhint="enterkeyhint"
                :inputmode="type === 'phone' || type === 'number' ? 'numeric' : undefined" :placeholder="placeholder"
                @keypress="handleKeypress" @keydown.enter="handleSubmit" @paste="handlePaste" @focus="handleFocus"
                @blur="handleBlur" :disabled="disabled" />
            <div v-else-if="preset === 'time'" dir="ltr"
                class="b-input flex items-center justify-center gap-x-1 cursor-text"
                :class="{ 'is-focused': isFocus, 'is-readonly': readonly, 'is-disabled': disabled }"
                @click="focusTimeInput">

                <input ref="hoursInput" :value="hours" @input="e => handleTimeInput('h', e)"
                    @keydown="e => handleTimeKeydown('h', e)" @focus="handleTimeFocus('h')" @blur="handleTimeBlur('h')"
                    :disabled="disabled" :readonly="readonly" :class="{ 'font-latin': latin, }"
                    class="w-7 text-center bg-transparent outline-none p-0 border-none text-inherit font-inherit placeholder:text-inherit placeholder:opacity-50"
                    placeholder="00" inputmode="numeric" maxlength="2" />

                <span class="text-on-surface select-none pb-0.5 opacity-70">:</span>

                <input ref="minutesInput" :value="minutes" @input="e => handleTimeInput('m', e)"
                    @keydown="e => handleTimeKeydown('m', e)" @focus="handleTimeFocus('m')" @blur="handleTimeBlur('m')"
                    :disabled="disabled" :readonly="readonly || isMinutesLocked"
                    class="w-7 text-center bg-transparent outline-none p-0 border-none text-inherit font-inherit placeholder:text-inherit placeholder:opacity-50 transition-opacity"
                    :class="{ 'opacity-30 pointer-events-none': isMinutesLocked, 'font-latin': latin, }"
                    placeholder="00" inputmode="numeric" maxlength="2" />
            </div>
            <input autocomplete="false" name="hidden" type="text" style="display:none;">

            <textarea v-if="textarea" ref="inputField" :readonly="readonly" :maxlength="maxlength"
                :type="finalInputType" v-model="inputValue" class="b-input b-input--textarea"
                :class="{ 'is-focused': isFocus, 'is-readonly': readonly, 'font-latin': latin, 'is-disabled': disabled }"
                :tabindex="tabindex" :autocomplete="finalAutocomplete" :enterkeyhint="enterkeyhint"
                :inputmode="type === 'phone' || type === 'number' ? 'numeric' : undefined" :placeholder="placeholder"
                @keypress="handleKeypress" @keydown.enter="handleSubmit" @paste="handlePaste" @focus="handleFocus"
                @blur="handleBlur" :disabled="disabled"></textarea>

            <div class="b-input-slots-wrapper max-h-full hide-scrollbar absolute inset-0 pointer-events-none flex justify-between items-center"
                :style="{ paddingInline: inputStyle['--i-pad-internal'] }">
                <div ref="startSlotRef" class="pointer-events-auto flex items-center shrink-0">

                    <span v-if="prefix.trim().length > 0" class="b-input-prefix select-none">
                        {{ prefix }}
                    </span>

                    <BIcon v-else-if="finalIcon.trim().length > 0 && type !== 'phone'" :icon="finalIcon"
                        class="b-input-icon cursor-pointer shrink-0" @click="iconClicked" />

                    <div v-else-if="type === 'phone'"
                        class="b-input-phone-prefix text-on-surface/50 max-h-64 overflow-visible ltr:pr-2 rtl:pl-2 ltr:border-r rtl:border-l border-outline select-none group">
                        <div class="w-4 h-4 rounded-full overflow-hidden shrink-0">
                            <img :src="flagUrl" class="scale-150 w-full h-full object-cover" />
                        </div>
                        <span>{{ selectedCountry?.dial_code }}</span>
                    </div>
                </div>

                <div ref="endSlotRef" class="pointer-events-auto flex items-center shrink-0">

                    <span v-if="passfix.trim().length > 0" class="b-input-passfix select-none">
                        {{ passfix }}
                    </span>

                    <BIcon v-if="prefix.trim().length > 0 && finalIcon.trim().length > 0 && type !== 'password'"
                        :icon="finalIcon" class="b-input-icon cursor-pointer shrink-0" @click="iconClicked" />

                    <BIcon v-if="type === 'password'" :icon="passwordIcon" @click="togglePassword"
                        class="b-input-icon cursor-pointer shrink-0" />
                </div>
            </div>
        </div>
        <div v-if="caption.trim().length > 0" class="b-input-caption select-none">
            {{ caption }}
        </div>

        <div class="b-input-message-wrapper -translate-y-0 overflow-hidden h-4">
            <div class="flex items-center gap-x-1.5 transition-all duration-200 ease-in-out"
                :class="[showMessage ? `${!newPassword ? 'translate-y-0' : 'translate-y-1'} opacity-100` : '-translate-y-4 opacity-0']"
                :style="{ color: messageColor }">
                <BIcon :icon="messageIcon" class="b-input-message-icon shrink-0" />
                <span class="text-xs select-none">{{ displayedMessage }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTemplateRef, type PropType, watch, computed, ref, onMounted, onUnmounted, useId } from 'vue';
import defaultCountries from '~/assets/data/countries.json';
import { useDate } from '#imports';
import type { MenuOption } from '~/types/components/menu-options';
import type { Menu } from '~/types/components/menu';
const uniqueId = useId();


/* =========================================================================
   INPUT CONFIGURATION OBJECT (THE SINGLE SOURCE OF TRUTH)
   ========================================================================= */
const INPUT_CONFIG = {
    sizing: {
        height: '44px',
        textareaHeight: '94px',
        radius: '10px',
        borderWidth: '1px',
        paddingInternal: '12px',
        gap: '8px',
        fontSize: 'var(--text-body-md)',
        fontFamily: 'inherit',
        titleSize: 'var(--text-label-sm)',
        captionSize: '12px',
        iconSize: '20px',
        messageIconSize: '24px'
    },

    colors: {
        bgDisabled: 'var(--color-surface-variant)',
        text: 'var(--color-on-surface)',
        placeholder: 'var(--color-outline)',
        icon: 'var(--color-on-surface)',
        title: 'var(--color-on-surface)',
        caption: 'var(--color-outline)'
    },

    focus: {
        borderGradient: 'var(--background-image-diamond-primary-secondary)'
    },

    variants: (c: string) => {
        const map: Record<string, { bg: string, border: string, message: string }> = {
            error: {
                bg: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
                border: 'var(--color-error)',
                message: 'var(--color-error)'
            },
            warning: {
                bg: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
                border: 'var(--color-warning)',
                message: 'var(--color-warning)'
            },
            success: {
                bg: 'color-mix(in srgb, var(--color-secondary) 10%, transparent)',
                border: 'var(--color-secondary)',
                message: 'var(--color-secondary)'
            },
            secondary: {
                bg: 'color-mix(in srgb, var(--color-secondary) 10%, transparent)',
                border: 'var(--color-secondary)',
                message: 'var(--color-secondary)'
            },
            primary: {
                bg: 'var(--color-surface)',
                border: 'var(--color-outline)',
                message: 'var(--color-primary)'
            }
        };
        return map[c] || map.primary;
    },

    addon: {
        bg: 'transparent',
        text: 'var(--color-on-surface)',
        radius: '6px',
        height: '32px'
    }
};

/* --- NATIVE HTML-LIKE PROPS --- */
const props = defineProps({
    modelValue: { type: [String, Date] as PropType<string | Date>, default: '' },
    newPassword: {
        type: Boolean,
        default: false,
    },
    type: { type: String as PropType<'text' | 'password' | 'phone' | 'number' | 'slug' | 'date'>, default: 'text' },
    title: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    message: { type: String, default: '' },
    color: { type: String, default: 'primary' },
    icon: { type: String, default: '' },
    tabindex: { type: [Number, String], default: 0 },
    autocomplete: { type: String, default: 'on' },
    enterkeyhint: { type: String as PropType<"enter" | "search" | "done" | "go" | "next" | "previous" | "send" | undefined>, default: 'enter' },
    maxlength: { type: [Number, String], default: undefined },
    required: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    textarea: { type: Boolean, default: false },
    prefix: { type: String, default: '' },
    passfix: { type: String, default: '' },
    caption: { type: String, default: '' },
    latin: { type: Boolean, default: false },
    selectedOptionKey: { type: String, default: '' },
    options: {
        type: Array as PropType<MenuOption[]>,
        default: () => []
    },
    align: { type: String as PropType<'' | 'left' | 'right' | 'center'>, default: '' },
    preset: { type: String as PropType<'' | 'time'>, default: '' }
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'submit', 'paste', 'action', 'select']);
const textAlign = computed(() => `text-${props.align}`)
const { formatDate, parseDate } = useDate();

/* --- STATE --- */
const showPassword = ref(false);
const inputValue = ref(props.modelValue);
const isFocus = ref(false);
const isPhoneMenuOpen = ref(false);
const inputField = useTemplateRef<HTMLInputElement | HTMLTextAreaElement>('inputField');
const selectedCountryCode = ref('IR');

/* --- DYNAMIC PADDING LOGIC (RTL/LTR Safe) --- */
const startSlotRef = ref<HTMLElement | null>(null);
const endSlotRef = ref<HTMLElement | null>(null);
const startSlotWidth = ref(0);
const endSlotWidth = ref(0);
let resizeObserver: ResizeObserver | null = null;
const selectedOptionIndex = ref(0)
const selectedOption = computed(() => {
    if (props.options.length === 0) return ''
    return props.options[selectedOptionIndex.value]?.label
})

const handleOptionSelect = (key: string) => {
    selectedOptionIndex.value = props.options.findIndex((option) => option.key === key)
    emit('select', key)
}

onMounted(() => {
    if (process.client) {
        resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === startSlotRef.value) startSlotWidth.value = entry.contentRect.width;
                if (entry.target === endSlotRef.value) endSlotWidth.value = entry.contentRect.width;
            }
        });
        if (startSlotRef.value) resizeObserver.observe(startSlotRef.value);
        if (endSlotRef.value) resizeObserver.observe(endSlotRef.value);
    }
});

onUnmounted(() => {
    if (resizeObserver) resizeObserver.disconnect();
});

/* --- CSS VARIABLES INJECTOR --- */
const inputStyle = computed(() => {
    const padInt = parseInt(INPUT_CONFIG.sizing.paddingInternal);
    const gap = parseInt(INPUT_CONFIG.sizing.gap);

    const startPad = startSlotWidth.value > 0 ? startSlotWidth.value + padInt + gap : padInt;
    const endPad = endSlotWidth.value > 0 ? endSlotWidth.value + padInt + gap : padInt;

    const variantMap = INPUT_CONFIG.variants(props.color);

    return {
        '--i-pad-start': `${startPad}px`,
        '--i-pad-end': `${endPad}px`,
        '--i-pad-internal': INPUT_CONFIG.sizing.paddingInternal,

        '--i-height': INPUT_CONFIG.sizing.height,
        '--i-textarea-height': INPUT_CONFIG.sizing.textareaHeight,
        '--i-radius': INPUT_CONFIG.sizing.radius,
        '--i-border-width': INPUT_CONFIG.sizing.borderWidth,
        '--i-font-size': INPUT_CONFIG.sizing.fontSize,

        '--i-bg': variantMap.bg,
        '--i-bg-disabled': INPUT_CONFIG.colors.bgDisabled,
        '--i-text': INPUT_CONFIG.colors.text,
        '--i-placeholder': INPUT_CONFIG.colors.placeholder,
        '--i-border': variantMap.border,
        '--i-border-focus-gradient': INPUT_CONFIG.focus.borderGradient,

        '--i-addon-bg': INPUT_CONFIG.addon.bg,
        '--i-addon-text': INPUT_CONFIG.addon.text,
        '--i-addon-radius': INPUT_CONFIG.addon.radius,
        '--i-addon-height': INPUT_CONFIG.addon.height,

        '--i-title-color': INPUT_CONFIG.colors.title,
        '--i-title-size': INPUT_CONFIG.sizing.titleSize,
        '--i-caption-color': INPUT_CONFIG.colors.caption,
        '--i-caption-size': INPUT_CONFIG.sizing.captionSize,
        '--i-icon-color': INPUT_CONFIG.colors.icon,
        '--i-icon-size': INPUT_CONFIG.sizing.iconSize,
        '--i-msg-icon-size': INPUT_CONFIG.sizing.messageIconSize,
    };
});

const hours = ref('');
const minutes = ref('');
const tempHours = ref(''); // Stores value temporarily on click
const tempMinutes = ref('');
const hoursInput = useTemplateRef<HTMLInputElement>('hoursInput');
const minutesInput = useTemplateRef<HTMLInputElement>('minutesInput');

/* --- PHONE / COUNTRIES LOGIC --- */
const countryOptions = computed<MenuOption[]>(() => {
    return defaultCountries.map(c => ({
        title: `${c.name} (${c.dial_code})`,
        key: c.code,
        // Using correct path instead of raw emoji to prevent 404 IPX error
        imageUrl: `/flags/${c.code.toLowerCase()}.svg`
    }));
});

const selectedCountry = computed(() => {
    return defaultCountries.find(c => c.code.toUpperCase() === selectedCountryCode.value.toUpperCase()) || defaultCountries;
});

const flagUrl = computed(() => {
    if (!selectedCountry.value) return '';
    return `/flags/${selectedCountry.value.code.toLowerCase()}.svg`;
});

const handleCountrySelect = (code: string) => {
    selectedCountryCode.value = code;
    isPhoneMenuOpen.value = false;
};

watch(() => props.selectedOptionKey, (newKey) => {
    if (props.options.length > 0 && newKey) {
        const idx = props.options.findIndex(opt => opt.key === newKey);
        if (idx > -1) selectedOptionIndex.value = idx;
    }
}, { immediate: true });

watch(() => props.modelValue, (val) => {
    if (props.options.length > 0 && props.selectedOptionKey) {
        const idx = props.options.findIndex(opt => opt.key === props.selectedOptionKey);
        if (idx > -1) selectedOptionIndex.value = idx;
    }

    // --- ADDED: Intercept 'date' type for localized formatting ---
    if (props.type === 'date') {
        if (val) {
            // Check if it's already a Date object, otherwise parse it
            const d = val instanceof Date ? val : parseDate(val);

            if (d instanceof Date && !isNaN(d.getTime())) {
                inputValue.value = formatDate(d, {
                    showWeekday: false,
                    useRelativeDay: false,
                    showTime: false
                });
            } else {
                inputValue.value = typeof val === 'string' ? val : '';
            }
        } else {
            inputValue.value = '';
        }
    } else if (props.preset === 'time') {
        if (val) {
            const [h, m] = String(val).split(':');
            if (hours.value !== h) hours.value = h || '';
            if (minutes.value !== m) minutes.value = m || '';
        } else {
            hours.value = '';
            minutes.value = '';
        }
    } else {
        inputValue.value = String(val); // Cast to string safely
    }
}, { immediate: true });

watch(() => inputValue.value, (newVal) => {
    // --- ADDED: Block 'date' type from emitting the formatted string back ---
    if (props.preset === 'time' || props.type === 'date') return;

    if (!newVal) return emit('update:modelValue', '');

    if (props.type === 'number' || props.type === 'phone') {
        const filtered = newVal.replace(/[^0-9]/g, '');
        if (filtered !== newVal) { inputValue.value = filtered; return; }
    } else if (props.type === 'slug') {
        let filtered = newVal.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
        if (filtered !== newVal) { inputValue.value = filtered; return; }
    }
    emit('update:modelValue', inputValue.value);
});

/* Strict keypress logic for numbers */
const handleKeypress = (e: KeyboardEvent) => {
    if ((props.type === 'phone' || props.type === 'number') && !/[0-9]/.test(e.key)) {
        e.preventDefault();
    }
};

const handlePaste = (e: ClipboardEvent) => {
    emit('paste', e);
    const pasteData = e.clipboardData?.getData('text') || '';
    if ((props.type === 'phone' || props.type === 'number') && !/^[0-9]+$/.test(pasteData)) {
        e.preventDefault();
    } else if (props.type === 'slug' && !/^[a-zA-Z0-9\s-]*$/.test(pasteData)) {
        e.preventDefault();
    }
};

/* --- EVENTS --- */
const handleFocus = () => { isFocus.value = true; emit('focus'); };
const handleBlur = () => { isFocus.value = false; emit('blur'); };
const togglePassword = () => { showPassword.value = !showPassword.value; };
const handleSubmit = () => emit('submit', inputValue.value);
const iconClicked = () => emit('action');

/* --- COMPUTEDS --- */
const finalInputType = computed(() => {
    if (props.type === 'password') {
        if (showPassword.value) return 'text';
        if (props.autocomplete === 'off' || props.autocomplete === 'new-password') return 'text';
        return 'password';
    }

    if (['phone', 'number', 'slug', 'date'].includes(props.type)) return 'text';
    return props.type;
});

const passwordIcon = computed(() => showPassword.value ? 'PhEyeSlash' : 'PhEye');
const finalAutocomplete = computed(() => {
    // Browsers ignore "off". Passing an unrecognized string forces them to disable autofill completely.
    if (props.autocomplete === 'off') return 'new-password';

    // Respect explicit custom strings
    if (props.autocomplete === 'new-password') return 'new-password';

    // Default handling for password types when no specific autocomplete is provided
    if (props.type === 'password' && (props.autocomplete === 'on' || props.autocomplete === '')) {
        return props.newPassword ? 'new-password' : 'current-password';
    }

    return props.autocomplete;
});
const showMessage = ref(props.message.trim().length > 0);
const displayedMessage = ref(props.message);
const messageColor = computed(() => INPUT_CONFIG.variants(props.color).message);

watch(() => props.message, (newMsg) => {
    if (newMsg.trim().length > 0) {
        displayedMessage.value = newMsg;
        showMessage.value = true;
    } else {
        showMessage.value = false;
    }
});

const messageIcon = computed(() => {
    switch (props.color) {
        case 'success': return 'PhCheckCircle';
        case 'error':
        case 'warning': return 'PhWarning';
        default: return 'PhWarningCircle';
    }
});

const isMinutesLocked = computed(() => !hours.value && !tempHours.value);

const focusTimeInput = (e: MouseEvent) => {
    // Prevent hijacking focus if the user explicitly clicked inside one of the inputs
    if (e.target === minutesInput.value || e.target === hoursInput.value) return;

    if (isMinutesLocked.value) hoursInput.value?.focus();
    else minutesInput.value?.focus();
};

const handleTimeFocus = (type: 'h' | 'm') => {
    handleFocus();
    // Temporarily clear the visual input and store it so they can type easily
    if (type === 'h') {
        tempHours.value = hours.value;
        hours.value = '';
    } else {
        tempMinutes.value = minutes.value;
        minutes.value = '';
    }
};

const handleTimeInput = (type: 'h' | 'm', e: Event) => {
    const target = e.target as HTMLInputElement;
    let val = target.value.replace(/[^0-9]/g, '');

    let shouldAdvance = false;

    if (type === 'h') {
        if (val.length === 1 && parseInt(val) > 2) val = `0${val}`;
        else if (val.length > 0 && parseInt(val) > 23) val = '23';

        hours.value = val;
        tempHours.value = val;

        // Flag to advance, but don't do it yet
        if (val.length === 2) shouldAdvance = true;
    } else {
        if (val.length === 1 && parseInt(val) > 5) val = `0${val}`;
        else if (val.length > 0 && parseInt(val) > 59) val = '59';

        minutes.value = val;
        tempMinutes.value = val;
    }

    target.value = val;
    emitTime();
    if (shouldAdvance) {
        nextTick(() => minutesInput.value?.focus());
    }
};

const handleTimeKeydown = (type: 'h' | 'm', e: KeyboardEvent) => {
    if (type === 'h') {
        if (['Enter', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
            if (!hours.value) return;
            e.preventDefault();
            if (hours.value.length === 1) {
                hours.value = `0${hours.value}`;
                tempHours.value = hours.value;
                emitTime(); // Ensure emit happens before jumping
            }
            // Delay focus here as well
            nextTick(() => minutesInput.value?.focus());
        }
    } else if (type === 'm') {
        if (e.key === 'Backspace' && minutes.value === '') {
            e.preventDefault();
            hoursInput.value?.focus();
        }
    }
};

const handleTimeBlur = (type: 'h' | 'm') => {
    handleBlur();

    // Revert to temporary variable if blurred while empty, otherwise pad single digits
    if (type === 'h') {
        if (hours.value === '') hours.value = tempHours.value;
        else if (hours.value.length === 1) hours.value = `0${hours.value}`;
    } else {
        if (minutes.value === '') minutes.value = tempMinutes.value;
        else if (minutes.value.length === 1) minutes.value = `0${minutes.value}`;
    }

    emitTime();
};

const emitTime = () => {
    const h = hours.value || tempHours.value || '';
    const m = minutes.value || tempMinutes.value || '';

    if (!h && !m) emit('update:modelValue', '');
    else emit('update:modelValue', `${h || '00'}:${m || '00'}`);
};

const dateMenuRef = useTemplateRef<Menu>('dateMenuRef');

const parsedModelDate = computed(() => {
    if (!props.modelValue) return new Date();
    const d = parseDate(props.modelValue);
    if (d instanceof Date && !isNaN(d.getTime())) {
        return d;
    }
    return new Date();
});
const handleDateSelect = (d: Date) => {
    emit('update:modelValue', d);
    closeDateMenu();
};

const finalIcon = computed(() => {
    if (props.type === 'date') return 'PhCalendarDots'
    return props.icon
})

const closeDateMenu = () => {
    dateMenuRef.value?.close()
};

defineExpose({ focus: () => inputField.value?.focus(), blur: () => inputField.value?.blur() });
</script>

<style scoped>
.b-input-wrapper {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    position: relative;
}

.b-input-title {
    color: var(--i-title-color);
    font-size: var(--i-title-size);
    font-weight: 500;
    margin-bottom: 4px;
}

.b-input-required {
    color: var(--color-error, red);
}

.b-rounded {
    border-radius: var(--i-radius);
}

.b-input {
    width: 100%;
    box-sizing: border-box;
    outline: none;
    transition: background-color 0.3s ease, border-color 0.3s ease;

    height: var(--i-height);
    border-radius: var(--i-radius);
    font-size: var(--i-font-size);
    font-family: var(--i-font-family);
    font-weight: 500;

    background-color: var(--i-bg);
    color: var(--i-text);

    border: var(--i-border-width) solid var(--i-border);
    padding-inline-start: var(--i-pad-start);
    padding-inline-end: var(--i-pad-end);
}

.b-input-focus-border {
    position: absolute;
    inset: 0;
    border-radius: var(--i-radius);
    padding: var(--i-border-width);
    background: var(--i-border-focus-gradient);

    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;

    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 1;
}

.b-input-focus-border.is-active {
    opacity: 1;
}

.b-input.is-focused {
    background-color: transparent;
    border-color: var(--color-primary);
}

.b-input--textarea {
    height: var(--i-textarea-height);
    resize: none;
    padding-top: var(--i-pad-internal);
}

.b-input::placeholder {
    color: var(--color-on-surface);
    opacity: 0.5;
}

.b-input.is-readonly {
    opacity: 0.7;
}

.b-input.is-disabled {
    background-color: var(--i-bg-disabled);
    border-color: var(--color-outline);
    cursor: not-allowed;
    opacity: 0.6;
}

.b-input-slots-wrapper {
    padding-inline: var(--i-pad-internal);
    overflow: visible;
}

.b-input-prefix,
.b-input-passfix {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--i-font-size);
    font-weight: 500;
    color: var(--color-on-surface);
    opacity: 0.5;
}

.b-input-passfix {
    opacity: 0.5;
}

.b-input-phone-prefix {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--i-font-size);
    opacity: 1;
}



.b-input-icon {
    width: var(--i-icon-size);
    height: var(--i-icon-size);
    fill: var(--color-on-surface);
    color: var(--i-icon-color);
    opacity: 0.5;
}

.b-input-message-icon {
    width: var(--i-msg-icon-size);
    height: var(--i-msg-icon-size);
    fill: currentColor;
}

.b-input-caption {
    padding-top: 6px;
    width: 100%;
    color: var(--color-on-surface);
    font-size: var(--i-caption-size);
}

.b-input-password-mask {
    -webkit-text-security: disc !important;
    text-security: disc !important;
}
</style>
