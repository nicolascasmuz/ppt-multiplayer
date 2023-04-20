import { onValue, ref } from "firebase/database";
import { rtdb } from "./rtdb";
import { map } from "lodash";
import { Router } from "@vaadin/router";

/* const API_BASE_URL = "http://localhost:3000"; */

var API_BASE_URL: any = "";

if (process.env.ENV == "development") {
  API_BASE_URL = "http://localhost:3000";
} else if (process.env.ENV == "production") {
  API_BASE_URL = process.env.BACKEND_URL;
}

type Move = "rock" | "paper" | "scissors" | "no-move" | "";

export const state = {
  data: {
    fullname: "",
    userId: "",
    roomId: "",
    rtdbRoomId: "",
    start: "",
    online: "",
    myMove: "",
    rtdbData: "",
    opponentId: "",
    history: [],
  },
  listeners: [],
  init() {
    const emptyData = {
      fullname: "",
      userId: "",
      roomId: "",
      rtdbRoomId: "",
      start: "",
      online: "",
      myMove: "",
      rtdbData: "",
      opponentId: "",
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
  setRoomId(roomId: string) {
    const cs = this.getState();
    cs.roomId = roomId;

    this.setState(cs);
  },
  setOpponentId(opponentId) {
    const cs = this.getState();
    cs.opponentId = opponentId;

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
  async getExistingRoom() {
    const cs = this.getState();

    const res = await fetch(API_BASE_URL + "/room/" + cs.roomId, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error();
    }

    const data = await res.json();

    cs.rtdbRoomId = data.rtdbRoomId;

    this.setState(cs);
  },
  async setRTDBdata(callback?) {
    const cs = this.getState();

    const res = await fetch(API_BASE_URL + "/rtdb-data", {
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

    if (!res.ok) {
      throw new Error();
    }

    await res.json();

    if (callback) {
      callback();
    }

    this.setState(cs);
  },
  async listenToRoom() {
    const cs = this.getState();

    const roomsRef = ref(rtdb, "/rooms/" + cs.rtdbRoomId);

    await onValue(roomsRef, (snapshot) => {
      const value = snapshot.val();
      cs.rtdbData = value.currentGame;

      this.setState(cs);

      this.listenToPlayersStatus();
    });
  },
  async listenToResults() {
    const cs = this.getState();

    const roomsRef = ref(rtdb, "/rooms/" + cs.rtdbRoomId);

    await onValue(roomsRef, (snapshot) => {
      const cs = this.getState();

      const movesFromServer = snapshot.val();
      const movesList = map(movesFromServer.history);

      const resultsArray: any = [];

      for (const i of movesList) {
        resultsArray.push(i);
      }

      cs.history = resultsArray;

      this.setState(cs);
    });
  },
  getMoves() {
    const cs = this.getState();

    const currentGame = {
      myMove: cs.myMove,
      opponentMove: cs.rtdbData[cs.opponentId].move,
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

    const opponentMove = cs.rtdbData[cs.opponentId].move;
    const opponentName = cs.rtdbData[cs.opponentId].fullname;

    if (
      (cs.myMove == "rock" && opponentMove == "rock") ||
      (cs.myMove == "paper" && opponentMove == "paper") ||
      (cs.myMove == "scissors" && opponentMove == "scissors")
    ) {
      this.pushWinner("draw");
    }
    if (
      (cs.myMove == "rock" && opponentMove == "scissors") ||
      (cs.myMove == "paper" && opponentMove == "rock") ||
      (cs.myMove == "scissors" && opponentMove == "paper")
    ) {
      this.pushWinner(cs.fullname);
    }
    if (
      (cs.myMove == "scissors" && opponentMove == "rock") ||
      (cs.myMove == "paper" && opponentMove == "scissors") ||
      (cs.myMove == "rock" && opponentMove == "paper")
    ) {
      this.pushWinner(opponentName);
    }
    if (
      (cs.myMove == "no-move" && opponentMove == "no-move") ||
      (cs.myMove == "no-move" && opponentMove == "no-move") ||
      (cs.myMove == "no-move" && opponentMove == "no-move")
    ) {
      this.pushWinner("draw");
    }
    if (
      (cs.myMove == "scissors" && opponentMove == "no-move") ||
      (cs.myMove == "paper" && opponentMove == "no-move") ||
      (cs.myMove == "rock" && opponentMove == "no-move")
    ) {
      this.pushWinner(cs.fullname);
    }
    if (
      (cs.myMove == "no-move" && opponentMove == "rock") ||
      (cs.myMove == "no-move" && opponentMove == "scissors") ||
      (cs.myMove == "no-move" && opponentMove == "paper")
    ) {
      this.pushWinner(opponentName);
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
      return i.result == cs.rtdbData[cs.opponentId].fullname;
    });
    return filterUserWins.length / 2;
  },
  listenToPlayersStatus() {
    const cs = this.getState();
    const cg = cs.rtdbData;

    const players = Object.values(cg) as any;

    const everyoneIsOnline = players.every((player: any) => player.online);
    const everyonePushedStart = players.every((player: any) => player.start);
    const everyoneMoved = players.every((player: any) => player.move);

    if (players.length == 2) {
      if (!everyoneIsOnline) {
        Router.go("/share-code");
      }
      if (
        everyoneIsOnline &&
        !everyonePushedStart &&
        !everyoneMoved &&
        location.pathname != "/results"
      ) {
        Router.go("/start");
      }
      if (
        everyoneIsOnline &&
        !everyonePushedStart &&
        cs.start == true &&
        location.pathname != "/results"
      ) {
        Router.go("/waiting");
      }
      if (everyoneIsOnline && everyonePushedStart && !everyoneMoved) {
        Router.go("/countdown");
      }
      if (
        everyoneIsOnline &&
        everyonePushedStart &&
        everyoneMoved &&
        location.pathname != "/results"
      ) {
        Router.go("/moves");
      }
    }

    if (players.length == 1) {
      Router.go("/share-code");
    }
  },
};
