const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { json } = require("express");
const jsonwebtoken = require('jsonwebtoken')
const request = require('request')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

class Server {
  constructor(port = 8080) {
    this.serverTokenDurationSec = 30
    this.bearerPrefix = 'Bearer ';
    this.secret = 'xPAxcyCsX8QkYHTo4HtGWJfy3MSkfBFD6l5DNfDVNjY='
    this.clientId = 'uxmajdvtdy870ig106jnk04jg6e50y'
    this.ownerID = '35667264'
    this.app = null;
    this.client = null;
    this.http = null;
    this.https = null;
    this.viewerVotes = [];
    this.extSecret = Buffer.from(this.secret, 'base64')
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
    this.channel_id = '35667264'
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
    this.app.post('/control/send-vote', this.onIncomingVote.bind(this));
    this.app.get("/vote-results", this.onGetVoteResults.bind(this));

    this.http.listen(port, () => {
      console.log("Server started on port %d", this.http.address().port);
    });
    console.log(this.secret)
    console.log(this.extSecret)
  }
  

  stop() {
    this.ws.close();
    this.http.close();
  }
  onIncomingVote(req, res){
    this.verifyAndDecode(req.headers.authorization);
    let payload = JSON.parse(req.body)
    this.viewerVotes.push(payload.vote);
    res.sendStatus(200)
  }
  onSetVoteParams(req, res) {
    let data = req.body;
    let voteParams = JSON.parse(data);
    this.setVotes = [];
    if ("custom_options" in voteParams.viewer_interaction) {
      this.setVotingParams.viewer_interaction.custom_options =
        voteParams.viewer_interaction.custom_options;
      this.filteredVoteParams = Object.entries(
        voteParams.viewer_interaction.custom_options
      ).reduce((a, [k, v]) => (v ? ((a[k] = v), a) : a), {});
      delete this.filteredVoteParams.question;
    }
    if (voteParams.viewer_interaction.start_custom === true) {
      this.sendBroadcast(JSON.stringify(this.filteredVoteParams));
      // this.ws.broadcast(JSON.stringify(this.filteredVoteParams));
      delete this.filteredVoteParams.position;

      for (let item in this.filteredVoteParams) {
        this.setVotes.push(this.filteredVoteParams[item]);
      }
      console.log(this.setVotes);
    } else if (voteParams.viewer_interaction.start_mvp === true) {
      this.sendBroadcast(this.channel_id, JSON.stringify(this.playerNames));
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
    res.sendStatus(200);
  }
   verifyAndDecode(header){

    console.log(this.secret)
    console.log(this.extSecret)
    if (header.startsWith(this.bearerPrefix)) {
      
        let token = header.substring(this.bearerPrefix.length);
        console.log(token)
        return jsonwebtoken.verify(token, this.extSecret);
    }}
    makeServerToken() {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + this.serverTokenDurationSec,
    channel_id: this.channel_id,
    user_id: this.ownerId, // extension owner ID for the call to Twitch PubSub
    role: 'external',
    pubsub_perms: {
      send: ['*'],
    },
  };
  console.log(jsonwebtoken.sign(payload, this.secret, { algorithm: 'HS256' }))
  return jsonwebtoken.sign(payload, this.secret, { algorithm: 'HS256' });
}
sendBroadcast(payload){
  const headers = {
    'Client-ID': this.clientId,
    'Content-Type': 'application/json',
    'Authorization': this.bearerPrefix + this.makeServerToken(),
  };
  
  
  // Create the POST body for the Twitch API request.
  const body = JSON.stringify({
    content_type: 'application/json',
    message: payload,
    targets: ['broadcast'],
  });
console.log(body)
  // Send the broadcast request to the Twitch API.
  request(
    `https://api.twitch.tv/extensions/message/${this.channel_id}`,
    {
      method: 'POST',
      headers,
      body,
    })
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
