// mycustompt.ts

// 1. Mapped exactly to PrimeVue's severity names (primary, secondary, danger, warn)
const COLOR_MAP: Record<string, any> = {
  primary: { bgImage: 'var(--background-image-diamond-primary-secondary)', bg: 'var(--color-primary)', border: 'var(--color-primary)', text: 'var(--color-on-primary)', outlineText: 'var(--color-primary)' },
  danger: { bgImage: 'var(--background-image-diamond-error)', bg: 'var(--color-error)', border: 'var(--color-error)', text: 'var(--color-on-error)', outlineText: 'var(--color-error)' },
  warn: { bgImage: 'var(--background-image-diamond-warning)', bg: 'var(--color-warning)', border: 'var(--color-warning)', text: 'var(--color-on-warning)', outlineText: 'var(--color-warning)' },
  secondary: { bgImage: 'none', bg: 'var(--color-surface-variant-2)', border: 'var(--color-surface-variant-2)', text: 'var(--color-on-surface)', outlineText: 'var(--color-secondary)' },
};

const getVariant = (type: string, severity: string) => {
    const map = COLOR_MAP[severity] || COLOR_MAP.primary;
    if (type === 'outline' || type === 'text') {
        return {
            bgImage: 'none', bg: 'transparent', text: map.outlineText, border: type === 'text' ? 'transparent' : 'var(--color-outline)',
            hoverBg: 'var(--color-surface-variant-3)', hoverBorder: type === 'text' ? 'transparent' : map.outlineText,
            activeBg: 'var(--color-outline)', activeBorder: type === 'text' ? 'transparent' : map.outlineText
        };
    }
    return {
        bgImage: map.bgImage, bg: map.bg, text: map.text, border: map.border,
        hoverBg: map.bg, hoverBorder: map.border,
        activeBg: map.bg, activeBorder: map.border
    };
};

const getSizes = (size: string) => {
    if (size === 'large') return { px: '24px', py: '14px', radius: '12px', fontSize: 'var(--text-label-lg)' };
    if (size === 'small') return { px: '16px', py: '10px', radius: '9px', fontSize: 'var(--text-label-sm)' };
    return { px: '20px', py: '10px', radius: '10px', fontSize: 'var(--text-label-md)' };
};

const MyCustomPT = {
  // --- BUTTON ---
  button: {
    root: ({ props, context }: any) => {
      const type = props.text ? 'text' : props.outlined ? 'outline' : 'fill';
      const severity = props.severity || 'primary'; 
      const v = getVariant(type, severity);
      const s = getSizes(props.size);
      const isIconOnly = props.icon && !props.label;

      return {
        class: ['b-btn', `b-btn--${type}`, { 'is-disabled': context.disabled, 'is-loading': props.loading }],
        style: {
          '--b-pad-inline': isIconOnly ? '0' : s.px,
          '--b-pad-block': isIconOnly ? '0' : s.py,
          '--b-width': isIconOnly ? (props.size === 'large' ? '48px' : props.size === 'small' ? '36px' : '40px') : 'auto',
          '--b-height': isIconOnly ? (props.size === 'large' ? '48px' : props.size === 'small' ? '36px' : '40px') : 'auto',
          '--b-radius': s.radius,
          '--b-font-size': s.fontSize,
          '--b-bg-image': v.bgImage,
          '--b-bg-color': v.bg,
          '--b-text': v.text,
          '--b-border': v.border,
          '--b-hover-bg-color': v.hoverBg,
          '--b-hover-text': v.text,
          '--b-hover-border': v.hoverBorder,
          '--b-active-bg-color': v.activeBg,
          '--b-active-text': v.text,
          '--b-active-border': v.activeBorder,
          '--b-focus-color': `var(--color-${severity === 'danger' ? 'error' : severity === 'warn' ? 'warning' : severity})`,
        }
      };
    },
    label: ({ props }: any) => ({
      class: ['font-medium z-10', { 'whitespace-nowrap': true, 'hidden': props.icon && !props.label }]
    }),
    icon: 'shrink-0 z-10 flex items-center justify-center',
    loadingIcon: 'animate-spin shrink-0 z-10 flex items-center justify-center mr-2'
  },

  // --- INPUT TEXT ---
  inputtext: {
    root: ({ props, context }: any) => ({
      class: ['b-input', { 'is-disabled': context.disabled, 'is-invalid': props.invalid }],
      style: {
        '--i-height': '44px', '--i-radius': '10px', '--i-font-size': 'var(--text-body-md)', '--i-border-width': '1px',
        '--i-bg': props.invalid ? 'color-mix(in srgb, var(--color-error) 10%, transparent)' : 'var(--color-surface)',
        '--i-text': 'var(--color-on-surface)',
        '--i-border': props.invalid ? 'var(--color-error)' : 'var(--color-outline)',
        '--i-bg-disabled': 'var(--color-surface-variant)',
      }
    })
  },

  // --- SELECT ---
  select: {
    root: ({ props, state }: any) => ({
      class: [
        'h-12 w-full px-3 py-2.5 rounded-[10px] border flex items-center transition-all duration-300 cursor-pointer outline-none relative',
        state.overlayVisible ? 'bg-surface border-primary shadow-[0_8px_10px_-3px_rgba(13,13,18,0.05)]' : 'bg-surface-rest border-surface-variant-2',
        props.invalid ? 'bg-error/10 border-error' : '',
        { 'opacity-50 pointer-events-none': props.disabled }
      ]
    }),
    label: 'text-sm font-medium select-none truncate text-on-background flex-1',
    dropdown: 'w-5 h-5 shrink-0 flex items-center justify-center',
    dropdownIcon: 'w-5 h-5 fill-on-surface/50 shrink-0 transition-transform duration-300',
    overlay: 'absolute border overflow-hidden border-outline top-[calc(100%+6px)] left-0 w-full bg-surface rounded-xl z-50 flex flex-col shadow-[0_12px_16px_-4px_rgba(13,13,18,0.08)]',
    listContainer: 'max-h-50 overflow-y-auto hide-scrollbar p-1 flex flex-col gap-y-0.5',
    option: ({ context }: any) => ({
      class: [
        'flex items-center gap-x-2 px-2 py-2 cursor-pointer transition-colors duration-200 ease-in-out rounded-lg',
        context.focused || context.selected ? 'bg-surface-variant-2 text-primary' : 'bg-transparent text-on-background hover:bg-surface-container'
      ]
    })
  }
};

export default MyCustomPT;