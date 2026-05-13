<template>
    <div class=" max-w-57.5 bg-surface border-outline-variant border p-4 rounded-xl flex items-center">
        <!--   <div></div>
        <div></div>
        <div class=" relative shrink-0">
            <BIcon icon="PhUser" class=" w-10 h-10 fill-[#3B82F6]" />
        </div>
        -->
        <FileDisplay :url="url" />
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import FileDisplay from '~/components/chat/chat-bubbles/FileDisplay.vue';

export default defineComponent({
    name: '',
    props: {
        url: {
            type: String,
            default: ''
        }
    },
    components: {
        FileDisplay,
    },
    setup(props) {



        return {

        }
    }
})
</script>