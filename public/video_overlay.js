jQuery(document).ready(function () {
  let twitch = window.Twitch.ext;
  let clientIp = window.location.hostname;
  const socketAddress = "ws://" + clientIp + ":8080";
  const ws = new WebSocket(socketAddress);
  //   ws.onopen = () => {
  //     twitch.onAuthorized(function (auth) {
  //       // save our credentials
  //       token = auth.token;
  //       tuid = auth.userId;
  //     });
  //     ws.send(token);
  //   };

  ws.onmessage = function incoming(message) {
    let theMessage = JSON.parse(message.data);
    console.log(theMessage);
    if (theMessage.team_votes === true) {
      $(".team-votes-container").html("");
      $(".team-votes-container").append("<div class=btn-container1></div>");
      for (let i in theMessage.twitch_commands) {
        for (let j in theMessage.twitch_commands[i]) {
          console.log(theMessage.twitch_commands[i][j].name);
          $(".btn-container1").append(
            `<button id = "${theMessage.twitch_commands[i][j].name}" class="button1" onClick = clickReply(this.id)></button>`
          );
        }
      }
      $("button").one("click", function () {
        $(this).find(".button1").attr("disabled", "disabled");
        $(".team-votes-container").html("");
      });
    } else if (theMessage.individual_votes === true) {
      $(".team-votes-container").append(
        "<div class=individual-votes-container></div>"
      );
      $(".individual-votes-container").html("");
      $(".individual-votes-container").append(
        "<div class=btn-container2></div>"
      );
      $(".btn-container2").append(
        `<span class=category>Vote for your favorite ${Object.keys(
          theMessage.twitch_commands
        )}!</span><br>`
      );
      for (let i in theMessage.twitch_commands) {
        for (let j in theMessage.twitch_commands[i]) {
          console.log(theMessage.twitch_commands[i][j].name);
          $(".btn-container2").append(
            `<button id = "${theMessage.twitch_commands[i][j].name}" class="button2" onClick = clickReply(this.id)>${theMessage.twitch_commands[i][j].name}</button>`
          );
        }
      }
      $("button").one("click", function () {
        $(this).find(".button2").attr("disabled", "disabled");
        $(".individual-votes-container").html("");
        $(".individual-votes-container").append(
          `<span class=thank-you>Thank you for voting!</span>`
        );
      });
    }
  };

  clickReply = (clicked_id) => {
    ws.send(clicked_id);
    // ws.close();
  };
});
