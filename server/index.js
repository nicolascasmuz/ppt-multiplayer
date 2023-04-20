"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var db_1 = require("./db");
var nanoid_1 = require("nanoid");
var express = require("express");
var cors = require("cors");
var app = express();
var PORT = 3000;
/* const PORT = process.env.PORT || 3000; */
app.use(express.json());
app.use(cors());
var usersCollection = db_1.firestore.collection("users");
var roomsCollection = db_1.firestore.collection("rooms");
app.post("/auth", function (req, res) {
    var fullname = req.body.fullname;
    usersCollection
        .where("fullname", "==", fullname)
        .get()
        .then(function (searchResponse) {
        if (searchResponse.empty) {
            var fullUserId = (0, nanoid_1.nanoid)();
            var userId_1 = fullUserId.slice(16);
            usersCollection
                .doc(userId_1.toString())
                .set({ fullname: fullname, fullUserId: fullUserId })
                .then(function () {
                res.json({ id: userId_1.toString() });
            });
        }
        else {
            res.json({
                id: searchResponse.docs[0].id
            });
        }
    });
});
app.post("/rooms", function (req, res) {
    var userId = req.body.userId;
    usersCollection
        .doc(userId.toString())
        .get()
        .then(function (doc) {
        if (doc.exists) {
            var roomRef_1 = db_1.rtdb.ref("rooms/" + (0, nanoid_1.nanoid)());
            roomRef_1
                .set({
                owner: userId
            })
                .then(function () {
                var fullRoomId = roomRef_1.key;
                var roomId = fullRoomId.slice(16).toUpperCase();
                roomsCollection
                    .doc(roomId.toString())
                    .set({ rtdbRoomId: fullRoomId })
                    .then(function () {
                    res.json({
                        id: roomId.toString(),
                        fullId: fullRoomId.toString()
                    });
                });
            });
        }
        else {
            res.status(401).json({
                message: "doesn't exist"
            });
        }
    });
});
app.post("/rtdb-data", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rtdbRoomId, userId, fullname, online, start, move, userDataRef, snapshot, numChildren, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                rtdbRoomId = req.body.rtdbRoomId;
                userId = req.body.userId;
                fullname = req.body.fullname;
                online = req.body.online;
                start = req.body.start;
                move = req.body.move;
                userDataRef = db_1.rtdb.ref("rooms/".concat(rtdbRoomId, "/currentGame"));
                return [4 /*yield*/, userDataRef.once("value")];
            case 1:
                snapshot = _a.sent();
                numChildren = snapshot.numChildren();
                data = snapshot.val();
                if (numChildren < 2 || data[userId]) {
                    userDataRef.child(userId).set({
                        fullname: fullname,
                        start: start,
                        online: online,
                        move: move
                    });
                    res.json({ message: "Player data added or updated" });
                }
                else {
                    res.status(403).json({ error: "Room is full" });
                }
                return [2 /*return*/];
        }
    });
}); });
app.post("/history", function (req, res) {
    var rtdbRoomId = req.body.rtdbRoomId;
    var result = req.body.result;
    var historyRef = db_1.rtdb.ref("rooms/".concat(rtdbRoomId, "/history"));
    historyRef.push({ result: result }).then(function (r) { return res.json(r); });
});
app.get("/room/:roomId", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var roomId, roomDoc, roomData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    roomId = req.params.roomId;
                    return [4 /*yield*/, roomsCollection.doc(roomId.toString()).get()];
                case 1:
                    roomDoc = _a.sent();
                    if (!roomDoc.exists) {
                        res.status(404).json({ error: "Room not found" });
                    }
                    else {
                        roomData = roomDoc.data();
                        res.status(200).json({ rtdbRoomId: roomData === null || roomData === void 0 ? void 0 : roomData.rtdbRoomId });
                    }
                    return [2 /*return*/];
            }
        });
    });
});
app["delete"]("/remove-room", function (req, res) {
    var roomId = req.body.roomId;
    roomsCollection
        .doc(roomId.toString())["delete"]()
        .then(function () {
        res.json("Document successfully deleted!");
    })["catch"](function (error) {
        res.json("Error removing document");
    });
});
app["delete"]("/remove-user", function (req, res) {
    var userId = req.body.userId;
    usersCollection
        .doc(userId.toString())["delete"]()
        .then(function () {
        res.json("Document successfully deleted!");
    })["catch"](function (error) {
        res.json("Error removing document");
    });
});
app.listen(PORT, function () {
    console.log("iniciado en http://localhost:".concat(PORT));
});
