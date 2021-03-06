const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");

class Server {
  constructor(port = 8080) {
    this.app = null;
    this.client = null;
    this.http = null;
    this.viewerVotes = [];
    this.createServers(port);
  }

  createServers(port) {
    this.app = express();
    this.app.use(
      bodyParser.raw({
        type: "application/json",
      })
    );

    this.app.use(cors());
    this.http = http.createServer(this.app);
    this.ws = new WebSocket.Server({ server: this.http });
    this.ws.broadcast = (data) => {
      this.ws.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    };

    this.ws.on("connection", this.onWSConnect.bind(this));
    this.app.post("/control/set-vote-params", this.onSetVoteParams.bind(this));
    this.app.get("/vote-results", this.onGetVoteResults.bind(this));
    this.app.use("/", express.static(__dirname));
    this.http.listen(port, () => {
      console.log("Server started on port %d", this.http.address().port);
    });
  }

  stop() {
    this.ws.close();
    this.http.close();
  }
  onSetVoteParams(req, res) {
    let data = req.body;
    let voteParams = JSON.parse(data);
    this.setVotes = [];
    this.ws.broadcast(JSON.stringify(voteParams));
    for (let i in voteParams.twitch_commands) {
      for (let j in voteParams.twitch_commands[i]) {
        this.setVotes.push(voteParams.twitch_commands[i][j].name);
      }
    }
    res.sendStatus(200);
  }
  onGetVoteResults(req, res) {
    this.calculatePercentages();
    console.log(this.voteResults);
    res.end();
  }
  calculatePercentages() {
    this.voteResults = { vote_results: {} };
    if (this.viewerVotes.length >= 2) {
      this.setVotes.forEach((element, index) => {
        let f = 0;
        for (let i in this.viewerVotes) {
          if (this.viewerVotes[i] === element) {
            f++;
          }
        }
        console.log(f);
        if (this.viewerVotes.length === 0) {
          var percentage = 50;
        } else {
          percentage = (f / this.viewerVotes.length) * 100;
        }
        console.log(percentage);
        this.voteResults.vote_results["slot_" + (index + 1)] = {
          name: element,
          command: "",
          percentages: Number(percentage.toFixed(0)),
        };
      });
    }
  }

  onWSConnect(connection, req) {
    connection.on("error", (e) => {
      console.log("connection error: ", e.code);
    });
    connection.on("message", (payload) => {
      console.log(`Payload ${payload}`);
      this.viewerVotes.push(payload);
      console.log(this.viewerVotes);
    });
  }
}

const server = new Server(8080);
