<template>
    <div class="w-full max-w-90">
        <span class="text-greyscale-900 select-none text-xs font-medium mb-1" v-if="title.trim().length > 0">
            {{ title }} <span class=" text-error select-none" v-if="required">*</span>
        </span>
        <div class="w-full relative">
            <input v-if="!textarea" :readonly="readonly" :maxlength="maxlength" ref="inputField" :type="finalInputType"
                v-model="inputValue" :class="[borderColor]" :style="dynamicInputStyle" :tabindex="tabindex"
                :autocomplete="finalAutocomplete" :enterkeyhint="enterkeyhint" @keydown.enter="handleSubmit"
                @paste="handlePaste" :inputmode="type === 'number' ? 'numeric' : undefined" @focus="handleFocus"
                @blur="handleBlur" :placeholder="placeholder"
                class="text-sm rounded-[10px] h-12 border-2 bg-background text-greyscale-900 py-2.5 font-medium transition-all duration-200 ease-in-out w-full outline-none">
            <textarea v-else :readonly="readonly" :maxlength="maxlength" ref="inputField" :type="finalInputType"
                v-model="inputValue" :class="[borderColor]" :style="dynamicInputStyle" :tabindex="tabindex"
                :autocomplete="finalAutocomplete" :enterkeyhint="enterkeyhint" @keydown.enter="handleSubmit"
                @paste="handlePaste" :inputmode="type === 'number' ? 'numeric' : undefined" @focus="handleFocus"
                @blur="handleBlur" :placeholder="placeholder"
                class="text-sm rounded-[10px] h-25 border-2 text-greyscale-900 py-2.5 font-medium transition-all duration-200 ease-in-out w-full outline-none"></textarea>

            <div :class="[type !== 'phone' && prefix.trim().length === 0 ? 'px-3' : (prefix.trim().length === 0 ? 'px-1.5' : 'px-2')]"
                class="flex justify-between items-center absolute inset-0 pointer-events-none overflow-hidden max-h-10">

                <div ref="startSlotRef" class="pointer-events-auto translate-y-1 flex items-center">
                    <span v-if="prefix.trim().length > 0"
                        class="text-xs font-medium py-1 px-2 rounded-md bg-greyscale-50 min-h-8 flex items-center justify-center text-greyscale-900">
                        <div>{{ prefix }}</div>
                    </span>
                    <BIcon @click="iconClicked" v-else-if="icon.trim().length > 0 && type !== 'phone'" :icon="icon"
                        class="w-5 cursor-pointer h-5 fill-greyscale-900" />
                    <div v-else-if="type === 'phone'"
                        class="rounded-md w-18 bg-greyscale-50 h-9 px-3 flex items-center gap-x-2">
                        <div class="w-4 h-4 rounded-full overflow-hidden shrink-0">
                            <DImage :src="flagUrl"
                                class="scale-150 w-full relative max-w-full min-w-full h-full max-h-full min-h-full" />
                        </div>
                        <div class="text-sm text-greyscale-900">{{ selectedCountry?.dial_code }}</div>
                    </div>
                </div>

                <div ref="endSlotRef" class="pointer-events-auto translate-y-1 flex items-center">
                    <BIcon @click="iconClicked" v-if="prefix.trim().length > 0 && icon.trim().length > 0 && type !== 'password'" :icon="icon"
                        class="w-5 h-5 cursor-pointer fill-greyscale-900" />
                    <BIcon  v-if="type === 'password'" :icon="passworBIcon" @click="togglePassword"
                        class="w-5 h-5 cursor-pointer fill-greyscale-900" />
                </div>
            </div>
        </div>
        <div class=" pt-1.5 w-full h-6.5 select-none text-greyscale-500 text-xs" v-if="caption.trim().length > 0">{{
            caption }}</div>
        <div class="w-full h-5 overflow-hidden pt-1.5">
            <div class="transition-all duration-200 ease-in-out flex w-full items-center gap-x-1.5"
                :class="[showMessage ? ' -translate-y-2 opacity-100' : '-translate-y-4 opacity-0', messageColor]">
                <div>
                    <BIcon :icon="messageIcon" class=" w-4 h-4" />
                </div>
                <div class="select-none text-xs">{{ displayedMessage }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, useTemplateRef, type PropType, watch, computed, ref, onMounted, onUnmounted } from 'vue';
import {
    inputTypes,
    inputColors,
    enterKeyHints,
    type InputType,
    type InputColor,
    type EnterKeyHint,
    autocompleteValues,
    type Autocomplete,
    type Input
} from '~/types/components/input';
import countries from '~/assets/data/countries.json'

