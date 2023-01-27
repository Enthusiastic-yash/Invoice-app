import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/home.vue";
import invoiceDetail from "../views/invoiceDetail.vue";
import NotFound from "../views/notFound.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: { name: "Home" },
    },
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    {
      path: "/invoiceDetail/:id",
      name: "invoiceDetail",
      // component: invoiceDetail,
      component: () => import("../views/invoiceDetail.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFound,
    },
  ],
});

export default router;
