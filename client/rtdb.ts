import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBVSYmOIVTzhCTe8svCkORdaFWh8WfEtS4",
  databaseURL: "https://desafio-m6-dc09e-default-rtdb.firebaseio.com",
  projectId: "desafio-m6-dc09e",
  storageBucket: "desafio-m6-dc09e.appspot.com",
};

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);

export { rtdb };
