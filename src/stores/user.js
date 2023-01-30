import { ref, onMounted, reactive } from "vue";
import { defineStore } from "pinia";
import { db } from "@/firebase";
import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";

export const useInvoiceStore = defineStore("invoiceStore", () => {
  const user = ref([]);
  const isShow = ref(true);

  // Get data from firebase

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

  return { user, isShow };
});
