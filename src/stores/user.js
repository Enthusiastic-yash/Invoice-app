import { ref, onMounted } from "vue";
import { defineStore } from "pinia";
import { db } from "@/firebase";
import { collection, doc, getDocs } from "firebase/firestore";

export const useInvoiceStore = defineStore("invoiceStore", () => {
  const user = ref([]);
  const isShow = ref(true);

  // Get data from firebase
  onMounted(async () => {
    const querySnapshot = await getDocs(collection(db, "Invoice"));
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      let userData = doc.data().values;
      let docId = doc.id;
      userData.uid = docId;
      user.value.push(userData);
    });
  });

  // Add data to firebase

  return { user, isShow };
});
