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
            messages: [],
            owner: userId,
          })
          .then(() => {
            const fullRoomId = roomRef.key;
            const roomId = fullRoomId.slice(16);
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

app.get("/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;

  roomsCollection
    .doc(roomId)
    .get()
    .then((snap) => {
      const data = snap.data();
      res.json(data);
    });
});

app.get("/room/:roomId", (req, res) => {
  const { roomId } = req.params;

  roomsCollection
    .doc(roomId.toString())
    .get()
    .then((roomData) => {
      const data = roomData.data();
      res.json(data);
    });
});

app.post("/rtdb-data", (req, res) => {
  const { rtdbRoomId } = req.body;
  const { userId } = req.body;
  const { fullname } = req.body;
  const { state } = req.body;

  const roomMessagesRef = rtdb.ref(`rooms/${rtdbRoomId}/currentGame/${userId}`);

  roomMessagesRef
    .set({ fullname: fullname, online: state })
    .then((r) => res.json(r));
});

app.get("/rtdb-data/:roomId", (req, res) => {
  const { roomId } = req.params;

  roomsCollection
    .doc(roomId.toString())
    .get()
    .then((roomData) => {
      const data = roomData.data();
      res.json(data);
    });
});

app.delete("/deleteroom", (req, res) => {
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

app.delete("/deleteuser", (req, res) => {
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
