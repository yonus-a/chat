<template>
    <BPopup @closed="onPopupClose" ref="popup" no-padding>
        <div class="w-dvw flex justify-center md:max-w-98 max-w-full">
            <div class=" w-dvw max-w-98 pb-18 md:pb-4 py-4 px-6">
                <div class=" select-none flex items-center gap-x-3">
                    <BIcon icon="PhX" @click="close" class=" w-4 h-4 cursor-pointer fill-on-surface/50" />
                    <div class=" text-label-sm text-on-surface">{{ t('calendar.share.title') }}</div>
                </div>
                <div class=" mt-4 w-full">
                    <BInput @action="copy" :placeholder="t('calendar.share.link')" readonly :icon="inputIcon"
                        v-model="shareUrl" />
                    <BSelect :disabled="!canAdd" :options="familyOptions" :loading="isLoadingFamilyMembers"
                        v-model="selectedUsers" :placeholder="userSelectPlaceholder"
                        :title="t('calendar.share.addUser')" :no-result-text="t('calendar.share.noUsers')" />
                </div>
                <div class=" flex flex-col gap-y-1.5 w-full">
                    <TransitionGroup tag="div" name="list-item" class="w-full relative flex flex-col">
                        <SharedUserDisplay v-for="user in localSharedUsers" :key="user.id" :user="user"
                            :loading="isLoadingSharedUsers" :sending="isUserProcessing(user.id)" class="mb-1.5"
                            :is-deleting="user.isDeleting" />
                    </TransitionGroup>
                </div>
            </div>
        </div>
    </BPopup>
