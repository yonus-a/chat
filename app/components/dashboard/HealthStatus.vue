<template>
    <div class="w-full flex flex-col gap-y-4 bg-surface border border-outline-variant rounded-3xl py-4 overflow-hidden">
        <div class="w-full px-4 flex justify-between items-center">
            <div v-loading="isLoading" class="text-title-sm select-none text-on-surface font-bold">{{ cardTitle }}</div>
        </div>

        <div :class="[type === 'all' ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto']"
            class="w-full px-4">
            <div class="flex items-center gap-x-2 w-full">
                <BLabel v-loading="isLoading" size="sm" class="translate-y-0.5 cursor-pointer shrink-0" icon="PhPlus" />
                <div v-desktop-scroll
                    class="flex-1 min-w-0 flex items-center gap-x-2 overflow-x-auto hide-scrollbar whitespace-nowrap py-1">
                    <BLabel v-loading="isLoading" v-for="status in cardFinalProps" :key="status.key" color="neutral"
                        type="ghost" size="sm" class="shrink-0 pointer-events-none" :icon="status.icon"
                        :text="status.label" />
                </div>
            </div>
        </div>

        <div v-if="!noData" class="flex items-end justify-between px-4 mt-2">
            <div class="flex flex-col gap-y-1">
                <div v-loading="isLoading" class="text-head-sm font-bold" :class="`text-${activeColor}`">
                    {{ t(`dashboard.cards.status.${healthState}`) }}
                </div>

                <div class="flex items-center gap-x-2 text-body-sm text-on-surface/50">
                    <span v-loading="isLoading" class="select-none">{{ t('dashboard.cards.total') }}</span>
                    <span class="flex items-center gap-x-1 font-bold" :class="`text-${activeColor}`" dir="ltr">
                        <BIcon v-loading="isLoading" :icon="percentageChange > 0 ? 'PhTrendUp' : 'PhTrendDown'"
                            class="w-4 h-4" />
                        <span v-loading="isLoading" class="text-label-sm select-none">{{ Math.abs(displayPercentage)
                            }}%</span>
                    </span>
                </div>
            </div>

            <div v-loading="isLoading" class="w-22.5 h-20 relative mask-reveal"
                :class="{ 'mask-active': isChartReady }">
                <canvas ref="canvasRef"></canvas>
            </div>
        </div>

        <div v-if="!noData" class="w-full px-4 mt-1">
            <div v-loading="isLoading" class="flex gap-x-2 w-full h-2">
                <div v-for="i in 5" :key="i" class="flex-1 rounded-full transition-all duration-500"
                    :class="[i <= scoreLevel ? '' : 'bg-surface-variant-3']"
                    :style="i <= scoreLevel ? { background: activeGradient } : {}"></div>
            </div>
        </div>
        <div v-if="noData" class=" px-3 w-full flex justify-between items-end">
            <div class=" h-35.5 w-35.5">
                <BImage :src="noDataImage" class=" w-full min-w-full min-h-full max-w-full max-h-full h-full" />
            </div>
            <BButton icon="PhPlus" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, markRaw, nextTick } from 'vue';
import { useI18n } from '#imports';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler } from 'chart.js';
import { useHealthStore, type HealthCategory } from '~/stores/healthStore';
import noDataImage from '/images/dashboard/no-data.webp'
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler);

const props = defineProps<{
    type: 'mental' | 'physical' | 'social' | 'all'
}>();

const { t } = useI18n();
const healthStore = useHealthStore();

// --- Data & State ---
const category = computed(() => healthStore.categories[props.type]);
const noData = computed(() => category.value.chartData.length == 0)
const chartData = computed(() => category.value?.chartData || []);
const min = computed(() => category.value?.min || 0);
const max = computed(() => category.value?.max || 100);
const isLoading = computed(() => category.value?.loading || false);
const isLoaded = computed(() => category.value?.isLoaded || false);

const isChartReady = ref(false);
const displayPercentage = ref(0);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// --- Logic ---
const scoreLevel = computed(() => {
    const data = chartData.value;
    if (data.length === 0) return 0;

    const range = max.value - min.value;
    if (range === 0) return 0;

    const current = data[data.length - 1];
    const rawScore = ((current - min.value) / range) * 5;

    // Clamp between 1 and 5
    return Math.max(1, Math.min(5, Math.ceil(rawScore)));
});

const healthState = computed(() => {
    const level = scoreLevel.value;
    if (level <= 1) return 'bad';
    if (level <= 3) return 'medium';
    if (level <= 4) return 'good';
    return 'great';
});

const percentageChange = computed(() => {
    return healthStore.getTrend(props.type)
});
const activeColor = computed(() => {
    const map = { bad: 'error', medium: 'warning', good: 'primary', great: 'secondary' };
    return map[healthState.value];
});

const activeGradient = computed(() => {
    const map = {
        bad: 'var(--background-image-diamond-error)',
        medium: 'var(--background-image-diamond-warning)',
        good: 'var(--background-image-diamond-primary)',
        great: 'var(--background-image-diamond-primary-secondary)'
    };
    return map[healthState.value];
});

