import firebase from "firebase";

const app = firebase.initializeApp({
  apiKey: "AIzaSyBVSYmOIVTzhCTe8svCkORdaFWh8WfEtS4",
  authDomain: "desafio-m6-dc09e.firebaseapp.com",
  databaseURL: "https://desafio-m6-dc09e-default-rtdb.firebaseio.com",
  projectId: "desafio-m6-dc09e",
  storageBucket: "desafio-m6-dc09e.appspot.com",
  messagingSenderId: "43110336992",
  appId: "1:43110336992:web:d9c95c7ca4dc9d83240385",
  measurementId: "G-42YEWPNSWG",
});

const rtdb = firebase.database();

export { rtdb };
