import { Router } from "@vaadin/router";
import { state } from "../state";

customElements.define(
  "start-page",
  class extends HTMLElement {
    connectedCallback() {
      this.render();

      const cs = state.getState();
      state.listenToRoom();

      const startButtonEl = this.querySelector(".button__start") as HTMLElement;

      startButtonEl.addEventListener("click", () => {
        state.setStart(true);
        state.setRTDBdata();
        Router.go("/waiting");
      });
    }
    render() {
      const cs = state.getState();

      this.innerHTML = `
                <score-comp player1-name='${cs.fullname}' player2-name='${
        cs.opponentData ? cs.opponentData.fullname : ""
      }'></score-comp>
                <room-id-comp room-id=${
                  cs.roomId ? cs.roomId : ""
                }></room-id-comp>
                <p class="text-start">Presioná jugar y elegí: piedra, papel o tijera antes de que pasen los 3 segundos.</p>
                <button-comp class="button__start">¡Jugar!</button-comp>
                <hands-comp></hands-comp>
              `;

      const style = document.createElement("style");
      style.innerHTML = `
                score-comp {
                  grid-row: 1;
                  grid-column: 1;
                  margin-top: 10px;
                }
                room-id-comp {
                  grid-row: 1;
                  grid-column: 2;
                  margin-top: 10px;
                }
                .text-start {
                  grid-row: 2;
                  grid-column: 1 / span 2;
                  color: #080808;
                  font-family: "American Typewriter Regular";
                  font-size: 35px;
                  text-align: center;
                  min-width: 317px;
                  max-width: 754px;
                  margin: 0px 30px;
                  align-self: center;
                }
                button-comp {
                  grid-row: 3;
                  grid-column: 1 / span 2;
                }
                hands-comp {
                  grid-row: 4;
                  grid-column: 1 / span 2;
                  align-self: end;
                }
                `;

      this.appendChild(style);
    }
  }
);
