customElements.define(
  "text-field-comp",
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

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = this.text;
      input.classList.add("input");

      const style = document.createElement("style");
      style.innerHTML = `
        .input {
            background-color: #fafafa;
            border: solid 10px #001997;
            border-radius: 10px;
            color: #080808;
            font-family: 'Odibee Sans', cursive;
            font-size: 45px;
            text-align: center;
            width: 300px;
            height: 72px;
            margin: 0;
        }
      `;

      this.shadow.appendChild(input);
      this.shadow.appendChild(style);
    }
  }
);