export default defineComponent({
    name: 'TheInput',
    props: {
        placeholder: { type: String, default: '' },
        title: { type: String, default: '' },
        modelValue: { type: String, default: '' },
        type: {
            type: String as PropType<InputType | 'slug'>,
            default: 'text',
        },
        message: { type: String, default: '' },
        color: {
            type: String as PropType<InputColor>,
            default: 'primary',
            validator: (val: InputColor) => inputColors.includes(val)
        },
        icon: { type: String, default: '' },
        tabindex: { type: [Number, String], default: 0 },
        autocomplete: {
            type: String as PropType<Autocomplete>,
            default: 'on',
            validator: (val: string) => autocompleteValues.includes(val as any) || val.length > 0
        },
        enterkeyhint: {
            type: String as PropType<EnterKeyHint>,
            default: 'enter',
            validator: (val: EnterKeyHint) => enterKeyHints.includes(val)
        },
        maxlength: {
            type: Number,
            default: 100,
        },
        required: {
            type: Boolean,
            default: false,
        },
        prefix: {
            type: String,
            default: ''
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        textarea: {
            type: Boolean,
            default: false,
        },
        caption: {
            type: String,
            default: ''
        }
    },
    emits: ['update:modelValue', 'focus', 'blur', 'submit', 'paste','action'],
    setup(props, { emit, expose }) {
        const showPassword = ref(false)
        const inputValue = ref(props.modelValue)
        const isFocus = ref(false)
        const inputField = useTemplateRef<HTMLInputElement>('inputField')
        const selectedCountryCode = ref('IR')

        // --- DYNAMIC PADDING LOGIC ---
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

        const dynamicInputStyle = computed(() => {
            const basePadding = props.type === 'phone' ? 6 : 12; // Matches px-1.5 vs px-3
            const startPad = startSlotWidth.value > 0 ? startSlotWidth.value + basePadding + 8 : 12;
            const endPad = endSlotWidth.value > 0 ? endSlotWidth.value + basePadding + 8 : 12;

            return {
                paddingInlineStart: `${startPad}px`, // Natively handles LTR/RTL swapping!
                paddingInlineEnd: `${endPad}px`
            };
        });

        // --- COUNTRIES ---
        const selectedCountry = computed(() => {
            return countries.find(c => c.code.toUpperCase() === selectedCountryCode.value.toUpperCase()) ||
                countries.find(c => c.code === 'IR');
        });

        const flagUrl = computed(() => {
            if (!selectedCountry.value) return '';
            return `/flags/${selectedCountry.value.code.toLowerCase()}.svg`;
        });

        // --- VALUE WATCHERS & FORMATTING ---
        watch(() => props.modelValue, (newVal) => {
            inputValue.value = newVal
        })

        watch(() => inputValue.value, (newVal) => {
            if (!newVal) {
                emit('update:modelValue', '');
                return;
            }

            if (props.type === 'number' || props.type === 'phone') {
                const filtered = newVal.replace(/[^0-9]/g, '');
                if (filtered !== newVal) {
                    inputValue.value = filtered;
                    return;
                }
            } else if (props.type === 'slug') {
                // Lowercase -> Replace spaces with dash -> Remove non-english/numbers -> Remove duplicate dashes
                let filtered = newVal.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '')
                    .replace(/-+/g, '-');

                if (filtered !== newVal) {
                    inputValue.value = filtered;
                    return;
                }
            }
            emit('update:modelValue', inputValue.value)
        })

        // --- PASTE HANDLER ---
        const handlePaste = (e: ClipboardEvent) => {
            emit('paste', e);

            if (props.type === 'slug') {
                const pasteData = e.clipboardData?.getData('text') || '';

                // Allow ONLY english letters, numbers, spaces, and dashes
                const isValidEnglish = /^[a-zA-Z0-9\s-]*$/.test(pasteData);

                if (!isValidEnglish) {
                    e.preventDefault(); // Deny paste if it contains Persian or special characters
                    return;
                }
                // If it IS valid english, let it paste. The watch function above will instantly
                // catch it, lowercase it, and format it into a perfect slug!
            }
        };

        const handleFocus = () => {
            emit('focus')
            isFocus.value = true
        }

        const handleBlur = () => {
            emit('blur')
            isFocus.value = false
        }

        const togglePassword = () => {
            showPassword.value = !showPassword.value
        }

        const finalInputType = computed(() => {
            if (props.type === 'password') return showPassword.value ? 'text' : 'password';
            if (props.type === 'phone' || props.type === 'number' || props.type === 'slug') return 'text';
            return props.type;
        })

        const passworBIcon = computed(() => showPassword.value ? 'PhEyeSlash' : 'PhEye')

        const borderColor = computed(() => {
            if (isFocus.value && props.color === 'primary') return 'border-greyscale-900';
            if (props.color === 'primary') return 'border-greyscale-100';
            return `border-${props.color}`;
        })

        const messageColor = computed(() => `text-${props.color}`)

        const showMessage = ref(props.message.trim().length > 0)
        const displayedMessage = ref(props.message)

        watch(() => props.message, (newMsg) => {
            if (newMsg.trim().length > 0) {
                displayedMessage.value = newMsg;
                showMessage.value = true;
            } else {
                showMessage.value = false;
            }
        })

        const messageIcon = computed(() => {
            switch (props.color) {
                case 'success': return 'PhCheckCircle';
                case 'error':
                case 'warning': return 'PhWarning';
                default: return 'PhWarningCircle';
            }
        })

        const finalAutocomplete = computed(() => {
            return props.autocomplete === 'off' ? 'new-password' : props.autocomplete;
        });

        const handleSubmit = () => emit('submit', inputValue.value);

        const focus = () => inputField.value?.focus();
        const blur = () => inputField.value?.blur();

        expose({ focus, blur } as Input);

        const iconClicked = ()=>{
            emit('action')
        }

        return {
            messageIcon,
            togglePassword,
            handleBlur,
            handleSubmit,
            handlePaste,
            finalInputType,
            flagUrl,
            selectedCountry,
            finalAutocomplete,
            handleFocus,
            displayedMessage,
            messageColor,
            showMessage,
            iconClicked,
            inputValue,
            passworBIcon,
            inputField,
            borderColor,
            dynamicInputStyle,
            startSlotRef,
            endSlotRef
        }
    }
})
</script>
<style scoped>
textarea {
    resize: none;
}
</style>