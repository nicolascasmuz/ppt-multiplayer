import { Router } from "@vaadin/router";
import { state } from "../state";

customElements.define(
  "sign-in-page",
  class extends HTMLElement {
    connectedCallback() {
      this.render();

      const cs = state.getState();

      const signInFormEl = this.querySelector(".sign-in__form") as HTMLElement;

      signInFormEl.addEventListener("submit", (e: any) => {
        e.preventDefault();
        const nameValue = e.target["nombre"].value;
        state.setFullname(nameValue);
        if (cs.existingRoom == "") {
          state.signIn(() => {
            state.askNewRoom();
          });
          Router.go("/share-code");
        } else {
          state.signIn();
          Router.go("/share-code");
        }
      });
    }
    render() {
      this.innerHTML = `
          <main-title-comp title="Piedra Papel o Tijera"></main-title-comp>
          <form class="sign-in__form">
            <text-field-comp type="text" name="nombre" placeholder="'tu nombre'"></text-field-comp>
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
