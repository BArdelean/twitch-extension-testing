jQuery(document).ready(function () {
  let twitch = window.Twitch.ext;
  let clientIp = window.location.hostname;
  const socketAddress = "wss://" + clientIp + ":8080";
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
    $(".background-image").html("");
    $(".background-image").append("<div class=btn-container></div>");
    for (let i in theMessage.twitch_commands) {
      for (let j in theMessage.twitch_commands[i]) {
        console.log(theMessage.twitch_commands[i][j].name);
        $(".btn-container").append(
          `<button id = "${theMessage.twitch_commands[i][j].name}" onClick = clickReply(this.id)></button>`
        );
      }
    }
    $("button").one("click", function () {
      $(this).find("button").attr("disabled", "disabled");
      $(".background-image").html("");
    });
  };

  clickReply = (clicked_id) => {
    ws.send(clicked_id);
  };
});
