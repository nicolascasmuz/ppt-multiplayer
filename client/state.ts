import { rtdb } from "./rtdb";

const API_BASE_URL = "http://localhost:3000";

/* const api: any = { url: "" };

if (process.env.ENV == "development") {
  api.url = "http://localhost:3000";
} else if (process.env.ENV == "production") {
  api.url = process.env.BACKEND_URL;
} */

type Move = "piedra" | "papel" | "tijera";

export const state = {
  data: {
    fullname: "",
    userId: "",
    roomId: "",
    rtdbRoomId: "",
    existingRoom: "",
    rtdbData: {},
    currentGame: {
      myMove: "",
      cpuMove: "",
    },
    history: [],
  },
  listeners: [],
  init() {
    const emptyData = {
      fullname: "",
      userId: "",
      roomId: "",
      rtdbRoomId: "",
      existingRoom: "",
    };

    const localData: any = localStorage.getItem("saved-state");
    if (!localData) {
      return;
    } else if (location.pathname == "/main" || location.pathname == "/") {
      this.setState(emptyData);
    } else {
      this.setState(JSON.parse(localData));
    }
  },
  getState() {
    return this.data;
  },
  setState(newState: Move) {
    this.data = newState;
    for (const cb of this.listeners) {
      cb(newState);
    }
    localStorage.setItem("saved-state", JSON.stringify(newState));
    console.log("State: ", newState);
  },
  subscribe(callback: (any) => any) {
    this.listeners.push(callback);
  },
  setFullname(fullname: string) {
    const cs = this.getState();
    cs.fullname = fullname;

    this.setState(cs);
  },
  setOnline(state: Boolean) {
    const cs = this.getState();
    cs.online = state;

    this.setState(cs);
  },
  async signIn(callback?) {
    const cs = this.getState();

    if (cs.existingRoom == "") {
      await fetch(API_BASE_URL + "/auth", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ fullname: cs.fullname }),
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          cs.userId = data.id;
          this.setState(cs);
          callback();
        });
    } else if (cs.existingRoom == true) {
      await fetch(API_BASE_URL + "/auth", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ fullname: cs.fullname }),
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          cs.userId = data.id;
          this.setState(cs);
        });
    }
  },
  async getExistingRoom(inputRoomid) {
    const cs = this.getState();

    await fetch(API_BASE_URL + "/room/" + inputRoomid).then((r) => {
      const contentLength = Number(r.headers.get("content-length"));
      if (contentLength != 0) {
        cs.roomId = inputRoomid;
        cs.existingRoom = true;
        fetch(API_BASE_URL + "/rooms/" + inputRoomid)
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            cs.rtdbRoomId = data.rtdbRoomId;
            this.setState(cs);
          });
      } else if (contentLength == 0) {
        cs.existingRoom = false;
      }
      this.setState(cs);
    });
  },
  async askNewRoom(callback?) {
    const cs = this.getState();

    await fetch(API_BASE_URL + "/rooms", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ userId: cs.userId }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        cs.roomId = data.id;
        cs.rtdbRoomId = data.fullId;
        this.setState(cs);
        if (callback) {
          callback();
        }
      });
  },
  async setRTDBdata(state: Boolean) {
    const cs = this.getState();

    await fetch(API_BASE_URL + "/rtdb-data", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        rtdbRoomId: cs.rtdbRoomId,
        userId: cs.userId,
        fullname: cs.fullname,
        state: state,
      }),
    });

    this.setState(cs);
  },
  listenToRoom() {
    const cs = this.getState();

    console.log("se ejecutó listenToRoom");

    const roomsRef = rtdb.ref("/rooms/" + cs.rtdbRoomId);
    roomsRef.on("value", (snapshot) => {
      const dataFromServer = snapshot.val();
      console.log("rtdb data: ", dataFromServer);
    });
  },
  getMoves() {
    const currentState = this.getState();
    return currentState.currentGame;
  },
  setMoves(getMove: Move) {
    const currentState = this.getState();

    // OBTIENE LA JUGADA DEL USUARIO
    currentState.currentGame.myMove = getMove;

    // GENERA LA JUGADA DEL CPU
    const movesArray = ["piedra", "papel", "tijera"];
    const randomMove =
      movesArray[Math.floor(Math.random() * movesArray.length)];
    currentState.currentGame.cpuMove = randomMove;

    // PASA LOS PARÁMETROS A getWinner()
    this.getWinner(getMove, randomMove);

    // SETEA EL STATE
    this.setState(currentState);
  },
  getWinner(myMove: Move, cpuMove: Move) {
    const currentState = this.getState();

    if (
      (myMove == "piedra" && cpuMove == "piedra") ||
      (myMove == "papel" && cpuMove == "papel") ||
      (myMove == "tijera" && cpuMove == "tijera")
    ) {
      currentState.history.push("draw");
    }
    if (
      (myMove == "piedra" && cpuMove == "tijera") ||
      (myMove == "papel" && cpuMove == "piedra") ||
      (myMove == "tijera" && cpuMove == "papel")
    ) {
      currentState.history.push("user");
    }
    if (
      (myMove == "tijera" && cpuMove == "piedra") ||
      (myMove == "papel" && cpuMove == "tijera") ||
      (myMove == "piedra" && cpuMove == "papel")
    ) {
      currentState.history.push("cpu");
    }

    this.setState(currentState);
  },
  getUserWins() {
    const currentState = this.getState();

    const filterUserWins = currentState.history.filter((i) => {
      return i == "user";
    });
    return filterUserWins.length;
  },
  getCPUWins() {
    const currentState = this.getState();

    const filterUserWins = currentState.history.filter((i) => {
      return i == "cpu";
    });
    return filterUserWins.length;
  },
};
