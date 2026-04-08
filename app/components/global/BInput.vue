<template>
    <div class="b-input-wrapper">
        <span v-if="title.trim().length > 0" class="b-input-title select-none">
            {{ title }} <span v-if="required" class="b-input-required">*</span>
        </span>

        <div :style="inputStyle" class="w-full relative">

            <div class="b-input-focus-border" :class="{ 'is-active': isFocus }"></div>

            <input v-if="!textarea" ref="inputField" :readonly="readonly" :maxlength="maxlength" :type="finalInputType"
                v-model="inputValue" class="b-input" :class="{
                    'is-focused': isFocus,
                    'is-readonly': readonly,
                    'is-disabled': disabled
                }" :tabindex="tabindex" :autocomplete="finalAutocomplete" :enterkeyhint="enterkeyhint"
                :inputmode="type === 'phone' || type === 'number' ? 'numeric' : undefined" :placeholder="placeholder"
                @keypress="handleKeypress" @keydown.enter="handleSubmit" @paste="handlePaste" @focus="handleFocus"
                @blur="handleBlur" :disabled="disabled" />

            <textarea v-else ref="inputField" :readonly="readonly" :maxlength="maxlength" :type="finalInputType"
                v-model="inputValue" class="b-input b-input--textarea"
                :class="{ 'is-focused': isFocus, 'is-readonly': readonly, 'is-disabled': disabled }"
                :tabindex="tabindex" :autocomplete="finalAutocomplete" :enterkeyhint="enterkeyhint"
                :inputmode="type === 'phone' || type === 'number' ? 'numeric' : undefined" :placeholder="placeholder"
                @keypress="handleKeypress" @keydown.enter="handleSubmit" @paste="handlePaste" @focus="handleFocus"
                @blur="handleBlur" :disabled="disabled"></textarea>

            <div class="b-input-slots-wrapper hide-scrollbar absolute inset-0 pointer-events-none flex justify-between items-center"
                :style="{ paddingInline: inputStyle['--i-pad-internal'] }">
                <div ref="startSlotRef" class="pointer-events-auto flex items-center shrink-0">

                    <span v-if="prefix.trim().length > 0" class="b-input-prefix select-none">
                        {{ prefix }}
                    </span>

                    <BIcon v-else-if="icon.trim().length > 0 && type !== 'phone'" :icon="icon"
                        class="b-input-icon cursor-pointer shrink-0" @click="iconClicked" />

                    <div v-else-if="type==='phone'"
                        class="b-input-phone-prefix max-h-64 overflow-visible ltr:pr-2 rtl:pl-2 ltr:border-r rtl:border-l border-outline select-none group">
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

                    <BIcon v-if="prefix.trim().length > 0 && icon.trim().length > 0 && type !== 'password'" :icon="icon"
                        class="b-input-icon cursor-pointer shrink-0" @click="iconClicked" />

                    <BIcon v-if="type === 'password'" :icon="passwordIcon" @click="togglePassword"
                        class="b-input-icon cursor-pointer shrink-0" />
                </div>
            </div>
        </div>

        <div v-if="caption.trim().length > 0" class="b-input-caption select-none">
            {{ caption }}
        </div>

        <div class="b-input-message-wrapper overflow-hidden pt-1.5 h-7">
            <div class="flex items-center gap-x-1.5 transition-all duration-200 ease-in-out"
                :class="[showMessage ? '-translate-y-1 opacity-100' : '-translate-y-4 opacity-0']"
                :style="{ color: messageColor }">
                <BIcon :icon="messageIcon" class="b-input-message-icon shrink-0" />
                <span class="text-xs select-none">{{ displayedMessage }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTemplateRef, type PropType, watch, computed, ref, onMounted, onUnmounted } from 'vue';
import defaultCountries from '~/assets/data/countries.json';
import BMenu from './BMenu.vue';

interface MenuOption {
    title: string;
    key: string;
    color?: 'success' | 'error' | 'primary' | 'warning' | 'neutral';
    icon?: string;
    imageUrl?: string;
}

/* =========================================================================
   INPUT CONFIGURATION OBJECT (THE SINGLE SOURCE OF TRUTH)
   ========================================================================= */
const INPUT_CONFIG = {
    sizing: {
        height: '44px',
        textareaHeight: '100px',
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
        text: 'var(--color-on-background)',
        placeholder: 'var(--color-outline)',
        icon: 'var(--color-on-background)',
        title: 'var(--color-on-background)',
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
    modelValue: { type: String, default: '' },
    type: { type: String as PropType<'text' | 'password' | 'phone' | 'number' | 'slug'>, default: 'text' },
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
    caption: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'submit', 'paste', 'action']);

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

/* --- VALUE WATCHERS & FORMATTING --- */
watch(() => props.modelValue, (newVal) => { inputValue.value = newVal; });

watch(() => inputValue.value, (newVal) => {
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
    if (props.type === 'password') return showPassword.value ? 'text' : 'password';
    if (['phone', 'number', 'slug'].includes(props.type)) return 'text';
    return props.type;
});

const passwordIcon = computed(() => showPassword.value ? 'PhEyeSlash' : 'PhEye');
const finalAutocomplete = computed(() => props.autocomplete === 'off' ? 'new-password' : props.autocomplete);

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

defineExpose({ focus: () => inputField.value?.focus(), blur: () => inputField.value?.blur() });
</script>

<style scoped>
.b-input-wrapper {
    width: 100%;
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
    color: var(--i-placeholder);
    opacity: 1;
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
    color: var(--i-addon-text);
}

.b-input-passfix {
    opacity: 0.5;
}

.b-input-phone-prefix {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--i-addon-text);
    font-size: var(--i-font-size);
    opacity: 1;
}



.b-input-icon {
    width: var(--i-icon-size);
    height: var(--i-icon-size);
    fill: var(--i-icon-color);
    color: var(--i-icon-color);
}

.b-input-message-icon {
    width: var(--i-msg-icon-size);
    height: var(--i-msg-icon-size);
    fill: currentColor;
}

.b-input-caption {
    padding-top: 6px;
    width: 100%;
    color: var(--i-caption-color);
    font-size: var(--i-caption-size);
}
</style>