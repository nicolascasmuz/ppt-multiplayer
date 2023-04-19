import { Router } from "@vaadin/router";
import { state } from "../state";

customElements.define(
  "sign-in-page",
  class extends HTMLElement {
    connectedCallback() {
      this.render();

      const cs = state.getState();

      const signInFormEl = this.querySelector(".sign-in__form") as HTMLElement;

      if (cs.rtdbRoomId) {
        signInFormEl.addEventListener("submit", async (e: any) => {
          e.preventDefault();

          const nameValue = e.target["name"].value;

          state.setFullname(nameValue);
          state.setOnline(true);
          state.setMove("");

          await state.signIn(() => {
            state
              .setRTDBdata()
              .then(() => {
                state.listenToRoom();
              })
              .catch(() => {
                Router.go("/error");
              });
          });
        });
      } else {
        signInFormEl.addEventListener("submit", async (e: any) => {
          e.preventDefault();

          const nameValue = e.target["name"].value;

          state.setFullname(nameValue);
          state.setOnline(true);

          await state.signIn(() => {
            state.askNewRoom(() => {
              state.setRTDBdata().then(() => {
                state.listenToRoom();
              });
            });
          });
        });
      }
    }
    render() {
      this.innerHTML = `
          <main-title-comp title="Piedra Papel o Tijera"></main-title-comp>
          <form class="sign-in__form">
            <text-field-comp type="text" name="name" placeholder="'tu nombre'"></text-field-comp>
            <button-comp class="button__ingresar-sala">Empezar</button-comp>
          </form>
          <hands-comp></hands-comp>
        `;

      const style = document.createElement("style");
      style.innerHTML = `
          main-title-comp {
            grid-row: 1;
            align-self: center;
            margin-top: 25px;
          }
          .sign-in__form {
            grid-row: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            align-self: center;
            gap: 20px;
          }
          hands-comp {
            grid-row: 3;
            align-self: end;
          }
          `;

      this.appendChild(style);
    }
  }
);
