const piedraImg = require("url:../resources/piedra.png");
const papelImg = require("url:../resources/papel.png");
const tijeraImg = require("url:../resources/tijera.png");
import { defaultMaxListeners } from "events";
/* import { state } from "../state"; */

customElements.define(
  "moves-page",
  class extends HTMLElement {
    shadow: ShadowRoot;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.render();
    }
    render() {
      const div = document.createElement("div");
      div.classList.add("moves-comp__div");

      div.innerHTML = `
          <img class="top-hand" src=${piedraImg}></img>
          <img class="bottom-hand" src=${papelImg}></img>
        `;

      /* if (currentMoves.cpuMove == "piedra" && currentMoves.myMove == "piedra") {
    div.innerHTML = `
          <img class="top-hand" src=${piedraImg}></img>
          <img class="bottom-hand" src=${piedraImg}></img>
        `;

    div.appendChild(style);
    return div;
  }
  if (currentMoves.cpuMove == "papel" && currentMoves.myMove == "papel") {
    div.innerHTML = `
          <img class="top-hand" src=${papelImg}></img>
          <img class="bottom-hand" src=${papelImg}></img>
        `;

    div.appendChild(style);
    return div;
  }
  if (currentMoves.cpuMove == "tijera" && currentMoves.myMove == "tijera") {
    div.innerHTML = `
          <img class="top-hand" src=${tijeraImg}></img>
          <img class="bottom-hand" src=${tijeraImg}></img>
        `;

    div.appendChild(style);
    return div;
  }
  if (currentMoves.cpuMove == "piedra" && currentMoves.myMove == "tijera") {
    div.innerHTML = `
          <img class="top-hand" src=${piedraImg}></img>
          <img class="bottom-hand" src=${tijeraImg}></img>
        `;

    div.appendChild(style);
    return div;
  }
  if (currentMoves.cpuMove == "papel" && currentMoves.myMove == "piedra") {
    div.innerHTML = `
          <img class="top-hand" src=${papelImg}></img>
          <img class="bottom-hand" src=${piedraImg}></img>
        `;

    div.appendChild(style);
    return div;
  }
  if (currentMoves.cpuMove == "tijera" && currentMoves.myMove == "papel") {
    div.innerHTML = `
          <img class="top-hand" src=${tijeraImg}></img>
          <img class="bottom-hand" src=${papelImg}></img>
        `;

    div.appendChild(style);
    return div;
  }
  if (currentMoves.cpuMove == "tijera" && currentMoves.myMove == "piedra") {
    div.innerHTML = `
          <img class="top-hand" src=${tijeraImg}></img>
          <img class="bottom-hand" src=${piedraImg}></img>
        `;

    div.appendChild(style);
    return div;
  }
  if (currentMoves.cpuMove == "papel" && currentMoves.myMove == "tijera") {
    div.innerHTML = `
          <img class="top-hand" src=${papelImg}></img>
          <img class="bottom-hand" src=${tijeraImg}></img>
        `;

    div.appendChild(style);
    return div;
  }
  if (currentMoves.cpuMove == "piedra" && currentMoves.myMove == "papel") {
    div.innerHTML = `
          <img class="top-hand" src=${piedraImg}></img>
          <img class="bottom-hand" src=${papelImg}></img>
        `; */

      const style = document.createElement("style");

      style.innerHTML = `
        .moves-comp__div {
          display: grid;
        }
        .top-hand {
          grid-row: 1;
          width: 156px;
          height: 312px;
          -webkit-transform: rotate(-180deg);
          -moz-transform: rotate(-180deg);
          -ms-transform: rotate(-180deg);
          transform: rotate(-180deg);
        }
        .bottom-hand {
          grid-row: 2;
          width: 156px;
          height: 312px;
          align-self: flex-end;
        }
    `;

      this.shadow.appendChild(div);
      this.shadow.appendChild(style);
    }
  }
);
