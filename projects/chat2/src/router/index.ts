import { createRouter, createWebHistory } from "vue-router";
import ChatPage from "@/pages/ChatPage.vue";
import ChatIdPage from "@/pages/chat/ChatIdPage.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard/chat",
  },
  {
    path: "/dashboard/chat",
    component: ChatPage,
    children: [
      {
        path: ":id(.*)*",
        component: ChatIdPage,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
