<script setup>
import { TrashIcon } from "@heroicons/vue/24/solid";
import BaseInput from "./BaseInput.vue";
import { useInvoiceStore } from "@/stores/user.js";
import { useRoute } from "vue-router";
import { uid } from "uid";
import { onBeforeMount, ref, watch, computed } from "vue";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Form, Field, useForm } from "vee-validate";
import * as yup from "yup";

const dateOptions = { year: "numeric", month: "short", day: "numeric" };
// Define a validation schema
const schema = yup.object().shape({
  BillerStreet: yup.string().required(),
  Billercity: yup.string().required(),
  Billercountry: yup.string().required(),
  BillerzipCode: yup.number().integer().required(),

  clientStreet: yup.string().required(),
  Clientcity: yup.string().required(),
  clientName: yup.string().required(),
  Clientcountry: yup.string().required(),
  ClientzipCode: yup.number().integer().required(),
  Clientemail: yup.string().required("email is required").email(),
  InvoiceDate: yup.date().default(() => new Date()),
  paymentTerms: yup.string().required(),
  paymentDue: yup.string().nullable(),
  productDescription: yup.string().required(),
});

// store
const userStore = useInvoiceStore();
const isEditInvoiceTitle = useInvoiceStore();
const invoiceTitle = ref("");

// chagne invoice title
watch(isEditInvoiceTitle, (newValue) => {
  if (newValue.isEditInvoiceTitle === true) {
    invoiceTitle.value = "Edit Invoice";
  } else {
    invoiceTitle.value = "New Invoice";
  }
});

const userData = ref("");
const userId = useRoute();

// watch(userData, (newValue) => {
//   console.log("this is user data", newValue);
// });

watch(isEditInvoiceTitle, (newValue) => {
  if (newValue.isEditInvoiceTitle === true) {
    getdataoncall();
    invoiceItemList.value = userData.value.invoiceItemList;
  }
});

const initialValues = computed(() => {
  if (isEditInvoiceTitle.isEditInvoiceTitle === true) {
    return {
      BillerStreet: userData.value.BillerStreet,
      Billercity: userData.value.Billercity,
      Billercountry: userData.value.Billercountry,
      BillerzipCode: userData.value.BillerzipCode,
      Clientcity: userData.value.Clientcity,
      Clientcountry: userData.value.Clientcountry,
      Clientemail: userData.value.Clientemail,
      ClientzipCode: userData.value.ClientzipCode,
      InvoiceDate: userData.value.InvoiceDate,
      clientName: userData.value.clientName,
      clientStreet: userData.value.clientStreet,
      invoiceID: userData.value.invoiceID,
      invoiceTotal: userData.value.invoiceTotal,
      paymentDue: userData.value.paymentDue,
      paymentTerms: userData.value.paymentTerms,
      productDescription: userData.value.productDescription,
    };
  }
});

// Get Data from backend
const getdataoncall = () => {
  onSnapshot(doc(db, "Invoice", userId.params.id), (doc) => {
    const users = doc.data();
    userData.value = users.values;
  });
};

const dateValue = ref("");
const priceTerm = ref("");
const paymentDue = ref(null);
const invoiceItemList = ref([]);
const invoiceStatus = ref("panding");
const invoiceID = ref(null);
const invoiceTotal = ref(0);

//Set current Date
onBeforeMount(() => {
  dateValue.value = Date.now();
  dateValue.value = new Date(dateValue.value).toLocaleDateString(
    "en-us",
    dateOptions
  );
});

//set date ahead of current date
watch(priceTerm, (newValue) => {
  const date = new Date();
  date.setDate(date.getDate() + parseInt(newValue));
  paymentDue.value = new Date(date).toLocaleDateString("en-us", dateOptions);
});

// add items to item list
const increaseItem = () => {
  invoiceItemList.value.push({
    id: uid(),
    itemName: "",
    itemQty: "",
    itemPrice: 0,
    itemTotal: 0,
  });
};

