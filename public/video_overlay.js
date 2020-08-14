jQuery(document).ready(function () {
  const socketAddress = "ws://18.197.111.84:8080";
  const ws = new WebSocket(socketAddress);

  ws.onmessage = function incoming(message) {
    let payload = JSON.parse(message.data);
    console.log(payload);
    if (payload.stop_voting === true) {
      $(".votes-container").html("");
    }
    //
    if (payload.position === "team_votes") {
      $(".votes-container").html("");
      $(".votes-container").append("<div class=team-votes-container></div>");
      delete payload.position;
      for (item in payload) {
        $(".team-votes-container").append(
          `<button id = "${payload[item]}" class="button1"></button>`
        );
      }

      $("button").on("click", function () {
        ws.send(this.id);
        $(this).find(".button1").attr("disabled", "disabled");
        $(".team-votes-container").html("");
      });
      //
    } else if (payload.position === "left_horizontal") {
      $(".votes-container").html("");
      $(".votes-container").append("<div class=left_horizontal></div>");

      delete payload.position;
      for (let item in payload) {
        $(".left_horizontal").append(
          `<button id = "${payload[item]}" class="button2"></button>`
        );
      }

      $("button").on("click", function () {
        ws.send(this.id);
        $(this).find(".button2").attr("disabled", "disabled");
        $(".votes-container").html("");
      });
      //
    } else if (payload.position === "left_vertical") {
      $(".votes-container").html("");
      $(".votes-container").append("<div class=left_vertical></div>");
      delete payload.position;

      for (let item in payload) {
        $(".left_vertical").append(
          `<button id = "${payload[item]}" class="button3" ></button>`
        );
      }
      $("button").on("click", function () {
        ws.send(this.id);
        $(this).find(".button3").attr("disabled", "disabled");
        $(".votes-container").html("");
      });
      //
    } else if (payload.position === "left_vertical_text") {
      $(".votes-container").html("");
      $(".votes-container").append("<div class=left_vertical_text></div>");
      delete payload.position;
      for (let item in payload) {
        $(".left_vertical_text").append(
          `<button id = "${payload[item]}" class="button4"></button>`
        );
      }
      $("button").one("click", function () {
        ws.send(this.id);
        $(":button").prop("disabled", true);
        $(".votes-container").html("");
      });
      //
    } else if (payload.position === "right_horizontal") {
      $(".votes-container").html("");
      $(".votes-container").append("<div class=right_horizontal></div>");
      delete payload.position;
      for (let item in payload) {
        $(".right_horizontal").append(
          `<button id = "${payload[item]}" class="button5"></button>`
        );
      }
      $("button").on("click", function () {
        ws.send(this.id);
        $(this).find(".button5").attr("disabled", "disabled");
        $(".votes-container").html("");
      });
    } else if (payload.hasOwnProperty("mvp_options")) {
      $(".votes-container").html("");
      $(".votes-container").append("<div class=player-votes-container></div>");
      for (let item in payload.mvp_options) {
        $(".player-votes-container").append(
          `<button id = "${payload.mvp_options[item]}" class="button6" ></button>`
        );
      }

      $("button").on("click", function () {
        ws.send(this.id);
        $(this).find(".button6").attr("disabled", "disabled");
        $(".player-votes-container").html("");
      });
    }
    setTimeout(() => {
      $(this).find("button").attr("disabled", "disabled");
      $(".votes-container").html("");
    }, 60000);
  };
});
