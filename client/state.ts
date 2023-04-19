import { onValue, ref } from "firebase/database";
import { rtdb } from "./rtdb";
import { map } from "lodash";
import { Router } from "@vaadin/router";

const API_BASE_URL = "http://localhost:3000";

/* const api: any = { url: "" };
if (process.env.ENV == "development") {
  api.url = "http://localhost:3000";
} else if (process.env.ENV == "production") {
  api.url = process.env.BACKEND_URL;
} */

type Move = "rock" | "paper" | "scissors" | "no-move" | "";

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
      existingRoom: "",
      fullRoom: "",
      playersInRoom: "",
      foundPlayer: "",
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
  async joinRoom() {
    const cs = this.getState();

    const response = await fetch(
      API_BASE_URL +
        "/rtdb/room/" +
        cs.rtdbRoomId +
        "/?fullname=" +
        cs.fullname,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "post",
        body: JSON.stringify({
          move: "",
          online: true,
          start: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error();
    }

    await response.json();
  },
  async getExistingRoom() {
    const cs = this.getState();

    const roomId = cs.roomId;

    const response = await fetch(API_BASE_URL + "/room/" + roomId, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "get",
    });

    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();

    cs.rtdbRoomId = data.rtdbRoomId;

    this.setState(cs);
  },
  /* async checkFullRoom(callback?) {
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
    });
  }, */
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
  async setRTDBdata(callback?) {
    const cs = this.getState();

    const response = await fetch(API_BASE_URL + "/rtdb-data", {
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

    if (!response.ok) {
      throw new Error();
    }

    await response.json();

    if (callback) {
      callback();
    }

    this.setState(cs);
  },
  async listenToRoom() {
    const cs = this.getState();

    const roomsRef = ref(rtdb, "/rooms/" + cs.rtdbRoomId);

    await onValue(roomsRef, (snapshot) => {
      const cs = this.getState();

      const value = snapshot.val();

      cs.rtdbData = value.currentGame;

      this.setState(cs);

      this.checkPlayersStatus();
    });
  },
  /* listenToRoom() {
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
  },  */
  async listenResults() {
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

    if (
      (cs.myMove == "rock" && cs.rtdbData[cs.opponentId].move == "rock") ||
      (cs.myMove == "paper" && cs.rtdbData[cs.opponentId].move == "paper") ||
      (cs.myMove == "scissors" && cs.rtdbData[cs.opponentId].move == "scissors")
    ) {
      this.pushWinner("draw");
    }
    if (
      (cs.myMove == "rock" && cs.rtdbData[cs.opponentId].move == "scissors") ||
      (cs.myMove == "paper" && cs.rtdbData[cs.opponentId].move == "rock") ||
      (cs.myMove == "scissors" && cs.rtdbData[cs.opponentId].move == "paper")
    ) {
      this.pushWinner(cs.fullname);
    }
    if (
      (cs.myMove == "scissors" && cs.rtdbData[cs.opponentId].move == "rock") ||
      (cs.myMove == "paper" && cs.rtdbData[cs.opponentId].move == "scissors") ||
      (cs.myMove == "rock" && cs.rtdbData[cs.opponentId].move == "paper")
    ) {
      this.pushWinner(cs.rtdbData[cs.opponentId].fullname);
    }
    if (
      (cs.myMove == "no-move" &&
        cs.rtdbData[cs.opponentId].move == "no-move") ||
      (cs.myMove == "no-move" &&
        cs.rtdbData[cs.opponentId].move == "no-move") ||
      (cs.myMove == "no-move" && cs.rtdbData[cs.opponentId].move == "no-move")
    ) {
      this.pushWinner("draw");
    }
    if (
      (cs.myMove == "scissors" &&
        cs.rtdbData[cs.opponentId].move == "no-move") ||
      (cs.myMove == "paper" && cs.rtdbData[cs.opponentId].move == "no-move") ||
      (cs.myMove == "rock" && cs.rtdbData[cs.opponentId].move == "no-move")
    ) {
      this.pushWinner(cs.fullname);
    }
    if (
      (cs.myMove == "no-move" && cs.rtdbData[cs.opponentId].move == "rock") ||
      (cs.myMove == "no-move" &&
        cs.rtdbData[cs.opponentId].move == "scissors") ||
      (cs.myMove == "no-move" && cs.rtdbData[cs.opponentId].move == "paper")
    ) {
      this.pushWinner(cs.rtdbData[cs.opponentId].fullname);
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
      return i.result == cs.rtdbData[cs.opponentId].fullname;
    });
    return filterUserWins.length / 2;
  },
  checkPlayersStatus() {
    const currentState = this.getState();
    const currentGame = currentState.rtdbData;

    const players = Object.values(currentGame) as any;

    const isAllPlayersOnline = players.every((player: any) => player.online);
    const isAllPlayersReady = players.every((player: any) => player.start);
    const isAllPlayersMove = players.every((player: any) => player.move);

    if (players.length == 2) {
      if (!isAllPlayersOnline) {
        console.log("checkPlayersStatus funciona 2");
        Router.go("/share-code");
      }
      if (
        isAllPlayersOnline &&
        !isAllPlayersReady &&
        !isAllPlayersMove &&
        location.pathname != "/results"
      ) {
        console.log("checkPlayersStatus funciona 3");
        Router.go("/start");
      }
      if (
        isAllPlayersOnline &&
        !isAllPlayersReady &&
        currentState.start == true &&
        location.pathname != "/results"
      ) {
        console.log("checkPlayersStatus funciona 4");
        Router.go("/waiting");
      }
      if (isAllPlayersOnline && isAllPlayersReady && !isAllPlayersMove) {
        console.log("checkPlayersStatus funciona 5");
        Router.go("/countdown");
      }
      if (
        isAllPlayersOnline &&
        isAllPlayersReady &&
        isAllPlayersMove &&
        location.pathname != "/results"
      ) {
        console.log("checkPlayersStatus funciona 6");
        Router.go("/moves");
      }
    }

    if (players.length == 1) {
      console.log("checkPlayersStatus funciona");
      Router.go("/share-code");
    }
  },
};
