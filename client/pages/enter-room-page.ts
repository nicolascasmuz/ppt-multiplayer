import { Router } from "@vaadin/router";
import { state } from "../state";

customElements.define(
  "enter-room-page",
  class extends HTMLElement {
    connectedCallback() {
      this.render();

      const cs = state.getState();

      const signInFormEl = this.querySelector(
        ".enter-room__form"
      ) as HTMLElement;

      signInFormEl.addEventListener("submit", (e: any) => {
        e.preventDefault();
        const codeValue = e.target["codigo"].value;
        state.getExistingRoom(codeValue).then(() => {
          if (cs.existingRoom == true) {
            Router.go("/sign-in");
          }
        });
      });
    }
    render() {
      this.innerHTML = `
        <main-title-comp title="Piedra Papel o Tijera"></main-title-comp>
        <form class="enter-room__form">
          <text-field-comp type="text" name="codigo" placeholder="'código'"></text-field-comp>
          <button-comp class="button__ingresar-sala">Ingresar</button-comp>
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
        .enter-room__form {
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
