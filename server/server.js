require("dotenv").config();
const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");
const http = require("http");
const { initDB, Vessel } = require("./database");

const API_KEY = process.env.AIS_API_KEY;

const MMSI_LIST = [
  "255802490",
  "211482350",
  "636015034",
  "636018051",
  "636017782",
  "636017781",
  "636017197",
  "565967000",
  "538005057",
  "477552400",
  "255802490",
  "636020776",
];

const app = express();
app.use(cors());
const server = http.createServer(app);

initDB()
  .then(() => console.log("Database initialized"))
  .catch((err) => console.error("Database initialization failed:", err));

const wss = new WebSocket.Server({ server });

function broadcastToClients(message) {
  if (wss.clients.size === 0) {
    console.log("No WebSocket clients connected, skipping broadcast");
    return;
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log("Broadcasted message to all WebSocket clients");
}

let aisSocket;

function connectAisStream() {
  aisSocket = new WebSocket("wss://stream.aisstream.io/v0/stream");

  aisSocket.on("open", () => {
    console.log("Connected to aisstream.io");
    const subscriptionMessage = {
      APIKey: API_KEY,
      BoundingBoxes: [
        [
          [-90, -180],
          [90, 180],
        ],
      ],
      FiltersShipMMSI: MMSI_LIST,
      FilterMessageTypes: ["PositionReport"],
    };
    aisSocket.send(JSON.stringify(subscriptionMessage));
    console.log("Sent subscription message to aisstream.io");
  });

  aisSocket.on("message", async (data) => {
    const message = data.toString("utf8");
    console.log("Отправляемое сообщение клиенту:", message);
    try {
      const parsed = JSON.parse(message);
      const receivedMMSI = parsed.MetaData?.MMSI?.toString();

      broadcastToClients(message);

      if (
        parsed.MessageType === "PositionReport" &&
        receivedMMSI &&
        MMSI_LIST.includes(receivedMMSI)
      ) {
        await Vessel.upsert(
          { mmsi: receivedMMSI, rawData: JSON.stringify(parsed) },
          { returning: true }
        );
        console.log(`Data for MMSI ${receivedMMSI} saved to DB`);
      }
    } catch (err) {
      console.error("Error processing aisstream.io message:", err);
    }
  });

  aisSocket.on("close", (code, reason) => {
    console.log(
      `Connection to aisstream.io closed (code: ${code}, reason: ${reason}). Reconnecting in 3 seconds...`
    );
    setTimeout(connectAisStream, 3000);
  });

  aisSocket.on("error", (error) => {
    console.error("aisstream.io error:", error);
    aisSocket.close();
  });
}

wss.on("connection", (ws) => {
  if (!aisSocket) {
    connectAisStream();
  }
  console.log("A WebSocket client connected");

  ws.on("close", () => console.log("A WebSocket client disconnected"));
  ws.on("error", (error) => console.error("WebSocket client error:", error));
});

app.get("/api/vessels/:mmsi", async (req, res) => {
  const { mmsi } = req.params;

  try {
    const vessel = await Vessel.findOne({ where: { mmsi } });

    if (vessel && vessel.rawData) {
      const parsedData = JSON.parse(vessel.rawData);
      return res.json(parsedData);
    } else {
      return res.status(404).json({ error: "No data found for this MMSI" });
    }
  } catch (error) {
    console.error("Error fetching vessel data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

app.get("/dump-db", (req, res) => {
  // 🔐 Проверь простой секрет для защиты
  const secret = req.query.secret;
  if (secret !== process.env.DUMP_SECRET) {
    return res.status(403).send("Forbidden");
  }

  const dumpFile = path.join("/tmp", "render.dump");

  // Выполняем pg_dump
  const dumpCommand = `pg_dump "${process.env.DATABASE_URL}" -Fc -f ${dumpFile}`;

  exec(dumpCommand, (error) => {
    if (error) {
      console.error("Error executing pg_dump:", error);
      return res.status(500).send("Error creating dump");
    }

    // Отправляем дамп-файл клиенту
    res.download(dumpFile, "render.dump", (err) => {
      if (err) {
        console.error("Error sending dump file:", err);
        res.status(500).send("Error sending dump");
      }

      // Удаляем дамп после отправки
      fs.unlinkSync(dumpFile);
    });
  });
});
