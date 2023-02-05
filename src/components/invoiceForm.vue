<script setup>
import { TrashIcon } from "@heroicons/vue/24/solid";
import BaseInput from "./BaseInput.vue";
import { useInvoiceStore } from "@/stores/user.js";
import { useRoute } from "vue-router";
import { uid } from "uid";
import { onBeforeMount, ref, watch, computed, reactive } from "vue";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Form,
  Field,
  useForm,
  FieldArray,
  ErrorMessage,
  useField,
} from "vee-validate";
import * as yup from "yup";

// Define a validation schema
const schema = yup.object().shape({
  BillerStreet: yup.string().required(),
  Billercity: yup.string().required(),
  Billercountry: yup.string().required(),
  BillerzipCode: yup
    .string()
    .required()
    .matches(/^[0-9]+$/, "Must be numeric"),
  clientStreet: yup.string().required(),
  Clientcity: yup.string().required(),
  clientName: yup.string().required(),
  Clientcountry: yup.string().required(),
  ClientzipCode: yup
    .string()
    .required()
    .matches(/^[0-9]+$/, "Must be numeric"),
  Clientemail: yup.string().required("email is required").email(),
  InvoiceDate: yup.date().default(() => new Date()),
  paymentTerms: yup.string().required(),
  paymentDue: yup.string().nullable(),
  productDescription: yup.string().required(),
  invoiceTotal: yup.string(),
  items: yup
    .array()
    .of(
      yup.object().shape({
        itemName: yup.string().required().label("Name"),
        itemQty: yup
          .string()
          .required()
          .label("Qty")
          .matches(/^[0-9]+$/, "Must be numeric"),
        itemPrice: yup
          .string()
          .required()
          .label("Price")
          .matches(/^[0-9]+$/, "Must be numeric"),
        itemTotal: yup.string().label("Total"),
      })
    )
    .strict(),
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

// console.log(userData);

watch(isEditInvoiceTitle, (newValue) => {
  if (newValue.isEditInvoiceTitle === true) {
    getdataoncall();
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
const paymentDue = ref("");
const invoiceStatus = ref("panding");
const invoiceTotal = ref(0);

const dateOptions = { year: "numeric", month: "short", day: "numeric" };
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

//Initialize invocie value
const initialData = computed(() => {
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
      invoiceTotal: userData.value.invoiceTotal,
      paymentDue: userData.value.paymentDue,
      paymentTerms: userData.value.paymentTerms,
      productDescription: userData.value.productDescription,
      items: userData.value.items,
    };
  } else {
    // var items = ["itemName", "itemQty", "itemPrice", "itemTotal"];
    // var emptyValue = ["", "", "", ""];

    // var newObj = {};

    // for (var i = 0; i < items.length; i++) {
    //   items: {
    //     newObj[items[i]] = emptyValue[i];
    //   }
    // }

    return {
      items: [
        {
          itemName: "",
          itemQty: "",
          itemPrice: "",
          itemTotal: "",
        },
      ],
    };
  }
});

//Submit form
const onSubmit = async (values, { resetForm }) => {
  console.log("i am click", values);
  if (isEditInvoiceTitle.isEditInvoiceTitle === true) {
    const updateInvoiceData = doc(db, "Invoice", userId.params.id);
    values.items.forEach((item) => {
      invoiceTotal.value += parseInt(item.itemTotal);
      values.invoiceTotal = invoiceTotal.value;
    });
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
      "values.paymentDue": values.paymentDue,
      "values.paymentTerms": values.paymentTerms,
      "values.productDescription": values.productDescription,
      "values.paymentDue": paymentDue.value,
      "values.invoiceStatus": invoiceStatus.value,
      "values.invoiceTotal": invoiceTotal.value,
      "values.items": values.items,
    });
    resetForm();
    userStore.isShow = true;
  } else {
    values.invoiceStatus = invoiceStatus.value;
    values.paymentDue = paymentDue.value;

    // Add invoice totoal to value
    values.items.forEach((item) => {
      invoiceTotal.value += parseInt(item.itemTotal);
      values.invoiceTotal = invoiceTotal.value;
    });

    // // Add data to firebase
    await addDoc(collection(db, "Invoice"), {
      values,
    });
    resetForm();
    userStore.isShow = true;
  }
};

const { resetForm } = useForm();
// reset page
const resetPage = () => {
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
        :initial-values="initialData"
      >
        <p class="capitalize text-indigo-400">Bill From</p>
        <BaseInput name="BillerStreet" label="Street Address" type="text" />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseInput name="Billercity" label="city" type="text" />
          <BaseInput name="BillerzipCode" label="zip Code" type="text" />
          <BaseInput name="Billercountry" label="Country" type="text" />
        </div>
        <p class="capitalize text-indigo-400 mt-3">Bill To</p>
        <BaseInput name="clientName" label="client's Name" type="text" />
        <BaseInput name="Clientemail" label="client's Email" type="email" />
        <BaseInput name="clientStreet" label="Street Address" type="text" />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseInput name="Clientcity" label="city" type="text" />
          <BaseInput name="ClientzipCode" label="zip Code" type="text" />
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
          <label class="text-white">Payment Terms</label>
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
        <!-- Item lists start -->
        <FieldArray name="items" v-slot="{ fields, push, remove }">
          <fieldset v-for="(field, idx) in fields" :key="field.key">
            <div class="grid grid-cols-3 md:grid-cols-6 gap-4 mt-3">
              <div class="flex flex-col col-span-2">
                <label :for="`Name_${idx}`" class="text-white">Item Name</label>
                <Field
                  :id="`itemName_${idx}`"
                  :name="`items[${idx}].itemName`"
                  class="rounded-md p-2 outline-none"
                />
                <ErrorMessage
                  :name="`items[${idx}].itemName`"
                  class="text-red-500"
                />
              </div>
              <div class="flex flex-col">
                <label :for="`Qty_${idx}`" class="text-white">Qty</label>
                <Field
                  :id="`itemQty_${idx}`"
                  :name="`items[${idx}].itemQty`"
                  class="rounded-md p-2 outline-none"
                />
                <ErrorMessage
                  :name="`items[${idx}].itemQty`"
                  class="text-red-500"
                />
              </div>
              <div class="flex flex-col">
                <label :for="`Price_${idx}`" class="text-white">Price</label>
                <Field
                  :id="`itemPrice_${idx}`"
                  :name="`items[${idx}].itemPrice`"
                  class="rounded-md p-2 outline-none"
                />
                <ErrorMessage
                  :name="`items[${idx}].itemPrice`"
                  class="text-red-500"
                />
              </div>

              <div class="flex flex-col">
                <label for="Total" class="text-white">Total</label>

                <Field
                  :id="`itemTotal_${idx}`"
                  :name="`items[${idx}].itemTotal`"
                  class="bg-white rounded-md p-2 outline-none"
                  :model-value="`${
                    field.value['itemQty'] * field.value['itemPrice']
                  }`"
                />

                <ErrorMessage
                  :name="`items[${idx}].itemTotal`"
                  class="text-red-500"
                />
              </div>
              <div class="w-9 flex items-end ml-2 text-white cursor-pointer">
                <TrashIcon @click="remove(idx)" />
              </div>
            </div>
          </fieldset>
          <div
            class="w-100 bg-black text-white text-center p-2 rounded-lg mt-10"
            @click="
              push({ itemPrice: '', itemQty: '', itemName: '', itemTotal: '' })
            "
          >
            <button type="button">Add Item</button>
          </div>
        </FieldArray>

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
