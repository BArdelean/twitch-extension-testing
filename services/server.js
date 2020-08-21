const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { json } = require("express");
const jsonwebtoken = require("jsonwebtoken");
const got = require("got");

class Server {
  constructor(port = 8080) {
    this.serverTokenDurationSec = 30;
    this.bearerPrefix = "Bearer ";
    this.secret = "homAe3Ar/qzPyTJ5iTT8bYO3YJgDVEIQIbfn/Lcb8FY=";
    this.clientId = "08lc1o0s6c3cejh2dtzaq4qaeyq7yd";
    this.ownerID = "35667264";
    this.channel_id = "35667264";
    this.app = null;
    this.client = null;
    this.http = null;
    this.https = null;
    this.viewerVotes = [];
    this.extSecret = Buffer.from(this.secret, "base64");
    this.curentVotingSection = String;
    this.filteredCustomVoteParams = null;
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
    this.channel_id = "35667264";
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
    this.app.use("/", express.static(path.join(__dirname, "../public")));
    this.app.post("/control/set-vote-params", this.onSetVoteParams.bind(this));

    this.app.post(
      "/control/set-player-names",
      this.onSetPlayerNames.bind(this)
    );
    this.app.post("/control/send-vote", this.onIncomingVote.bind(this));
    this.app.get("/vote-results", this.onGetVoteResults.bind(this));

    this.http.listen(port, () => {
      console.log("Server started on port %d", this.http.address().port);
    });
  }

  stop() {
    this.http.close();
  }
  async onIncomingVote(req, res) {
    let viewerVote = JSON.parse(req.body);

    if (this.verifyAndDecode(req.headers.authorization)) {
      this.viewerVotes.push(viewerVote.vote);
    }
    console.log(this.viewerVotes)
    res.sendStatus(200);
  }
  onSetVoteParams(req, res) {

    let data = req.body;
    let voteParams = JSON.parse(data);
    
    if("start_custom" in voteParams.viewer_interaction || "start_mvp" in voteParams.viewer_interaction || "stop_voting" in voteParams.viewer_interaction){
      
    }
    this.setVotes = [];
    if ("custom_options" in voteParams.viewer_interaction) {
      this.setVotingParams.viewer_interaction.custom_options = {
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
      }
      for (let i in this.setVotingParams.viewer_interaction.custom_options) {
        for (let j in voteParams.viewer_interaction.custom_options) {
          if (i === j) {
            this.setVotingParams.viewer_interaction.custom_options[i] =
              voteParams.viewer_interaction.custom_options[j];
          }
        }
      }
      let optionsParam = [];
      for (let item in Object.keys(
        voteParams.viewer_interaction.custom_options
      )) {
        if (
          Object.keys(voteParams.viewer_interaction.custom_options)[
            item
          ].startsWith("option")
        ) {
          optionsParam.push(
            Object.keys(voteParams.viewer_interaction.custom_options)[item]
          );
        }
      }
      optionsParam.forEach((element, index) => {
        this.setVotingParams.viewer_interaction.custom_options[
          "image" + (index + 1)
        ] = element + "_image";
      });
      this.filteredCustomVoteParams = Object.entries(
        voteParams.viewer_interaction.custom_options
      ).reduce((a, [k, v]) => (v ? ((a[k] = v), a) : a), {});
      delete this.filteredCustomVoteParams.question;
    }

    if (voteParams.viewer_interaction.start_custom === true) {
      this.viewerVotes = [];
      this.curentVotingSection = "start_custom";
      this.sendBroadcast(this.filteredCustomVoteParams);
      delete this.filteredCustomVoteParams.position;

      for (let item in this.filteredCustomVoteParams) {
        this.setVotes.push(this.filteredCustomVoteParams[item]);
      }
    } else if (voteParams.viewer_interaction.start_mvp === true) {
      this.viewerVotes = [];
      this.curentVotingSection = "start_mvp";

      this.setVotes = this.playerNames.mvp_options.players;
      this.sendBroadcast(this.setVotes);
    } else if (voteParams.viewer_interaction.stop_voting === true) {
      this.sendBroadcast({ stop_voting: true });
      this.viewerVotes = [];
    } else if(voteParams.viewer_interaction.clear_data === true){
      this.setVotingParams = {}
    }
    res.sendStatus(200);
  }
  onGetVoteResults(req, res) {
    this.calculatePercentages()
    res.json(this.setVotingParams);
    res.end();
  }

