var cpuMove = "tijera";
var myMove = "piedra";

const resultGreenStarImg = require("url:../resources/Star-1.png");
const resultRedStarImg = require("url:../resources/Star-2.png");
const resultYellowStarImg = require("url:../resources/Star-3.png");

const rectangleOne = require("url:../resources/Rectangle-1.png");
const rectangleTwo = require("url:../resources/Rectangle-2.png");
const rectangleThree = require("url:../resources/Rectangle-3.png");

customElements.define(
  "results-page",
  class extends HTMLElement {
    shadow: ShadowRoot;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.render();
    }
    render() {
      const div = document.createElement("div");

      if (
        (cpuMove == "piedra" && myMove == "piedra") ||
        (cpuMove == "papel" && myMove == "papel") ||
        (cpuMove == "tijera" && myMove == "tijera")
      ) {
        div.classList.add("result-page-draw__screen");
        div.innerHTML = `
              <star-comp text="Empate" img="${resultYellowStarImg}"></star-comp>
              <results-chart-comp title="Puntaje" my-result="0" cpu-result="0"></results-chart-comp>
              <button-comp class="result-page-button">Volver a jugar</button-comp>
            `;

        this.shadow.appendChild(div);
      }
      if (
        (cpuMove == "piedra" && myMove == "tijera") ||
        (cpuMove == "papel" && myMove == "piedra") ||
        (cpuMove == "tijera" && myMove == "papel")
      ) {
        div.classList.add("result-page-cpu-wins__screen");
        div.innerHTML = `
              <star-comp text="Perdiste" img="${resultRedStarImg}"></star-comp>
              <results-chart-comp title="Puntaje" my-result="0" cpu-result="0"></results-chart-comp>
              <button-comp class="result-page-button">Volver a jugar</button-comp>
            `;

        this.shadow.appendChild(div);
      }
      if (
        (cpuMove == "tijera" && myMove == "piedra") ||
        (cpuMove == "papel" && myMove == "tijera") ||
        (cpuMove == "piedra" && myMove == "papel")
      ) {
        div.classList.add("result-page-user-wins__screen");
        div.innerHTML = `
              <star-comp text="Ganaste" img="${resultGreenStarImg}"></star-comp>
              <results-chart-comp title="Puntaje" my-result="0" cpu-result="0"></results-chart-comp>
              <button-comp class="result-page-button">Volver a jugar</button-comp>
            `;

        this.shadow.appendChild(div);
      }

      const style = document.createElement("style");
      style.innerHTML = `
          .result-page-draw__screen {
            background-image: url(${rectangleThree});
            display: grid;
            grid-template-columns: auto;
            grid-template-rows: auto auto auto;
            align-content: space-around;
            justify-items: center;
            height: 100vh;
          }
          .result-page-cpu-wins__screen {    
            background-image: url(${rectangleTwo});
            display: grid;
            grid-template-columns: auto;
            grid-template-rows: auto auto auto;
            align-content: space-around;
            justify-items: center;
            height: 100vh;
          }
          .result-page-user-wins__screen {
            background-image: url(${rectangleOne});
            display: grid;
            grid-template-columns: auto;
            grid-template-rows: auto auto auto;
            align-content: space-around;
            justify-items: center;
            height: 100vh;
          }
          star-comp {
            grid-row: 1;
            align-self: center;
          }
          results-chart-comp {
            grid-row: 2;
            align-self: center;
          }
          button-comp {
            grid-row: 3;
            align-self: center;
          }
          `;

      this.shadow.appendChild(style);
    }
  }
);