</template>
<script lang="ts">
import { defineComponent, computed, onMounted, watch } from 'vue';
import { useI18n, useAppToast, useProfileStore, useCalendarStore } from '#imports';
import type { Popup } from '~/types/components/popup';
import type { DropdownOption } from '~/types/components/select';
import SharedUserDisplay from './share/SharedUserDisplay.vue';
import type { SharedUserCalendar, ShareTypes } from '~/types/calendar';
interface LocalSharedUser extends SharedUserCalendar {
    isDeleting?: boolean;
}
export default defineComponent({
    name: 'SharePopup',
    components: {
        SharedUserDisplay,
    },
    setup(_, { expose }) {
        const { t } = useI18n()
        const { openToast } = useAppToast()
        const profileStore = useProfileStore()
        const calendarStore = useCalendarStore()
        const popup = ref<Popup | null>(null)

        const mockSharedUser = ref<SharedUserCalendar>({
            id: -1,
            name: "سارا",
            lastName: "احمدی",
            isOnline: true,
            lastSeen: new Date(),
            imageUrl: "https://i.pravatar.cc/150?u=101",
            isActive: true,
            unreadCount: 0,
            serviceType: "chat",
            birthDate: new Date(),
            phoneNumber: "09123456789",
            nationalCode: "0012345678",
            accessType: "editor",
        });



        const localSharedUsers = ref<LocalSharedUser[]>(
            Array(2)
                .fill(null)
                .map((_, i) => ({
                    ...mockSharedUser.value,
                    id: 101 + i,
                })),
        );
        const shareUrl = ref('ajdhgsguo.ir/kjsfgh/jkefgh')
        const isCopied = ref(false)
        const selectedUsers = ref([])
        const isLoadingSharedUsers = computed(() => calendarStore.isLoadingShared)
        const sharedUsers = computed(() => calendarStore.sharedUsers)
        const canAdd = computed(() => !isLoadingFamilyMembers.value && !isLoadingSharedUsers.value)
        const userSelectPlaceholder = computed(() => isLoadingFamilyMembers.value || isLoadingSharedUsers.value ? t('calendar.share.loading') : t('general.select'))


        onMounted(() => {
            if (!calendarStore.hasLoadedShared) {
                isInitialSync.value = true;
                calendarStore.fetchSharedUsers()
            }
        })



        // 2. Filter out already shared members from the dropdown
        const familyOptions = computed((): DropdownOption[] => {
            return (profileStore.familyMembers || [])
                .filter(member => !localSharedUsers.value.some(u => u.id === member.id))
                .map((member) => ({
                    label: `${member.name} ${member.lastName}`.trim(),
                    value: member.id,
                    image: member.imageUrl || '/images/no-avatar.webp',
                }));
        });

        const isLoadingFamilyMembers = computed(() => profileStore.isLoadingFamilyMembers)

        const inputIcon = computed(() => isCopied.value ? 'PhCheckCircle' : 'PhCopy')

        const isUserProcessing = (userId: number) => !!calendarStore.processingIds[userId];

        watch(selectedUsers, async (newVal) => {
            if (!newVal || (Array.isArray(newVal) && newVal.length === 0)) return;
            const selectedId = Array.isArray(newVal) ? newVal[newVal.length - 1] : newVal;
            const contact = profileStore.familyMembers.find(m => m.id === selectedId);

            if (contact && !localSharedUsers.value.some(u => u.id === contact.id)) {
                selectedUsers.value = [];

                // Optimistic Add: Pushing with 'viewer' so it renders immediately
                const newUser = { ...contact, accessType: 'viewer' as ShareTypes };
                localSharedUsers.value.push(newUser);

                await calendarStore.addSharedUser(contact, 'viewer');
            }
        }, { deep: true });

        // 2. The Smart Sync: This ensures "Edit" works and "Delete" animates
        const isInitialSync = ref(true);


        watch(() => calendarStore.sharedUsers, (newStoreList) => {
            if (!calendarStore.hasLoadedShared) {
                localSharedUsers.value = [...newStoreList];
                return;
            }
            if (isInitialSync.value) {
                localSharedUsers.value = [...newStoreList];
                isInitialSync.value = false;
                return;
            }

            // A. Handle Deletions (Triggers local animation, waits 400ms, then deletes)
            localSharedUsers.value.forEach(localUser => {
                const existsInStore = newStoreList.some(storeUser => storeUser.id === localUser.id);
                if (!existsInStore && !localUser.isDeleting) {
                    localUser.isDeleting = true; // Triggers the CSS shrink/fade inside the component
                    setTimeout(() => {
                        localSharedUsers.value = localSharedUsers.value.filter(u => u.id !== localUser.id);
                    }, 400); // 400ms perfectly matches the component's duration-[400ms]
                }
            });

            // B. Handle Additions and Edits
            newStoreList.forEach(storeUser => {
                const index = localSharedUsers.value.findIndex(u => u.id === storeUser.id);
                if (index !== -1) {
                    if (localSharedUsers.value[index].accessType !== storeUser.accessType) {
                        localSharedUsers.value[index].accessType = storeUser.accessType;
                    }
                } else {
                    localSharedUsers.value.push({ ...storeUser });
                }
            });
        }, { deep: true });

        const open = () => {
            popup.value?.open()
        }

        const close = () => {
            popup.value?.close()
        }

        const onPopupClose = () => {
            isCopied.value = false;
        }

        const copy = () => {
            isCopied.value = true;
            openToast(t('calendar.share.copySuccess'), 'success')
        }

        expose({
            open, close
        })

        return {
            close,
            familyOptions,
            copy,
            selectedUsers,
            isLoadingFamilyMembers,
            isUserProcessing,
            t,
            onPopupClose,
            sharedUsers,
            localSharedUsers,
            isLoadingSharedUsers,
            userSelectPlaceholder,
            inputIcon,
            canAdd,
            popup,
            shareUrl,
        }
    }
})
</script>
<style scoped>
/* ADDED: list-item-move for smooth sliding of remaining items */
.list-item-move,
.list-item-enter-active,
.list-item-leave-active {
    transition: all 0.4s ease;
    max-height: 100px;
    overflow: hidden !important;
}

/* CRITICAL: Takes the deleted item out of flow so others can slide up */
.list-item-leave-active {
    position: absolute;
    width: 100%;
}

.list-item-enter-from,
.list-item-leave-to {
    opacity: 0;
    max-height: 0;
    margin-bottom: 0 !important;
    /* Animates the mb-1.5 to 0 smoothly */
    transform: translateX(30px);
    padding-top: 0;
    padding-bottom: 0;
}
</style>