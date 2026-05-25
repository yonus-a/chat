<template>
  <Transition name="slide">
    <div v-if="visible" class="chat-profile">
      <div class="chat-profile__header">
        <button class="chat-profile__close" @click="$emit('close')">
          <BIcon name="x" :size="20" />
        </button>
      </div>

      <div class="chat-profile__avatar">
        <ContactAvatar
          :image-url="contact?.imageUrl"
          :name="contact?.name"
          :last-name="contact?.lastName"
          size="xl"
          :show-online="false"
        />
        <h3 class="chat-profile__name">{{ contact?.name }} {{ contact?.lastName }}</h3>
        <p class="chat-profile__role">{{ contact?.serviceType }}</p>
      </div>

      <div class="chat-profile__info">
        <div v-if="contact?.phoneNumber" class="chat-profile__info-item">
          <BIcon name="phone" :size="16" />
          <span>{{ contact.phoneNumber }}</span>
        </div>
        <div v-if="contact?.nationalCode" class="chat-profile__info-item">
          <BIcon name="identification-card" :size="16" />
          <span>{{ contact.nationalCode }}</span>
        </div>
        <div v-if="contact?.birthDate" class="chat-profile__info-item">
          <BIcon name="calendar" :size="16" />
          <span>{{ age }} {{ t("yearsOld") }}</span>
        </div>
      </div>

      <BTab :tabs="[t('media'), t('files')]" v-model="activeTab" />

      <div class="chat-profile__content">
        <slot name="media" v-if="activeTab === 0" />
        <slot name="files" v-if="activeTab === 1" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Contact } from "../../types";
import { useDate } from "../../composables/useDate";
import { t } from "../../i18n";
import BIcon from "../global/BIcon.vue";
import BTab from "../global/BTab.vue";
import ContactAvatar from "./contact/ContactAvatar.vue";

const props = defineProps<{
  visible: boolean;
  contact?: Contact | null;
}>();

defineEmits<{ close: [] }>();

const { calculateAge } = useDate();

const activeTab = ref(0);

const age = computed(() => {
  if (!props.contact?.birthDate) return "";
  return calculateAge(props.contact.birthDate);
});
</script>

<style scoped>
.chat-profile {
  width: var(--chat-profile-width);
  height: 100%;
  border-left: 1px solid var(--chat-border);
  background: var(--chat-bg);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

[dir="rtl"] .chat-profile {
  border-left: none;
  border-right: 1px solid var(--chat-border);
}

.chat-profile__header {
  display: flex;
  justify-content: flex-end;
  padding: var(--chat-spacing-md);
}

.chat-profile__close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--chat-text-secondary);
  padding: var(--chat-spacing-xs);
}

.chat-profile__avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--chat-spacing-lg);
  gap: var(--chat-spacing-sm);
}

.chat-profile__name {
  margin: 0;
  font-size: var(--chat-font-size-lg);
  color: var(--chat-text);
}

.chat-profile__role {
  margin: 0;
  font-size: var(--chat-font-size-sm);
  color: var(--chat-text-secondary);
}

.chat-profile__info {
  padding: 0 var(--chat-spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--chat-spacing-sm);
  margin-bottom: var(--chat-spacing-lg);
}

.chat-profile__info-item {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-sm);
  font-size: var(--chat-font-size-sm);
  color: var(--chat-text-secondary);
}

.chat-profile__content {
  flex: 1;
  padding: 0 var(--chat-spacing-md);
}

.slide-enter-active, .slide-leave-active {
  transition: transform var(--chat-transition-normal);
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}
[dir="rtl"] .slide-enter-from, [dir="rtl"] .slide-leave-to {
  transform: translateX(-100%);
}
</style>