// --- Actions ---
const hexToRgba = (hex: string, alpha: number) => {
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const renderChart = () => {
    if (!canvasRef.value || chartData.value.length === 0) return;
    const ctx = canvasRef.value.getContext('2d')!;
    const style = getComputedStyle(document.documentElement);

    // Fallback dictionary in case CSS variables are missing during render
    const fallbacks: Record<string, string> = { error: '#EF4444', warning: '#F59E0B', primary: '#2BB49A', secondary: '#8B5CF6' };
    const cssVar = style.getPropertyValue(`--color-${activeColor.value}-500`).trim();
    const mainColorHex = cssVar || fallbacks[activeColor.value];

    const gradient = ctx.createLinearGradient(0, 0, 0, 64);
    gradient.addColorStop(0, hexToRgba(mainColorHex, 0.25));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    if (chartInstance) chartInstance.destroy();

    chartInstance = markRaw(new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.value.map((_, i) => i.toString()),
            datasets: [{
                data: chartData.value,
                borderColor: mainColorHex,
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: { display: false },
                y: { display: false, min: Math.min(...chartData.value) - 2, max: Math.max(...chartData.value) + 2 }
            }
        },
        plugins: [{
            id: 'lineShadow',
            beforeDatasetDraw(chart) {
                const { ctx } = chart;
                ctx.save();
                ctx.shadowColor = hexToRgba(mainColorHex, 0.5);
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 4;
            },
            afterDatasetDraw(chart) {
                chart.ctx.restore();
            }
        }]
    }));

    nextTick(() => setTimeout(() => { isChartReady.value = true; }, 50));
};

const animateNumber = (target: number) => {
    const duration = 400;
    const start = performance.now();
    const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        console.log(target)
        displayPercentage.value = Math.round(progress * target);
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
};

// --- Lifecycle ---
onMounted(() => healthStore.fetchCategoryData(props.type));

watch(isLoaded, (val) => {
    if (val) {
        nextTick(() => {
            renderChart();
            animateNumber(Math.abs(percentageChange.value));
        });
    }
}, { immediate: true });

onUnmounted(() => {
    if (chartInstance) chartInstance.destroy();
});

const hasData = computed(() => healthStore.categories.all)

// --- State Configurations ---
const socialCardStates = computed(() => [
    { key: 'support', label: t('dashboard.cards.states.social.fields.support'), icon: "PhHeart" },
    { key: 'interactions', label: t('dashboard.cards.states.social.fields.interactions'), icon: 'PhChatCenteredText' },
    { key: 'lifeMeaning', label: t('dashboard.cards.states.social.fields.lifeMeaning'), icon: 'PhCompass' },
    { key: 'calmness', label: t('dashboard.cards.states.social.fields.calmness'), icon: 'PhPersonSimpleTaiChi' }
]);

const mentalCardStates = computed(() => [
    { key: 'stress', label: t('dashboard.cards.states.mental.fields.stress'), icon: "PhSmileySad" },
    { key: 'focus', label: t('dashboard.cards.states.mental.fields.focus'), icon: 'PhCubeFocus' },
    { key: 'spiritualState', label: t('dashboard.cards.states.mental.fields.spiritualState'), icon: 'PhSmiley' },
    { key: 'sleeplessness', label: t('dashboard.cards.states.mental.fields.sleeplessness'), icon: 'PhBed' }
]);

const physicalCardStates = computed(() => [
    { key: 'bloodPressure', label: t('dashboard.cards.states.physical.fields.bloodPressure'), icon: "PhSmileySad" },
    { key: 'bloodOxygen', label: t('dashboard.cards.states.physical.fields.bloodOxygen'), icon: 'PhCubeFocus' },
    { key: 'bloodSugar', label: t('dashboard.cards.states.physical.fields.bloodSugar'), icon: 'PhSmiley' },
    { key: 'heartRate', label: t('dashboard.cards.states.physical.fields.heartRate'), icon: 'PhBed' }
]);

const cardFinalProps = computed(() => {
    switch (props.type) {
        case 'mental': return mentalCardStates.value;
        case 'physical': return physicalCardStates.value;
        case 'social': return socialCardStates.value;
        default: return [];
    }
});

const cardTitle = computed(() => {
    switch (props.type) {
        case 'all': return t('dashboard.cards.states.all');
        case 'mental': return t('dashboard.cards.states.mental.title');
        case 'physical': return t('dashboard.cards.states.physical.title');
        case 'social': return t('dashboard.cards.states.social.title');
    }
});
</script>

<style scoped>
/* GPU-Accelerated Mask Reveal */
.mask-reveal {
    -webkit-mask-image: linear-gradient(to right, #000 40%, rgba(0, 0, 0, 0) 60%);
    mask-image: linear-gradient(to right, #000 40%, rgba(0, 0, 0, 0) 60%);
    -webkit-mask-size: 250% 100%;
    mask-size: 250% 100%;
    -webkit-mask-position: 100% 0;
    mask-position: 100% 0;
    transition: -webkit-mask-position 1.2s cubic-bezier(0.4, 0, 0.2, 1),
        mask-position 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mask-active {
    -webkit-mask-position: 0% 0;
    mask-position: 0% 0;
}

canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
}
</style>