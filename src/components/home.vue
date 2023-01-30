<script setup>
import { PlusCircleIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import { computed, watchEffect, ref } from "vue";
import { useInvoiceStore } from "@/stores/user.js";
import { RouterLink } from "vue-router";
import noInvoice from "../assets/img/noinvoice.vue";
const userStore = useInvoiceStore();

let Userinfo = ref("");

watchEffect(function handler() {
  Userinfo.value = userStore.user;
});

const toggleForm = () => {
  userStore.isShow = !userStore.isShow;
};

const billStatusColor = computed(() => {
  return {
    "text-yellow-500": Userinfo.value.invoiceStatus === "pending",
    "text-green-400": Userinfo.value.invoiceStatus === "paid",
    "text-gray-500": Userinfo.value.invoiceStatus === "draft",
  };
});
</script>
<template>
  <!-- Header -->
  <div
    class="absolute w-full h-full grid grid-cols-12 grid-flow-row auto-rows-max justify-center md:-ml-5"
  >
    <div
      class="text-white mt-5 col-start-3 col-end-12 md:flex md:justify-between md:items-center md:place-self-center"
    >
      <div class="flex justify-center md:self-end">
        <h1 class="font-medium">Invoices ({{ Userinfo.length }})</h1>
      </div>
      <div class="text-black flex justify-center items-end mt-4 md:ml-4">
        <label for="status" class="text-white capitalize md:leading-4"
          >filter by status</label
        >
        <select
          id="status"
          class="outline-none bg-gray-900 border-none text-white rounded-md text-center flex justify-center items-center mt-2 px-1 md:self-end md:ml-2"
        >
          <option value="Draft">Draft</option>
          <option value="Panding">Panding</option>
          <option value="Paid">Paid</option>
          <option value="clear Filter">Clear Filter</option>
        </select>
      </div>
      <div
        class="w-32 bg-indigo-400 cursor-pointer outline-none rounded-full mt-5 p-1 m-auto md:ml-5 text-sm md:text-base"
        @click="toggleForm"
      >
        <button type="button" class="flex items-center justify-center m-auto">
          <PlusCircleIcon class="w-4 mr-1" />
          New Invoice
        </button>
      </div>
    </div>

    <!-- Invoice List  -->
    <div
      class="col-start-3 col-end-12 md:col-start-3"
      v-for="user in Userinfo"
      :key="user.uid"
    >
      <RouterLink
        v-if="typeof user.uid !== 'undefined'"
        v-bind:to="{ name: 'invoiceDetail', params: { id: user.uid } }"
      >
        <ul
          class="text-white bg-gray-800 flex justify-between p-2 md:p-4 rounded-md cursor-pointer my-8 max-w-7xl m-auto text-xs sm:text-sm md:text-lg"
        >
          <li>#{{ user.invoiceItemList[0].id.slice(0, 5) }}</li>
          <li>{{ user.InvoiceDate }}</li>
          <li>{{ user.clientName }}</li>
          <li>${{ user.invoiceTotal }}</li>
          <li class="text-yellow-500">{{ user.invoiceStatus }}</li>
          <li class="text-white items-end flex">
            <ChevronRightIcon
              class="w-5 font-medium items-center text-indigo-400"
            />
          </li>
        </ul>
      </RouterLink>
    </div>
    <!-- when no invoice -->
    <div
      v-if="Userinfo.length <= 0"
      class="col-start-3 col-end-12 md:col-start-3"
    >
      <div class="w-1/2 m-auto mt-10">
        <noInvoice />
      </div>
    </div>
  </div>
</template>
