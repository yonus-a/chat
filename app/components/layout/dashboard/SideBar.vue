<template>
    <div class=" shadow-floating relative z-50 h-full shrink-0 flex ">
        <div class=" relative h-full transition-all duration-200 shadow-floating ease-in-out w-18 flex flex-col">
            <div class=" shrink-0 w-full aspect-square flex items-center justify-center">
                <div class=" w-10 h-10">
                    <NuxtLinkLocale class="cursor-pointer w-full h-full" to="/">
                        <BImage :src="logo" class=" min-w-full min-h-full h-full w-full max-w-full max-h-full " />
                    </NuxtLinkLocale>
                </div>
            </div>
            <div class=" flex-1 relative flex items-center  p-4 flex-col justify-between">
                <div class=" flex flex-col gap-y-2 items-center">
                    <BToolTip v-for="category in getCategories" :key="category.key" :text="category.label"
                        :position="tooltipDir">
                        <template #trigger>
                            <CategoryItem :is-active="isRouteActive(category)" @click="setActiveCategory(category)"
                                :route-item="category" />
                        </template>
                    </BToolTip>
                </div>
                <div class=" relative flex flex-col items-center gap-y-2">
                    <div class=" w-10 h-10 flex justify-center items-center">
                        <BIcon class=" w-5 h-5 fill-on-surface cursor-pointer" weight="bold" :icon="themeButtonIcon"
                            @click="toggleTheme" />
                    </div>
                    <div class=" w-10 aspect-square shrink-0 relative z-10">
                        <SidebarLocaleSwitch />
                    </div>
                </div>
            </div>
        </div>
        <div class=" transition-all duration-300 ease-in-out overflow-hidden flex flex-col justify-between  text-wrap whitespace-nowrap"
            :class="[showChildList ? ' w-auto' : 'w-0']">
            <div class=" w-64 bg-surface-variant flex flex-col justify-between h-full">
                <RouteList :routes="routeList" />
            </div>

        </div>
    </div>
</template>
<script lang="ts">
import { ref, defineComponent, onMounted, useNavigation, useTheme, useLocale } from '#imports';
import logo from '/images/logo/logo.svg'
import CategoryItem from './sidebar/CategoryItem.vue';
import RouteItem from './sidebar/RouteItem.vue';
import { useRoute, useRouter } from 'vue-router';
import SidebarLocaleSwitch from './sidebar/SidebarLocaleSwitch.vue';
import type { NavItem } from '~/types/components/nav-item';
import RouteList from './sidebar/RouteList.vue';
export default defineComponent({
    name: 'Sidebar',
    components: {
        CategoryItem,
        RouteItem,
        SidebarLocaleSwitch,
        RouteList,
    },
    setup() {
        const { toggleTheme, colorMode } = useTheme()
        const route = useRoute()
        const router = useRouter()
        const isOpen = ref(true)
        const { dir } = useLocale()
        const tooltipDir = computed(() => dir.value === 'rtl' ? 'left' : 'right')
        const { getCategories, getRoutesByCategory } = useNavigation()
        const activeCategory = ref('')
        const themeButtonIcon = computed(() => colorMode.value === 'light' ? 'PhMoon' : 'PhSun')





        onMounted(() => {
            const currentPath = route.path;
            const foundCategory = getCategories.value.find(cat => {
                if (cat.to === currentPath) return true;

                return cat.links?.some(link => {
                    if (link.to === currentPath) return true;
                    return link.children?.some(child => child.to === currentPath);
                });
            });

            if (foundCategory) {
                activeCategory.value = foundCategory.key;
            }
        });

        const isRouteActive = (routeItem: NavItem) => {
            if (routeItem.to) {
                return route.path === routeItem.to && (activeCategory.value.trim().length === 0 || activeCategory.value === routeItem.key)
            } else {
                return routeItem.key === activeCategory.value
            }
        }

        const setActiveCategory = (routeItem: NavItem) => {
            if (routeItem.key === activeCategory.value) {
                activeCategory.value = ''
                return
            } else {
                activeCategory.value = routeItem.key;
                if (routeItem.to) {
                    router.push(routeItem.to)
                }
            }
        }

        const showChildList = computed(() => activeCategory.value.trim().length > 0 && getRoutesByCategory(activeCategory.value).length > 0)
        const routeList = computed(() => getRoutesByCategory(activeCategory.value))

        return {
            setActiveCategory,
            showChildList,
            isOpen,
            logo,
            isRouteActive,
            activeCategory,
            toggleTheme,
            routeList,
            getCategories,
            tooltipDir,
            themeButtonIcon,
        }
    }
})
</script>