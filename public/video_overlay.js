jQuery(document).ready(function () {
  let twitch = window.Twitch.ext;
  let clientIp = window.location.hostname;
  const socketAddress = "wss://localhost:8080/";
  const ws = new WebSocket(socketAddress);
  let percentage = null;
  setInterval(function () {
    $.get("https://localhost:8080/vote-results", (percentages) => {
      percentage = percentages;
      if (
        Object.keys(percentages.vote_results).length === 0 &&
        percentages === Object
      ) {
      } else {
        $(".perc1").html("");
        $(".perc2").html("");
        $(".perc1").append(percentage.vote_results.slot_1.percentages + "%");
        $(".perc2").append(percentage.vote_results.slot_2.percentages + "%");
        $(".thank-you").html("");
        for (let i in percentage.vote_results) {
          $(".thank-you").append(
            `<span> ${percentage.vote_results[i].name} - ${percentage.vote_results[i].percentages}% </span>`
          );
        }
      }
    });

    ws.onmessage = function incoming(message) {
      let theMessage = JSON.parse(message.data);
      if (theMessage.stop_voting === true) {
        $(".team-votes-container").html("");
      }

      if (theMessage.team_votes === true) {
        $(".team-votes-container").html("");
        $(".team-votes-container").append("<div class=btn-container1></div>");
        $(".team-votes-container").append(
          "<div class=percentage-container><span class=perc1></span><span class=perc2></span></div>"
        );
        for (let i in theMessage.twitch_commands) {
          for (let j in theMessage.twitch_commands[i]) {
            $(".btn-container1").append(
              `<button id = "${theMessage.twitch_commands[i][j].name}" class="button1" onClick = clickReply(this.id)></button>`
            );
          }
        }

        $("button").one("click", function () {
          $(this).find(".button1").attr("disabled", "disabled");
          $(".btn-container1").html("");
        });
      } else if (theMessage.individual_votes === true) {
        $(".team-votes-container").html("");
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
            $(".btn-container2").append(
              `<button id = "${theMessage.twitch_commands[i][j].name}" class="button2" onClick = clickReply(this.id)>${theMessage.twitch_commands[i][j].name}</button>`
            );
          }
        }

        $("button").one("click", function () {
          $(this).find(".button2").attr("disabled", "disabled");
          // $(this).find(".thank-you").attr("enabled", "enabled");
          $(".individual-votes-container").html("");
          $(".individual-votes-container").append(
            `<div class=thank-you>Thank you for voting!</div>`
          );
        });
      }
    };
    clickReply = (clicked_id) => {
      ws.send(clicked_id);
    };
  }, 1000);
});
