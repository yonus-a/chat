// mycustompt.ts

const COLOR_MAP: Record<string, any> = {
  primary: { fillBgImage: 'var(--background-image-diamond-primary-secondary)', fillBgColor: 'var(--color-primary)', fillBorder: 'var(--color-primary)', fillText: 'var(--color-on-primary)', text: 'var(--color-primary)' },
  danger: { fillBgImage: 'var(--background-image-diamond-error)', fillBgColor: 'var(--color-error)', fillBorder: 'var(--color-error)', fillText: 'var(--color-on-error)', text: 'var(--color-error)' },
  secondary: { fillBgImage: 'none', fillBgColor: 'var(--color-surface-variant-2)', fillBorder: 'var(--color-surface-variant-2)', fillText: 'var(--color-on-surface)', text: 'var(--color-secondary)' },
  warning: { fillBgImage: 'var(--background-image-diamond-warning)', fillBgColor: 'var(--color-warning)', fillBorder: 'var(--color-warning)', fillText: 'var(--color-on-warning)', text: 'var(--color-warning)' },
};

const BUTTON_CONFIG = {
  sizes: {
    large: { px: '24px', py: '14px', radius: '12px', fontSize: 'var(--text-label-lg)', iconOnly: '48px', iconSize: 20 },
    normal: { px: '20px', py: '10px', radius: '10px', fontSize: 'var(--text-label-md)', iconOnly: '40px', iconSize: 20 },
    small: { px: '16px', py: '10px', radius: '9px', fontSize: 'var(--text-label-sm)', iconOnly: '36px', iconSize: 16 }
  },
  focus: { width: '3px', offset: '2px' },
  variants: {
    fill: (c: string) => { const map = COLOR_MAP[c] || COLOR_MAP.primary; return { base: { bgImage: map.fillBgImage, bg: map.fillBgColor, text: map.fillText, border: map.fillBorder, opacity: '1' }, hover: { bgImage: map.fillBgImage, bg: map.fillBgColor, text: map.fillText, border: map.fillBorder, opacity: '1' }, active: { bgImage: map.fillBgImage, bg: map.fillBgColor, text: map.fillText, border: map.fillBorder, opacity: '1' }, disabled: { bgImage: map.fillBgImage, bg: map.fillBgColor, text: map.fillText, border: map.fillBorder, opacity: '0.65' } } },
    outline: (c: string) => { const map = COLOR_MAP[c] || COLOR_MAP.primary; return { base: { bgImage: 'none', bg: 'transparent', text: map.text, border: 'var(--color-outline)', opacity: '1' }, hover: { bgImage: 'none', bg: 'var(--color-surface-variant-3)', text: map.text, border: map.text, opacity: '1' }, active: { bgImage: 'none', bg: 'var(--color-outline)', text: map.text, border: map.text, opacity: '1' }, disabled: { bgImage: 'none', bg: 'transparent', text: map.text, border: 'var(--color-outline)', opacity: '0.5' } } },
    text: (c: string) => { const map = COLOR_MAP[c] || COLOR_MAP.primary; return { base: { bgImage: 'none', bg: 'transparent', text: map.text, border: 'transparent', opacity: '1' }, hover: { bgImage: 'none', bg: 'var(--color-surface-variant-3)', text: map.text, border: 'transparent', opacity: '1' }, active: { bgImage: 'none', bg: 'var(--color-outline)', text: map.text, border: 'transparent', opacity: '1' }, disabled: { bgImage: 'none', bg: 'transparent', text: map.text, border: 'transparent', opacity: '0.5' } } }
  }
};

const MyCustomPT = {
  button: {
    root: ({ props, context }: any) => {
      const sizeKey = props.size === 'large' ? 'large' : props.size === 'small' ? 'small' : 'normal';
      const typeKey = props.outlined ? 'outline' : props.text ? 'text' : 'fill';
      const colorKey = props.severity || 'primary';
      const isIconOnly = props.icon && !props.label;
      const size = BUTTON_CONFIG.sizes[sizeKey as keyof typeof BUTTON_CONFIG.sizes];
      const variantMap = BUTTON_CONFIG.variants[typeKey as keyof typeof BUTTON_CONFIG.variants]((colorKey === 'danger' ? 'error' : colorKey));

      return {
        class: ['b-btn', `b-btn--${typeKey}`, { 'is-disabled': context.disabled, 'is-loading': props.loading }],
        style: {
          '--b-pad-inline': isIconOnly ? '0' : size.px,
          '--b-pad-block': isIconOnly ? '0' : size.py,
          '--b-width': isIconOnly ? size.iconOnly : 'auto',
          '--b-height': isIconOnly ? size.iconOnly : 'auto',
          '--b-radius': size.radius,
          '--b-font-size': size.fontSize,
          '--b-focus-width': BUTTON_CONFIG.focus.width,
          '--b-focus-offset': BUTTON_CONFIG.focus.offset,
          '--b-focus-color': `var(--color-${colorKey === 'danger' ? 'error' : colorKey})`,
          '--b-bg-image': variantMap.base.bgImage,
          '--b-bg-color': variantMap.base.bg,
          '--b-text': variantMap.base.text,
          '--b-border': variantMap.base.border,
          '--b-opacity': variantMap.base.opacity,
          '--b-hover-bg-color': variantMap.hover.bg,
          '--b-hover-text': variantMap.hover.text,
          '--b-hover-border': variantMap.hover.border,
          '--b-active-bg-color': variantMap.active.bg,
          '--b-active-text': variantMap.active.text,
          '--b-active-border': variantMap.active.border,
          '--b-disabled-bg-color': variantMap.disabled.bg,
          '--b-disabled-text': variantMap.disabled.text,
          '--b-disabled-border': variantMap.disabled.border,
          '--b-disabled-opacity': variantMap.disabled.opacity,
        }
      };
    },
    label: 'whitespace-nowrap font-medium z-10',
    icon: 'shrink-0 z-10',
    loadingIcon: 'animate-spin shrink-0 z-10 mr-2'
  },
  inputtext: {
    root: ({ props, context }: any) => ({
      class: ['b-input', { 'is-disabled': context.disabled }],
      style: {
        '--i-height': '44px', '--i-radius': '10px', '--i-font-size': 'var(--text-body-md)', '--i-border-width': '1px',
        '--i-bg': props.invalid ? 'color-mix(in srgb, var(--color-error) 10%, transparent)' : 'var(--color-surface)',
        '--i-text': 'var(--color-on-surface)',
        '--i-border': props.invalid ? 'var(--color-error)' : 'var(--color-outline)',
        '--i-bg-disabled': 'var(--color-surface-variant)',
      }
    })
  },
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
    listContainer: 'max-h-50 overflow-y-auto hide-scrollbar',
    option: ({ context }: any) => ({
      class: [
        'flex items-center gap-x-2 px-2 py-2 cursor-pointer transition-colors duration-200 ease-in-out',
        context.focused || context.selected ? 'bg-surface-variant-2 text-primary' : 'bg-transparent text-on-background'
      ]
    })
  }
};

export default MyCustomPT;