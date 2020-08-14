const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { json } = require("express");

class Server {
  constructor(port = 8080) {
    this.app = null;
    this.client = null;
    this.http = null;
    this.https = null;
    this.viewerVotes = [];
    this.curentVotingSection = null;
    this.filteredVoteParams = null;
    this.setVotingParams = {
      viewer_interaction: {
        custom_options: {
          question: "",
          position: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          image1: "",
          image2: "",
          image3: "",
          image4: "",
          percentage1: "",
          percentage2: "",
          percentage3: "",
          percentage4: "",
        },
        mvp_options: {
          team1: {
            team: "",
            player1: "",
            player2: "",
            player3: "",
            player4: "",
            player5: "",
            percentage1: "",
            percentage2: "",
            percentage3: "",
            percentage4: "",
            percentage5: "",
          },
          team2: {
            team: "",
            player1: "",
            player2: "",
            player3: "",
            player4: "",
            player5: "",
            percentage1: "",
            percentage2: "",
            percentage3: "",
            percentage4: "",
            percentage5: "",
          },
        },
      },
    };

    this.playerNames = null;
    this.createServers(port);
  }

  createServers(port) {
    this.app = express();
    this.app.use(
      bodyParser.raw({
        type: "application/json",
      })
    );
    var options = {
      key: fs.readFileSync("client-key.pem"),
      cert: fs.readFileSync("client-cert.pem"),
    };
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
    this.app.use("/", express.static(path.join(__dirname, "../public")));
    this.ws.on("connection", this.onWSConnect.bind(this));
    this.app.post("/control/set-vote-params", this.onSetVoteParams.bind(this));
    this.app.post(
      "/control/set-player-names",
      this.onSetPlayerNames.bind(this)
    );
    this.app.get("/vote-results", this.onGetVoteResults.bind(this));

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
    // this.setVotingParams.viewer_interaction.custom_options =
    //   voteParams.viewer_interaction.custom_options;
    // this.filteredVoteParams = Object.entries(
    //   voteParams.viewer_interaction.custom_options
    // ).reduce((a, [k, v]) => (v ? ((a[k] = v), a) : a), {});
    if ("custom_options" in voteParams.viewer_interaction) {
      this.setVotingParams.viewer_interaction.custom_options =
        voteParams.viewer_interaction.custom_options;
      this.filteredVoteParams = Object.entries(
        voteParams.viewer_interaction.custom_options
      ).reduce((a, [k, v]) => (v ? ((a[k] = v), a) : a), {});
      delete this.filteredVoteParams.question;
    }
    console.log(this.filteredVoteParams);
    console.log(voteParams);
    if (voteParams.viewer_interaction.start_custom === true) {
      this.ws.broadcast(JSON.stringify(this.filteredVoteParams));
      delete this.filteredVoteParams.position;

      for (let item in this.filteredVoteParams) {
        this.setVotes.push(this.filteredVoteParams[item]);
      }
      console.log(this.setVotes);
    } else if (voteParams.viewer_interaction.start_mvp === true) {
      this.ws.broadcast(JSON.stringify(this.playerNames));
    } else if (voteParams.viewer_interaction.stop_voting === true) {
      this.ws.broadcast(JSON.stringify({ stop_voting: true }));
      this.viewerVotes = [];
    }
    res.sendStatus(200);
  }
  onGetVoteResults(req, res) {
    res.json(this.calculatePercentages());
    res.end();
  }

  onSetPlayerNames(req, res) {
    let data = req.body;
    this.playerNames = JSON.parse(data);
    console.log(this.playerNames);
    res.sendStatus(200);
  }

  calculatePercentages() {
    if (this.viewerVotes.length >= 1) {
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
        this.setVotingParams.viewer_interaction.custom_options[
          "option" + (index + 1)
        ] = element;
        this.setVotingParams.viewer_interaction.custom_options[
          "percentage" + (index + 1)
        ] = Number(percentage.toFixed(0));
        this.setVotingParams.viewer_interaction.custom_options[
          "image" + (index + 1)
        ] = "option" + (index + 1) + "_image";
      });
    }
    return this.setVotingParams;
  }

  onWSConnect(connection, req) {
    connection.on("error", (e) => {
      console.log("connection error: ", e.code);
    });
    connection.on("message", (payload) => {
      console.log(`${payload}`);

      this.viewerVotes.push(payload);
      console.log(this.viewerVotes);
    });
  }
}

const server = new Server(8080);
