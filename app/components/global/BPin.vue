<template>
    <div class="w-full max-w-121 flex flex-col items-center">
        <div class="relative w-full flex justify-center" dir="ltr">
            <div class="flex gap-x-2  w-full justify-center items-center pointer-events-none">
                <div v-for="n in length" :key="n" :class="[
                    'border-2 transition-all duration-200 flex justify-center overflow-hidden items-center',
                    ' aspect-square w-1/6  rounded-xl', // 64px x 64px with 12px radius
                    getBoxColors(n)
                ]">
                    <div :class="[
                        'transition-all duration-200 select-none font-bold',
                        'text-[26px]', // Font size 26px
                        pinItemState[n - 1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                        disabled ? 'text-greyscale-200' : 'text-greyscale-900'
                    ]">
                        {{ getDisplayNumber(pin[n - 1]) }}
                    </div>
                </div>
            </div>

            <input ref="inputRef" v-model="inputPin" :type="type === 'numbers' ? 'tel' : 'text'" :maxlength="length"
                :disabled="disabled" @focus="handleFocus" @blur="handleBlur" @input="handleInput"
                @keyup.enter="$emit('submit')"
                class="w-full h-full absolute inset-0 opacity-0 cursor-pointer text-transparent bg-transparent"
                style="direction: ltr;" />
        </div>
        <div class="w-full h-6 overflow-hidden pt-3">
            <div class="transition-all duration-200 ease-in-out flex w-full items-center gap-x-1.5"
                :class="[showMessage ? ' -translate-y-2 opacity-100' : '-translate-y-4 opacity-0', messageColor]">
                <div>
                    <DIcon :icon="messageIcon" class=" w-4 h-4" />
                </div>
                <div class="select-none text-xs">{{ displayedMessage }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, type PropType } from 'vue'
import { toPersianNumbers } from '~/utils/format'
import { useI18n } from '#imports';
export default defineComponent({
    name: 'OtpInput',
    props: {
        modelValue: { type: [String, Number], default: '' },
        length: { type: Number, default: 6 },
        type: {
            type: String as PropType<'numbers' | 'characters'>,
            default: 'numbers'
        },
        disabled: { type: Boolean, default: false },
        // Props below are kept for compatibility but logic is commented out
        title: { type: String, default: '' },
        link: { type: String, default: '' },
        linkText: { type: String, default: '' },
        message: { type: String, default: '' },
        color: { type: String as PropType<'primary' | 'warning' | 'success' | 'error'>, default: 'primary' }
    },
    emits: ['update:modelValue', 'submit', 'change', 'focus', 'blur'],
    setup(props, { emit }) {
        const { locale } = useI18n()
        const inputPin = ref('')
        const pin = ref<string[]>(Array(props.length).fill(''))
        const pinItemState = ref<boolean[]>(Array(props.length).fill(false))
        const isFocused = ref(false)
        const inputRef = ref<HTMLInputElement | null>(null)
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

        const getBoxColors = (index: number) => {
            if (props.color !== 'primary') {
                return 'bg-transparent border-error'
            }
            if (props.disabled) return 'bg-greyscale-20 border-greyscale-50';

            const isFilled = pinItemState.value[index - 1];
            const isCursor = isFocused.value && (index === inputPin.value.length + 1);
            const isActive = isFilled || isCursor;

            // Using greyscale-900 for focus/active state to match DopeInput
            if (isActive || (isFocused.value && index === 0)) return 'bg-greyscale-0/0 border-primary';
            return 'bg-transparent border-outline';
        }

        const handleInput = () => {
            let val = inputPin.value;

            if (props.type === 'numbers') {
                val = val.replace(/\D/g, '');
            } else {
                // Alphanumeric logic: English Characters and Numbers, forced Uppercase
                val = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            }

            if (val.length > props.length) val = val.slice(0, props.length);
            inputPin.value = val;

            emit('update:modelValue', val);
            emit('change', val);

            for (let i = 0; i < props.length; i++) {
                if (i < val.length) {
                    pin.value[i] = val[i];
                    pinItemState.value[i] = true;
                } else {
                    pinItemState.value[i] = false;
                    // Small delay to keep the letter visible during slide-down animation
                    setTimeout(() => { if (!pinItemState.value[i]) pin.value[i] = ''; }, 200);
                }
            }
        }

        const getDisplayNumber = (num: string) => {
            if (!num) return '';
            if (props.type === 'numbers' && locale.value === 'fa') return toPersianNumbers(num);
            return num;
        }

        const handleBlur = () => { isFocused.value = false; emit('blur'); }
        const handleFocus = () => { isFocused.value = true; emit('focus'); }

        watch(() => props.modelValue, (val) => {
            if (val !== inputPin.value) {
                inputPin.value = String(val);
                handleInput();
            }
        });

        onMounted(() => {
            if (props.modelValue) {
                inputPin.value = String(props.modelValue);
                handleInput();
            }
        });
        const messageColor = computed(() => `text-${props.color}-500`)

        const messageIcon = computed(() => {
            switch (props.color) {
                case 'success': return 'PhCheckCircle';
                case 'error':
                case 'warning': return 'PhWarning';
                default: return 'PhWarningCircle';
            }
        })



        return {
            inputPin, pin, pinItemState, isFocused, inputRef,
            getBoxColors, handleInput, getDisplayNumber, handleBlur, handleFocus,
            showMessage, displayedMessage, messageIcon, messageColor,
        }
    }
})
</script>