// Delete items
const DeleteItems = (id) => {
  invoiceItemList.value = invoiceItemList.value.filter(
    (item) => item.id !== id
  );
};

// calculate total invoice
watch(invoiceItemList.value, (newValue) => {
  invoiceTotal.value = 0;
  newValue.forEach((item) => {
    invoiceTotal.value += item.itemTotal;
  });
});

// check invoice list is not empty
const uploadInvoice = async () => {
  if (invoiceItemList.value <= 0) {
    alert("Please ensure to add atleast one invoice item ");
    return;
  }
};

//Submit form
const onSubmit = async (values, { resetForm }) => {
  console.log("i am click", values);
  if (isEditInvoiceTitle.isEditInvoiceTitle === true) {
    const updateInvoiceData = doc(db, "Invoice", userId.params.id);

    await updateDoc(updateInvoiceData, {
      "values.BillerStreet": values.BillerStreet,
      "values.Billercity": values.Billercity,
      "values.Billercountry": values.Billercountry,
      "values.BillerzipCode": values.BillerzipCode,
      "values.Clientcity": values.Clientcity,
      "values.Clientcountry": values.Clientcountry,
      "values.Clientemail": values.Clientemail,
      "values.ClientzipCode": values.ClientzipCode,
      "values.InvoiceDate": values.InvoiceDate,
      "values.clientName": values.clientName,
      "values.clientStreet": values.clientStreet,
      "values.invoiceTotal": values.invoiceTotal,
      "values.paymentDue": values.paymentDue,
      "values.paymentTerms": values.paymentTerms,
      "values.productDescription": values.productDescription,
      "values.paymentDue": paymentDue.value,
      "values.invoiceItemList": invoiceItemList.value,
      "values.invoiceStatus": invoiceStatus.value,
      "values.invoiceID": invoiceID.value,
      "values.invoiceTotal": invoiceTotal.value,
    });
    uploadInvoice();
    userStore.isShow = true;
  } else {
    values.paymentDue = paymentDue.value;
    values.invoiceItemList = invoiceItemList.value;
    values.invoiceStatus = invoiceStatus.value;
    values.invoiceID = invoiceID.value;
    values.invoiceTotal = invoiceTotal.value;

    uploadInvoice();
    // Add data to firebase
    await addDoc(collection(db, "Invoice"), {
      values,
    });
    userStore.user.push(values);
    invoiceItemList.value = [];
    resetForm();
    userStore.isShow = true;
  }
};