  onSetPlayerNames(req, res) {
    let data = req.body;
    this.playerNames = JSON.parse(data);
    this.playerNames.mvp_options.teams.forEach((element, index) =>  {
      if (index < 1) {
        this.setVotingParams.viewer_interaction.mvp_options.team1.team = this.playerNames.mvp_options.teams[index]
      }else {
        this.setVotingParams.viewer_interaction.mvp_options.team2.team = element
      }
    })
    this.playerNames.mvp_options.players.forEach((element, index) =>  {
      if (index <= 4) {
        this.setVotingParams.viewer_interaction.mvp_options.team1["player" + (index + 1)] = element
      }else {
        this.setVotingParams.viewer_interaction.mvp_options.team2["player" + (index - 4)] = element
      }
    })
    res.sendStatus(200);
  }
  verifyAndDecode(header) {
    if (header.startsWith(this.bearerPrefix)) {
      let token = header.substring(this.bearerPrefix.length);
      return jsonwebtoken.verify(token, this.extSecret);
    }
  }
  createServerToken() {
    const payload = {
      exp:
        Math.floor(new Date().getTime() / 1000) + this.serverTokenDurationSec,
      channel_id: this.channel_id,
      user_id: this.ownerID,
      role: "external",
      pubsub_perms: {
        send: ["broadcast"],
      },
    };
    return jsonwebtoken.sign(payload, this.extSecret);
  }
  sendBroadcast(payload) {
    let headers = {
      Authorization: this.bearerPrefix + this.createServerToken(),
      "Client-ID": this.clientId,
      "Content-Type": "application/json",
    };
    let body = JSON.stringify({
      content_type: "application/json",
      message: JSON.stringify(payload),
      targets: ["broadcast"],
    });
    got
      .post(`https://api.twitch.tv/extensions/message/${this.channel_id}`, {
        method: "POST",
        headers,
        body,
      })
      .then((resp) => {
        console.log(resp.statusCode);
      })
      .catch((err) => {
        console.log(err.response.body);
      });
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
        if (this.viewerVotes.length === 0) {
          var percentage = 50;
        } else {
          percentage = (f / this.viewerVotes.length) * 100;
        }
        if (this.curentVotingSection === "start_custom") {
          this.setVotingParams.viewer_interaction.custom_options[
            "option" + (index + 1)
          ] = element;
          this.setVotingParams.viewer_interaction.custom_options[
            "percentage" + (index + 1)
          ] = Number(percentage.toFixed(0));
          this.setVotingParams.viewer_interaction.custom_options[
            "image" + (index + 1)
          ] = "option" + (index + 1) + "_image";
        } else if (this.curentVotingSection === "start_mvp") {
          if (index <= 4) {
            this.setVotingParams.viewer_interaction.mvp_options["team1"][
              "player" + (index + 1)
            ] = element;
            this.setVotingParams.viewer_interaction.mvp_options["team1"][
              "percentage" + (index + 1)
            ] = Number(percentage.toFixed(0));
          } else {
            this.setVotingParams.viewer_interaction.mvp_options["team2"][
              "player" + (index - 4)
            ] = element;
            this.setVotingParams.viewer_interaction.mvp_options["team2"][
              "percentage" + (index - 4)
            ] = Number(percentage.toFixed(0));
          }
        }
      });
    }
  }
}

const server = new Server(8080);
