<script setup>
import { RouterLink, RouterView } from "vue-router";
import navigaiton from "./components/navigation.vue";
import invoiceForm from "./components/invoiceForm.vue";
</script>

<template>
  <div class="bg-gray-900 flex relative">
    <navigaiton />
    <invoiceForm />

    <!-- <Home /> -->
    <RouterView />
  </div>
</template>