const { resetForm } = useForm();
// reset page
const resetPage = () => {
  alert("Your date will not be saved");
  invoiceItemList.value = [];
  userStore.isShow = true;

  resetForm;
};
</script>
<template>
  <div
    name="list"
    class="w-full md:w-1/2 bg-gray-700 relative transition ease-in z-10"
    :class="{
      'transition ease-out  -translate-x-full ': userStore.isShow,
    }"
  >
    <div>
      <h1 class="text-white capitalize text-3xl pl-3 pt-3 mb-10">
        {{ invoiceTitle }}
      </h1>
    </div>

    <div>
      <Form
        @submit="onSubmit"
        :validation-schema="schema"
        class="px-5"
        v-slot="{ errors }"
        :initial-values="initialValues"
      >
        <p class="capitalize text-indigo-400">Bill From</p>
        <BaseInput name="BillerStreet" label="Street Address" type="text" />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseInput name="Billercity" label="city" type="text" />
          <BaseInput name="BillerzipCode" label="zip Code" type="number" />
          <BaseInput name="Billercountry" label="Country" type="text" />
        </div>
        <p class="capitalize text-indigo-400 mt-3">Bill To</p>
        <BaseInput name="clientName" label="client's Name" type="text" />
        <BaseInput name="Clientemail" label="client's Email" type="email" />
        <BaseInput name="clientStreet" label="Street Address" type="text" />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseInput name="Clientcity" label="city" type="text" />
          <BaseInput name="ClientzipCode" label="zip Code" type="number" />
          <BaseInput name="Clientcountry" label="Country" type="text" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            name="InvoiceDate"
            label="Invoice Date"
            type="text"
            disabled
            :value="dateValue"
          />

          <div class="mt-3">
            <label class="flex flex-col text-white capitalize" for="paymentDue"
              >payment Due</label
            >
            <input
              class="w-full p-2 outline-none rounded-md bg-white"
              name="paymentDue"
              type="text"
              disabled
              :value="paymentDue"
            />
          </div>
        </div>

        <div class="w-100 flex flex-col mt-3">
          <lable class="text-white">Payment Terms</lable>
          <Field
            name="paymentTerms"
            as="select"
            class="p-2 outline-none rounded-md"
            v-model="priceTerm"
            :class="{ 'bg-red-200 ': errors.paymentTerms }"
          >
            <option value="30">30 Days</option>
            <option value="60">60 Days</option>
          </Field>
          <span :class="{ 'text-red-500 ': errors.paymentTerms }">{{
            errors.paymentTerms
          }}</span>
        </div>

        <BaseInput
          name="productDescription"
          label="product Description"
          type="text"
        />
        <h2 class="text-white my-3">Item Lists</h2>
        <div>
          <div v-for="(item, index) in invoiceItemList" :key="index">
            <div class="grid grid-cols-3 md:grid-cols-6 gap-4 mt-3">
              <div class="flex flex-col col-span-2">
                <label for="itemName" class="text-white">Item Name</label>
                <input
                  name="itemName"
                  type="text"
                  v-model="item.itemName"
                  class="rounded-md p-2 outline-none"
                />
              </div>
              <div class="flex flex-col">
                <label for="itemQty" class="text-white">Qty</label>
                <input
                  name="itemQty"
                  label="Qty"
                  type="number"
                  v-model="item.itemQty"
                  class="rounded-md p-2 outline-none"
                />
              </div>
              <div class="flex flex-col">
                <label for="itemPrice" class="text-white">Price</label>
                <input
                  name="itemPrice"
                  type="number"
                  v-model="item.itemPrice"
                  class="rounded-md p-2 outline-none"
                />
              </div>
              <div class="flex flex-col">
                <label for="itemTotal" class="text-white">Total</label>
                <span
                  name="itemTotal"
                  type="number"
                  class="bg-white rounded-md p-2 outline-none"
                  >${{ (item.itemTotal = item.itemQty * item.itemPrice) }}</span
                >
              </div>
              <div class="w-9 flex items-end ml-2 text-white cursor-pointer">
                <TrashIcon @click="DeleteItems(item.id)" />
              </div>
            </div>
          </div>
        </div>

        <div
          class="w-100 bg-black text-white text-center p-2 rounded-lg mt-10"
          @click="increaseItem"
        >
          <button type="button">Add Item</button>
        </div>

        <div
          class="my-14 grid grid-cols-1 md:grid-cols-2 gap-1 justify-items-center content-between h-32 md:h-02"
        >
          <button
            class="text-white bg-red-400 rounded-full p-3 md:w-32 w-9/12 hover:bg-red-500"
            type="reset"
            @click="resetPage"
          >
            Discard
          </button>
          <button
            v-if="!isEditInvoiceTitle.isEditInvoiceTitle"
            class="text-white bg-indigo-400 rounded-full p-3 md:w-32 w-9/12 hover:bg-indigo-500"
            type="submit"
          >
            Create Invoice
          </button>
          <button
            v-if="isEditInvoiceTitle.isEditInvoiceTitle"
            class="text-white bg-indigo-400 rounded-full p-3 md:w-32 w-9/12 hover:bg-indigo-500"
            type="submit"
          >
            Update
          </button>
        </div>
      </Form>
    </div>
  </div>
</template>
