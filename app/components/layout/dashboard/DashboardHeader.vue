<template>
    <div
        class=" w-full px-4 md:py-0 py-4 md:px-8 border-b md:h-17.25 border-b-outline/50 flex items-center justify-between md:justify-end gap-x-3 md:gap-x-4">
        <div class=" hidden md:flex items-center h-full gap-x-3">
            <div class=" h-13 overflow-hidden">
                <BInput v-model="searchText" @submit="initSearch" icon="PhMagnifyingGlass"
                    :placeholder="t('general.search')" />
            </div>
            <BButton icon="PhPlus" />
        </div>

        <DashboardGreetings class=" md:hidden" />
        <div class=" flex items-center gap-x-3 md:gap-x-4">
            <NuxtLinkLocale class=" md:block hidden" to="/dashboard/chat">
                <BButton type="ghost" icon="PhChatText" />
            </NuxtLinkLocale>
            <NuxtLinkLocale class=" md:block hidden" to="/dashboard/calendar/reminder">
                <BButton type="ghost" icon="PhCalendarDots" />
            </NuxtLinkLocale>
            <DashboardNotifications />
            <div @click="openSearch" class=" cursor-pointer w-10 h-10 md:hidden flex items-center justify-center">
                <BIcon icon="PhMagnifyingGlass" class=" fill-on-surface/50 w-5 h-5" />
            </div>
            <div class=" w-10 aspect-square hidden md:flex justify-center items-center">
                <div class=" cursor-pointer w-5 h-5 rounded-full overflow-hidden">
                    <BImage class=" w-full h-full min-w-full min-h-full max-w-full max-h-full"
                        :src="profileStore.userData.imageUrl" />
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from '#imports';
import { useProfileStore } from '#imports';
import DashboardGreetings from '~/components/dashboard/DashboardGreetings.vue';

import DashboardNotifications from './header/DashboardNotifications.vue';
export default defineComponent({
    name: 'DashboardHeader',
    components: {
        DashboardGreetings,
        DashboardNotifications,
    },
    setup() {

        const profileStore = useProfileStore()
        const { t } = useI18n()

        const searchText = ref('')


        const initSearch = () => {

        }

        const openSearch = () => {

        }



        return {
            t,


            searchText,
            initSearch,

            profileStore,
            openSearch,
        }
    }
})
</script>