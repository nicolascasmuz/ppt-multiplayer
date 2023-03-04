customElements.define(
  "countdown-page",
  class extends HTMLElement {
    shadow: ShadowRoot;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.render();
    }
    render() {
      this.shadow.innerHTML = `
        <countdown-comp></countdown-comp>
        <hands-comp></hands-comp>
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

      this.shadow.appendChild(style);
    }
  }
);
