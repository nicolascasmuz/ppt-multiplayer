import { rtdb } from "./rtdb";
import { map } from "lodash";

const API_BASE_URL = "http://localhost:3000";

/* const api: any = { url: "" };
if (process.env.ENV == "development") {
  api.url = "http://localhost:3000";
} else if (process.env.ENV == "production") {
  api.url = process.env.BACKEND_URL;
} */

type Move = "rock" | "paper" | "scissors" | "";

export const state = {
  data: {
    fullname: "",
    userId: "",
    roomId: "",
    rtdbRoomId: "",
    existingRoom: "",
    fullRoom: "",
    playersInRoom: "",
    foundPlayer: "",
    start: "",
    online: "",
    myMove: "",
    opponentData: "",
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
      fullRoom: "",
      playersInRoom: "",
      foundPlayer: "",
      start: "",
      online: "",
      myMove: "",
      opponentData: "",
      history: [],
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
  setStart(state: Boolean) {
    const cs = this.getState();
    cs.start = state;

    this.setState(cs);
  },
  async signIn(callback?) {
    const cs = this.getState();

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
        if (callback) {
          callback();
        }
      });
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
  async checkFullRoom(callback?) {
    const cs = this.getState();

    const roomsRef = rtdb.ref("/rooms/" + cs.rtdbRoomId + "/currentGame/");
    await roomsRef.on("value", (snapshot) => {
      const dataFromServer = snapshot.val();
      const dataArray = [dataFromServer];

      const makeNewArray = Object.entries(dataArray[0]);

      if (makeNewArray.length == 0) {
        cs.fullRoom = false;
      } else if (makeNewArray.length == 1) {
        cs.fullRoom = false;
      } else if (makeNewArray.length == 2) {
        cs.fullRoom = true;

        const player1: any = makeNewArray[0][1];
        const player2: any = makeNewArray[1][1];

        cs.playersInRoom = [player1.fullname, player2.fullname];
      }
      console.log("cs.playersInRoom: ", cs.playersInRoom);

      this.setState(cs);
      /* callback(); */
    });
  },
  async checkPlayersInRooms(playerName) {
    const cs = this.getState();

    if (cs.playersInRoom != "") {
      const findPlayer = cs.playersInRoom.find((p) => {
        return p == playerName;
      });
      if (findPlayer) {
        cs.foundPlayer = true;
      } else {
        cs.foundPlayer = false;
      }
    }
    console.log("cs.foundPlayer: ", cs.foundPlayer);

    await this.setState(cs);
  },
  async setRTDBdata(state?: Boolean) {
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
        online: cs.online,
        start: cs.start,
        move: cs.myMove,
      }),
    });

    this.setState(cs);
  },
  listenToRoom() {
    const cs = this.getState();

    const roomsRef = rtdb.ref("/rooms/" + cs.rtdbRoomId + "/currentGame/");
    roomsRef.on("value", (snapshot) => {
      const dataFromServer = snapshot.val();
      const dataArray = [dataFromServer];
      const makeNewArray = Object.entries(dataArray[0]);

      if (!makeNewArray[1]) {
        null;
      } else {
        const idArray = [makeNewArray[0][0], makeNewArray[1][0]];

        const filteredId = idArray.filter((id) => {
          return id != cs.userId;
        });

        cs.opponentData = dataFromServer[filteredId[0]];
      }

      this.setState(cs);
    });
  },
  async listenResults() {
    const cs = this.getState();

    const chatroomsRef = rtdb.ref("/rooms/" + cs.rtdbRoomId);
    await chatroomsRef.on("value", (snapshot) => {
      const currentState = this.getState();
      const messagesFromServer = snapshot.val();
      const messagesList = map(messagesFromServer.history);

      const resultsArray: any = [];

      for (const i of messagesList) {
        resultsArray.push(i);
      }

      currentState.history = resultsArray;

      this.setState(currentState);
    });
  },
  getMoves() {
    const cs = this.getState();

    const currentGame = {
      myMove: cs.myMove,
      opponentMove: cs.opponentData.move,
    };

    return currentGame;
  },
  setMove(Move: Move) {
    const cs = this.getState();

    cs.myMove = Move;

    this.setState(cs);
  },
  getWinner() {
    const cs = this.getState();

    if (
      (cs.myMove == "rock" && cs.opponentData.move == "rock") ||
      (cs.myMove == "paper" && cs.opponentData.move == "paper") ||
      (cs.myMove == "scissors" && cs.opponentData.move == "scissors")
    ) {
      this.pushWinner("draw");
    }
    if (
      (cs.myMove == "rock" && cs.opponentData.move == "scissors") ||
      (cs.myMove == "paper" && cs.opponentData.move == "rock") ||
      (cs.myMove == "scissors" && cs.opponentData.move == "paper")
    ) {
      this.pushWinner(cs.fullname);
    }
    if (
      (cs.myMove == "scissors" && cs.opponentData.move == "rock") ||
      (cs.myMove == "paper" && cs.opponentData.move == "scissors") ||
      (cs.myMove == "rock" && cs.opponentData.move == "paper")
    ) {
      this.pushWinner(cs.opponentData.fullname);
    }
    if (
      (cs.myMove == "" && cs.opponentData.move == "") ||
      (cs.myMove == "" && cs.opponentData.move == "") ||
      (cs.myMove == "" && cs.opponentData.move == "")
    ) {
      this.pushWinner("draw");
    }
    if (
      (cs.myMove == "scissors" && cs.opponentData.move == "") ||
      (cs.myMove == "paper" && cs.opponentData.move == "") ||
      (cs.myMove == "rock" && cs.opponentData.move == "")
    ) {
      this.pushWinner(cs.fullname);
    }
    if (
      (cs.myMove == "" && cs.opponentData.move == "rock") ||
      (cs.myMove == "" && cs.opponentData.move == "scissors") ||
      (cs.myMove == "" && cs.opponentData.move == "paper")
    ) {
      this.pushWinner(cs.opponentData.fullname);
    }

    this.setState(cs);
  },
  pushWinner(winner: string) {
    const cs = this.getState();

    fetch(API_BASE_URL + "/history", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        rtdbRoomId: cs.rtdbRoomId,
        result: winner,
      }),
    }).then((w) => {
      console.log("winner: ", w);
    });

    this.setState(cs);
  },
  getMyWins() {
    const cs = this.getState();

    const filterUserWins = cs.history.filter((i) => {
      return i.result == cs.fullname;
    });
    return filterUserWins.length / 2;
  },
  getOpponentWins() {
    const cs = this.getState();

    const filterUserWins = cs.history.filter((i) => {
      return i.result == cs.opponentData.fullname;
    });
    return filterUserWins.length / 2;
  },
};
