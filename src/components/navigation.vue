<script setup>
import { PaperAirplaneIcon } from "@heroicons/vue/24/solid";
import { useInvoiceStore } from "@/stores/user.js";
const userStore = useInvoiceStore();

const toggleNav = () => {
  userStore.isShow = !userStore.isShow;
};
</script>
<template>
  <div class="md:w-20 h-auto bg-gray-800 shadow-xl z-50">
    <div class="flex justify-center bg-indigo-400" @click="toggleNav">
      <PaperAirplaneIcon
        class="w-10 mt-4 cursor-pointer text-white bg-indigo-400 pb-4"
      />
    </div>
  </div>
</template>
