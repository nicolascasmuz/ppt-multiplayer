import firebase from "firebase";

const app = firebase.initializeApp({
  apiKey: "AIzaSyBVSYmOIVTzhCTe8svCkORdaFWh8WfEtS4",
  authDomain: "desafio-m6-dc09e.firebaseapp.com",
  databaseURL: "https://desafio-m6-dc09e-default-rtdb.firebaseio.com/",
});

const rtdb = firebase.database();

export { rtdb };
