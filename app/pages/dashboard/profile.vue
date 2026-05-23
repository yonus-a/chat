<template>
    <div class=" w-full h-full overflow-y-auto">
        <div class=" w-full flex select-none flex-col gap-y-6 px-8 py-6">
            <ProfileForm />
            <AddressList />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from '#imports';
import DetailsInput from '~/components/profile/DetailsInput.vue';
import ProfileForm from '~/components/profile/ProfileForm.vue';
import AddressList from '~/components/profile/AddressList.vue';
definePageMeta({
    layout: 'dashboard',
    headerTitle: 'profile.title',
    layoutTransition: false
});
export default defineComponent({
    name: 'ProfileView',
    components: {
        ProfileForm,
        DetailsInput,
        AddressList,
    },
    setup() {
        const { t } = useI18n()

        return {
            t,
        }
    }
})
</script>