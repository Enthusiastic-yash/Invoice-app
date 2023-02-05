import { ref, onMounted, watch } from "vue";
import { defineStore } from "pinia";
import { db } from "@/firebase";
import { useRoute } from "vue-router";
import { collection, onSnapshot } from "firebase/firestore";

export const useInvoiceStore = defineStore("invoiceStore", () => {
  const user = ref([]);
  const isShow = ref(true);
  const editInvoice = ref("");
  const isEditInvoiceTitle = ref(false);
  const route = useRoute();
  const sigleinvoiceData = ref("");

  // Setting router is edit or newinvoice
  watch(route, (newValue) => {
    if (newValue.params.id) {
      isEditInvoiceTitle.value = true;
    } else {
      isEditInvoiceTitle.value = false;
    }
  });

  // Get All data from firebase
  onMounted(() => {
    onSnapshot(collection(db, "Invoice"), (querySnapShot) => {
      let userCollection = [];
      querySnapShot.forEach((doc) => {
        let userData = doc.data().values;
        let docId = doc.id;
        userData.uid = docId;
        userCollection.push(userData);
      });
      user.value = userCollection;
    });
  });

  const editInvoiceFun = (id) => {
    editInvoice.value = id;
  };

  // GEt singleinvoice data from invoiceDetails component
  const getSingleInvoiceData = (data) => {
    sigleinvoiceData.value = data;
  };

  return {
    user,
    isShow,
    editInvoice,
    editInvoiceFun,
    isEditInvoiceTitle,
    sigleinvoiceData,
    getSingleInvoiceData,
  };
});
