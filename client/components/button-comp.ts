customElements.define(
  "button-comp",
  class extends HTMLElement {
    shadow: ShadowRoot;
    text: string;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.render();
    }
    render() {
      this.text = this.getAttribute("text") || "";

      const button = document.createElement("button");
      button.classList.add("button");
      button.textContent = this.text;

      const style = document.createElement("style");
      style.innerHTML = `
        .button {
            background-color: #006CFC;
            border: solid 10px #001997;
            border-radius: 10px;
            color: #D8FCFC;
            font-family: 'Odibee Sans', cursive;
            font-size: 45px;
            min-width: 322px;
            min-height: 87px;
            margin: 0;
        }
      `;

      this.shadow.appendChild(button);
      this.shadow.appendChild(style);
    }
  }
);
