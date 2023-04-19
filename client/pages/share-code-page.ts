import { state } from "../state";

customElements.define(
  "share-code-page",
  class extends HTMLElement {
    roomId: string;
    opponentName: string;
    connectedCallback() {
      state.subscribe(() => {
        const currentState = state.getState();
        this.roomId = currentState.roomId;
        this.render();
      });

      const cs = state.getState();
      this.roomId = cs.roomId;

      var getEntries = Object.entries(cs.rtdbData);

      if (getEntries[1]) {
        var idArray = [getEntries[0][0], getEntries[1][0]];

        const oppId: any = idArray.find((id) => {
          return cs.userId != id;
        });

        this.opponentName = cs.rtdbData[oppId].fullname;
        state.setOpponentId(oppId);
      } else {
        this.opponentName = "";
      }

      state.listenToResults();

      this.render();
    }
    render() {
      const cs = state.getState();

      this.innerHTML = `
              <score-comp player1-name='${cs.fullname}' player2-name='${
        this.opponentName ? this.opponentName : ""
      }' score1-name='${state.getMyWins()}' score2-name='${state.getOpponentWins()}'></score-comp>
              <room-id-comp room-id=${
                this.roomId ? this.roomId : ""
              }></room-id-comp>
              <div class="text-container">
                <p class="text-share-code1">Compartí el código:</p>
                <span class="text-room-id">${
                  this.roomId ? this.roomId : "cargando..."
                }</span>
                <p class="text-share-code2">con tu contrincante</p>
              </div>
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
            .text-container {
              grid-row: 2;
              grid-column: 1 / span 2;
              color: #080808;
              font-size: 35px;
              margin: 0;
              text-align: center;
              min-width: 317px;
              max-width: 754px;
              align-self: center;
            }
            .text-share-code1 {
              font-family: "American Typewriter Regular";
            }
            .text-room-id {
                font-family: "American Typewriter Bold";
            }
            .text-share-code2 {
              font-family: "American Typewriter Regular";
            }
            hands-comp {
              grid-row: 3;
              grid-column: 1 / span 2;
              align-self: end;
            }
              `;

      this.appendChild(style);
    }
  }
);
