import { Router } from "@vaadin/router";
import { state } from "../state";

customElements.define(
  "countdown-page",
  class extends HTMLElement {
    connectedCallback() {
      setTimeout(() => {
        state.setRTDBdata();
        Router.go("/moves");
      }, 3000);

      this.render();
    }
    render() {
      this.innerHTML = `
        <countdown-comp></countdown-comp>
        <rock-paper-scissors-comp></rock-paper-scissors-comp>
      `;

      const style = document.createElement("style");
      style.innerHTML = `
        countdown-comp {
          grid-row: 1;
        }
        hands-comp {
          grid-row: 2;
          align-self: end;
        }
        `;

      this.appendChild(style);
    }
  }
);
