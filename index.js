jQuery(document).ready(function () {
  clientIp = window.location.hostname;

  const socketAddress = `ws://` + clientIp + `:8080`;
  const ws = new WebSocket(socketAddress);

  ws.onmessage = function incoming(message) {
    let theMessage = JSON.parse(message.data);
    $(".btn-container").html("");
    $(".category").append(
      `Vote for your favorite ${Object.keys(theMessage.twitch_commands)}!`
    );
    for (let i in theMessage.twitch_commands) {
      for (let j in theMessage.twitch_commands[i]) {
        console.log(theMessage.twitch_commands[i][j].name);
        $(".btn-container").append(
          `<button id = "${theMessage.twitch_commands[i][j].name}" onClick = clickReply(this.id)>${theMessage.twitch_commands[i][j].name}</button>`
        );
      }
    }
  };
  clickReply = (clicked_id) => {
    ws.send(clicked_id);
  };
});
