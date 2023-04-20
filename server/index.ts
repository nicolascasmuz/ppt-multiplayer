import { firestore, rtdb } from "./db";
import { nanoid } from "nanoid";
import * as express from "express";
import * as process from "process";
import * as cors from "cors";
import * as path from "path";

const app = express();
const PORT = 3000;
/* const PORT = process.env.PORT || 3000; */

app.use(express.json());
app.use(cors());

const usersCollection = firestore.collection("users");
const roomsCollection = firestore.collection("rooms");

app.post("/auth", (req, res) => {
  const { fullname } = req.body;

  usersCollection
    .where("fullname", "==", fullname)
    .get()
    .then((searchResponse) => {
      if (searchResponse.empty) {
        const fullUserId = nanoid();
        const userId = fullUserId.slice(16);
        usersCollection
          .doc(userId.toString())
          .set({ fullname: fullname, fullUserId: fullUserId })
          .then(() => {
            res.json({ id: userId.toString() });
          });
      } else {
        res.json({
          id: searchResponse.docs[0].id,
        });
      }
    });
});

app.post("/rooms", (req, res) => {
  const { userId } = req.body;

  usersCollection
    .doc(userId.toString())
    .get()
    .then((doc) => {
      if (doc.exists) {
        const roomRef = rtdb.ref("rooms/" + nanoid());
        roomRef
          .set({
            owner: userId,
          })
          .then(() => {
            const fullRoomId = roomRef.key;
            const roomId = fullRoomId.slice(16).toUpperCase();
            roomsCollection
              .doc(roomId.toString())
              .set({ rtdbRoomId: fullRoomId })
              .then(() => {
                res.json({
                  id: roomId.toString(),
                  fullId: fullRoomId.toString(),
                });
              });
          });
      } else {
        res.status(401).json({
          message: "doesn't exist",
        });
      }
    });
});

app.post("/rtdb-data", async (req, res) => {
  const { rtdbRoomId } = req.body;
  const { userId } = req.body;
  const { fullname } = req.body;
  const { online } = req.body;
  const { start } = req.body;
  const { move } = req.body;

  const userDataRef = rtdb.ref(`rooms/${rtdbRoomId}/currentGame`);

  const snapshot = await userDataRef.once("value");

  const numChildren = snapshot.numChildren();
  const data = snapshot.val();

  if (numChildren < 2 || data[userId as string]) {
    userDataRef.child(userId as string).set({
      fullname: fullname,
      start: start,
      online: online,
      move: move,
    });

    res.json({ message: "Player data added or updated" });
  } else {
    res.status(403).json({ error: "Room is full" });
  }
});

app.post("/history", (req, res) => {
  const { rtdbRoomId } = req.body;
  const { result } = req.body;

  const historyRef = rtdb.ref(`rooms/${rtdbRoomId}/history`);

  historyRef.push({ result: result }).then((r) => res.json(r));
});

app.get("/room/:roomId", async function (req, res) {
  const { roomId } = req.params;

  const roomDoc = await roomsCollection.doc(roomId.toString()).get();

  if (!roomDoc.exists) {
    res.status(404).json({ error: "Room not found" });
  } else {
    const roomData = roomDoc.data();

    res.status(200).json({ rtdbRoomId: roomData?.rtdbRoomId });
  }
});

app.delete("/remove-room", (req, res) => {
  const { roomId } = req.body;

  roomsCollection
    .doc(roomId.toString())
    .delete()
    .then(() => {
      res.json("Document successfully deleted!");
    })
    .catch((error) => {
      res.json("Error removing document");
    });
});

app.delete("/remove-user", (req, res) => {
  const { userId } = req.body;

  usersCollection
    .doc(userId.toString())
    .delete()
    .then(() => {
      res.json("Document successfully deleted!");
    })
    .catch((error) => {
      res.json("Error removing document");
    });
});

app.listen(PORT, () => {
  console.log(`iniciado en http://localhost:${PORT}`);
});
