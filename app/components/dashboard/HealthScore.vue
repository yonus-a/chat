<template>
    <div ref="scoreCardRef" class=" pt-3 pb-5 px-4 bg-surface border border-outline-variant  rounded-3xl">
        <div class=" w-full flex items-center justify-between">
            <div v-loading="isLoading" class=" text-title-sm select-none text-on-surface">{{ t('dashboard.score.title')
            }}</div>
            <BLabel v-loading="isLoading" size="lg" :text="t('dashboard.score.level', { level: 1 })" icon="PhMedal" />
        </div>
        <div class=" flex w-full gap-x-0 md:flex-row flex-col-reverse md:gap-y-0 gap-y-4 md:gap-x-4">
            <div class=" basis-1/2 h-full">
                <div class=" w-full flex flex-col gap-y-2 mt-12">
                    <div v-for="(field, index) in fields" :key="index" class=" w-full flex items-center gap-x-2">
                        <div :class="[field.color]" class=" flex items-center justify-center w-10 h-10 rounded-full">
                            <div v-loading="isLoading" class=" shrink-0 w-4.5 h-4.5 ">
                                <BImage no-loading :src="field.imageUrl"
                                    class=" w-full h-full max-w-full max-h-full min-w-full min-h-full" />
                            </div>
                        </div>
                        <div class=" flex-1 select-none flex flex-col gap-y-0.5">
                            <div v-loading="isLoading" class=" text-on-surface text-label-md">{{ field.title }}</div>
                            <div v-loading="isLoading"
                                class=" max-w-full w-full text-ellipsis overflow-hidden line-clamp-1 text-body-sm text-on-surface/50">
                                {{ field.description }}</div>
                        </div>
                        <div class=" select-none h-full flex flex-col items-end gap-y-0.5">
                            <div v-loading="isLoading" class=" text-label-md text-on-surface">{{ field.state }}</div>
                            <div class=" flex items-center gap-x-0.5"
                                :class="[field.change > 0 ? 'text-secondary' : 'text-error']">
                                <BIcon v-loading="isLoading" class=" w-3.5 h-3.5"
                                    :icon="field.change > 0 ? 'PhTrendUp' : 'PhTrendDown'" />
                                <div v-loading="isLoading" class=" text-label-sm">{{ field.change }}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="basis-1/2 h-full flex items-center justify-center">
                <div class="relative w-60 h-60 flex items-center justify-center">

                    <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
                        <defs>
                            <linearGradient id="diamond-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="var(--color-primary-500, #2BB49A)" />
                                <stop offset="100%" stop-color="var(--color-secondary-500, #8B5CF6)" />
                            </linearGradient>

                            <filter id="custom-shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#11B140"
                                    flood-opacity="0.2" />
                            </filter>
                        </defs>

                        <circle cx="120" cy="120" r="110" fill="none" class="stroke-surface-variant-3"
                            stroke-width="20" />

                        <circle cx="120" cy="120" r="110" fill="none" stroke="url(#diamond-gradient)" stroke-width="20"
                            stroke-linecap="round" :stroke-dasharray="circumference" :stroke-dashoffset="dashoffset"
                            filter="url(#custom-shadow)" class="transition-all duration-1000 ease-out" />
                    </svg>

                    <div class="absolute inset-0 flex flex-col items-center justify-center pt-2">
                        <div class=" text-head-md font-bold text-on-surface" v-loading="isLoading">{{
                            animatedOverallScore }}
                        </div>
                        <div class="flex items-center gap-x-1 mt-1 text-body-sm text-on-surface/50 font-medium"
                            dir="rtl">
                            <span v-loading="isLoading">{{ t('dashboard.score.maxScore', { score: 7 }) }}</span>
                            <span class="flex items-center gap-x-0.5 font-bold"
                                :class="overallTrend > 0 ? 'text-primary' : 'text-error'" dir="ltr"
                                v-loading="isLoading">
                                <BIcon :icon="overallTrend > 0 ? 'PhTrendUp' : 'PhTrendDown'" class="w-4 h-4"
                                    v-loading="isLoading" />
                                <span v-loading="isLoading">{{ Math.abs(animatedOverallTrend) }}%</span>
                            </span>
                            <span v-loading="isLoading"> {{ t('dashboard.score.pastDays', { days: 7 }) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useI18n } from '#imports';
import physicalHealthIcon from '/images/dashboard/physical-health.svg'
import mentalHealthIcon from '/images/dashboard/mental-health.svg'
import socialHealthIcon from '/images/dashboard/social-health.svg'
import { useHealthStore } from '#imports';
import { useNumberLerp } from '~/composables/useNumberLerp';
export default defineComponent({
    name: 'HealthScore',
    setup() {
        const healthStore = useHealthStore()
        const { t } = useI18n()
        const isLoading = computed(() => healthStore.categories.all.loading)

        const fields = computed(() => [
            {
                title: t('dashboard.score.fields.social.title'),
                description: t('dashboard.score.fields.social.description'),
                imageUrl: socialHealthIcon,
                change: healthStore.getTrend('social'),
                color: 'bg-primary/10',
                state: healthStore.latestValue('social')
            },
            {
                title: t('dashboard.score.fields.mental.title'),
                description: t('dashboard.score.fields.mental.description'),
                imageUrl: mentalHealthIcon,
                change: healthStore.getTrend('mental'),
                color: 'bg-warning/10',
                state: healthStore.latestValue('mental')
            },
            {
                title: t('dashboard.score.fields.physical.title'),
                description: t('dashboard.score.fields.physical.description'),
                imageUrl: physicalHealthIcon,
                change: healthStore.getTrend('physical'),
                color: 'bg-error/10',
                state: healthStore.latestValue('physical')
            },
        ])

        const textColor = (change: number) => {
            return change > 0 ? 'text-success' : 'text-error'
        }

        const radius = 110; // Adjusted for 20px stroke
        const circumference = 2 * Math.PI * radius;

        const overallScore = computed(() => healthStore.latestValue('all'));
        const maxScore = ref(100);
        const overallTrend = computed(() => healthStore.getTrend('all'));

        const dashoffset = computed(() => {
            const max = maxScore.value || 1;
            const percentage = Math.min(overallScore.value / max, 1);
            return circumference - (percentage * circumference);
        });

        const isLoaded = computed(() => !isLoading.value);
        const scoreCardRef = ref<HTMLElement | null>(null);

        // Pass the shared scoreCardRef so both numbers trigger exactly at the same time
        const { animatedValue: animatedOverallScore } = useNumberLerp(overallScore, isLoaded, scoreCardRef);
        const { animatedValue: animatedOverallTrend } = useNumberLerp(computed(() => Math.abs(overallTrend.value)), isLoaded, scoreCardRef);


        return {
            t,
            fields,
            isLoading,
            textColor,
            socialHealthIcon,
            physicalHealthIcon,
            mentalHealthIcon,
            circumference,
            dashoffset,
            overallScore,
            maxScore,
            overallTrend,
            animatedOverallScore,
            scoreCardRef,
            animatedOverallTrend,
        }
    }
})
</script>