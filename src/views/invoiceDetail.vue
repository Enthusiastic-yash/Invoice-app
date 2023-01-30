<script setup>
import { ChevronLeftIcon } from "@heroicons/vue/24/solid";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { onMounted, ref, computed, watch } from "vue";
// import { useInvoiceStore } from "@/stores/user.js";
import { db } from "@/firebase";
import { doc, deleteDoc, updateDoc, onSnapshot } from "firebase/firestore";

const route = useRoute();
const router = useRouter();
const userData = ref("");
const billStatus = ref("");
const paidButttonStatus = ref("");
const buttonStatusDetect = ref(false);

let userId = route.params.id;

// Get Data from backend
onMounted(() => {
  onSnapshot(doc(db, "Invoice", userId), (doc) => {
    const users = doc.data();
    userData.value = users.values;
  });
});

// Delete invoice
const deleteInvoice = (id) => {
  deleteDoc(doc(db, "Invoice", id));
  router.push({ name: "Home" });
};

//change bill status value based on buttonStatusDetect true or false
const changeButton = computed(() => {
  return buttonStatusDetect.value === true ? "paid" : "pending";
});

// Paid invoice
const paidInvoice = async (id) => {
  buttonStatusDetect.value = !buttonStatusDetect.value;
  billStatus.value = changeButton.value;
  const invoiceStatus = doc(db, "Invoice", id);

  await updateDoc(invoiceStatus, {
    "values.invoiceStatus": billStatus.value,
  });
};

// Detect invoice status and change button inner text
watch(userData, (newValue) => {
  if (newValue.invoiceStatus === "paid") {
    paidButttonStatus.value = "unpaid";
  } else {
    paidButttonStatus.value = "paid";
  }
});

const buttonTextcolor = computed(() => {
  return paidButttonStatus.value === "unpaid" ? "bg-yellow-500" : "bg-lime-400";
});

const billStatusColor = computed(() => {
  return {
    "text-yellow-500": userData.value.invoiceStatus === "pending",
    "text-green-400": userData.value.invoiceStatus === "paid",
    "text-gray-500": userData.value.invoiceStatus === "draft",
  };
});
</script>
<template>
  <div
    class="absolute w-full h-full grid grid-cols-12 grid-flow-row auto-rows-max justify-center md:-ml-5"
  >
    <div class="text-white col-start-3 col-end-12">
      <!-- Header -->
      <div class="flex mt-10">
        <ChevronLeftIcon class="w-6 text-indigo-400" />
        <RouterLink :to="{ name: 'Home' }">
          <p>Go Back</p>
        </RouterLink>
      </div>
      <div
        class="flex justify-between md:px-20 bg-gray-800 rounded-md p-4 mt-4 items-center flex-col sm:flex-row"
      >
        <div class="flex self-start mb-3 md:mb-0 md:leading-6">
          <p>status</p>
          <p :class="billStatusColor">: {{ userData.invoiceStatus }}</p>
        </div>
        <div>
          <div class="flex justify-between w-64 sm:w-64">
            <button
              class="bg-gray-700 text-white text-xs md:text-base rounded-full py-1 w-20"
            >
              Edit
            </button>
            <button
              @click="deleteInvoice(userId)"
              class="bg-red-400 text-white text-xs md:text-base rounded-full py-1 w-20"
            >
              Delete
            </button>
            <button
              @click="paidInvoice(userId)"
              class="text-white text-xs md:text-base rounded-full py-1 w-20"
              :class="buttonTextcolor"
            >
              {{ paidButttonStatus }}
            </button>
          </div>
        </div>
      </div>
      <!--  Biller Invoice Details -->
      <div
        class="text-white col-start-3 col-end-12 bg-gray-800 rounded-md mt-5 text-xs sm:text-base px-1 sm:px-10"
      >
        <div class="flex justify-between px-3 pt-5">
          <div>
            <h1 class="font-bold">{{ userData.productDescription }}</h1>
          </div>
          <div class="text-xs sm:text-base">
            <p>{{ userData.BillerStreet }}</p>
            <p>{{ userData.Billercity }}</p>
            <p>{{ userData.BillerzipCode }}</p>
            <p>{{ userData.Billercountry }}</p>
          </div>
        </div>
        <!-- Client invoice details  -->
        <div class="flex justify-between text-xs px-1 sm:text-base mt-10">
          <div>
            <p class="font-bold">Invoice Date</p>
            <h1>{{ userData.InvoiceDate }}</h1>
            <div class="mt-5">
              <p class="font-bold">Payment Date</p>
              <h1>{{ userData.paymentDue }}</h1>
            </div>
          </div>

          <div>
            <p class="font-bold">Bill To</p>
            <h1>{{ userData.clientName }}</h1>

            <div class="mt-5">
              <p>{{ userData.clientStreet }}</p>
              <p>{{ userData.Clientcity }}</p>
              <p>{{ userData.ClientzipCode }}</p>
              <p>{{ userData.Clientcountry }}</p>
            </div>
          </div>
          <div>
            <p class="font-bold">Sent To</p>
            <h1>{{ userData.Clientemail }}</h1>
          </div>
        </div>

        <!-- quantity and price details -->
        <!-- Item Heading -->
        <div class="pb-10">
          <div class="flex justify-between px-1">
            <p>Item name</p>
            <div class="flex justify-between w-2/4">
              <p>Qty</p>
              <p>Price</p>
              <p>Total</p>
            </div>
          </div>
          <!-- Item details -->
          <div
            class="flex justify-between mt-4 px-1"
            v-for="item in userData.invoiceItemList"
          >
            <p>{{ item.itemName }}</p>
            <div class="flex justify-between w-2/4">
              <p>{{ item.itemQty }}</p>
              <p>{{ item.itemPrice }}</p>
              <p>{{ item.itemTotal }}</p>
            </div>
          </div>
          <!-- Total Amoutn Due -->
          <div
            class="flex justify-between mt-4 px-1 bg-gray-900 py-3 rounded-md sm:px-3 md:px-5"
          >
            <p>Amount Due</p>
            <div class="flex justify-between">
              <p>{{ userData.invoiceTotal }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
