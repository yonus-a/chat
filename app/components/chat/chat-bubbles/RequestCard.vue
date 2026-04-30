<template>
    <div class=" p-3 w-80 min-h-51 bg-surface rounded-2xl shadow-floating">
        <div class=" w-full flex flex-col gap-y-3 h-full" v-if="isServiceRequest">
            <div class=" transition-all duration-200 ease-in-out select-none text-label-sm"
                :class="[isPending ? 'text-on-surface/50' : 'text-on-surface']">{{ t('chat.addMedic.title') }}</div>
            <div class=" w-full flex items-center gap-x-2">
                <div class=" w-10 h-10 shrink-0">
                    <ContactAvatar v-if="attachedProvider !== null" :contact="contact" />
                    <div v-else class=" w-full h-full rounded-full flex items-center justify-center bg-surface-variant">
                        <BIcon icon="PhIdentificationCard" class=" fill-primary w-6 h-6" />
                    </div>
                </div>
                <div class=" flex-1 text-on-surface">
                    <div class="text-label-md"
                        :class="[message.request?.request.status === 'searching' ? ' max-w-30' : '']"
                        v-loading="message.request?.request.status === 'searching'">{{
                            attachedProvider !== null ? `${attachedProvider?.name}
                        ${attachedProvider?.lastName}` : t('chat.requestCard.addMedic.title') }}</div>
                    <div class="text-body-sm opacity-50">{{ request?.request?.label }}
                    </div>
                </div>
                <div class=" shrink-0 select-none text-on-surface text-label-md flex items-center gap-x-2">
                    <!-- 
                        <div v-if="invoiceDetails">{{ invoiceDetails.amount }}</div>
                        -->
                    <div v-loading="message.request?.request.status === 'searching'">{{ t('general.currency') }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import type { Message, Contact } from '~/types/chat';
import { useI18n, useProfileStore } from '#imports';
import ContactAvatar from '../contact/ContactAvatar.vue';
export default defineComponent({
    name: 'RequestCard',
    props: {
        message: {
            type: Object as PropType<Message>,
            required: true,
        },
        contact: {
            type: Object as PropType<Contact>,
            required: true,
        }
    },
    components: {
        ContactAvatar,
    },
    setup(props) {
        const { t } = useI18n()
        const profileStore = useProfileStore()
        const request = computed(() => props.message.request)
        const isServiceRequest = computed(() => request.value?.type === 'add-person');

        const attachedProvider = computed(() => {
            if (request.value?.type !== 'add-person') return null;
            const req = request.value.request;
            if ('provider' in req && req.provider) {
                const providers = req.provider;
                if (providers.length === 1) {
                    return providers[0];
                }
            }
            return null;
        });

        const isPending = computed(() => {
            if (request.value?.type === 'add-person') {
                if (!request.value?.request.status) return true
                let finalKeys = ['approved', 'rejected', 'expired']
                const providers = request.value.request.provider;
                return !finalKeys.includes(request.value.request.status) && providers && providers.length !== 1
            } else {

            }
        })

        onMounted(() => {
            console.log(props.message.request)
        })

        const cardSubText = computed(() => {
            let text = ''
            if (request.value?.type === 'add-person') {
                let isMedic = profileStore.userData.id === props.message.senderId
                switch (request.value.request.status) {
                    case 'payment':
                        text = isMedic ? t('chat.requestCard.addMedic.awaitingPayment') : t('chat.requestCard.addMedic.awaitingApproval')
                        break;
                    case 'searching':
                        text = t('chat.requestCard.addMedic.searching')
                        break;
                    case 'pending':
                        text = isMedic ? t('chat.requestCard.addMedic.awaitingApproval') : t('chat.requestCard.addMedic.awaitingMedicApproval')
                        break;
                    case 'rejected':
                        text = t('chat.requestCard.addMedic.rejected')
                    case 'expired':
                        text = t('chat.requestCard.addMedic.expired')
                }
            }
            return text
        })


        onMounted(() => {
            nextTick(() => {
                console.log(props.message)
            })
        })

        //   const invoiceDetails = computed(() => {
        //       if (request.value?.type !== 'add-person') return null
        //       if (!request.value.request.invoice) return null
        //       return request.value.request.invoice
        //   })

        return {
            t,
            isPending,
            isServiceRequest,
            attachedProvider,
            request,
            //  invoiceDetails,
        }
    }
})
</script>