var token = "";
var uid = "";

// var requests = {
//   set: createRequest("POST", "/control/send-vote"),
// };
// console.log(requests);
// function createRequest(type, method) {
//   return {
//     type: type,
//     url: "http://localhost:8080" + method,
//     contentType: "application/json",
//     dataType: "json",
//     data: { vote: this.id },
//   };
// }

function setAuth(token) {
  Object.keys(requests).forEach((req) => {
    requests[req].headers = {
      Authorization: "Bearer " + token,
    };
  });
}
window.Twitch.ext.onAuthorized(function (auth) {
  token = auth.token;
  uid = auth.userId;

  setAuth(token);
  //   $.ajax(requests.set);
});

function updateBlock(payload) {
  let block = JSON.parse(payload);
  if (block.stop_voting === true) {
    $(".votes-container").html("");
  }
  //
  if (block.position === "team_votes") {
    console.log("here aswell");
    $(".votes-container").html("");
    $(".votes-container").append("<div class=team-votes-container></div>");
    delete block.position;
    for (item in block) {
      $(".team-votes-container").append(
        `<button id = "${block[item]}" class="button"></button>`
      );
    }

    $("button").on("click", function () {
      console.log($.ajax(requests.set));
      $.ajax({
        type: "POST",
        url: "http://localhost:8080" + method,
        contentType: "application/json",
        dataType: "json",
        data: { vote: this.id },
      });
      $(this).find(".button1").attr("disabled", "disabled");
      $(".team-votes-container").html("");
    });
  } else if (block.position === "left_horizontal") {
    $(".votes-container").html("");
    $(".votes-container").append("<div class=left_horizontal></div>");

    delete block.position;
    for (let item in block) {
      $(".left_horizontal").append(
        `<button id = "${block[item]}" class="button2"></button>`
      );
    }

    $("button").on("click", function () {
      $(this).find(".button2").attr("disabled", "disabled");
      $(".votes-container").html("");
    });
    //
  } else if (block.position === "left_vertical") {
    $(".votes-container").html("");
    $(".votes-container").append("<div class=left_vertical></div>");
    delete block.position;

    for (let item in block) {
      $(".left_vertical").append(
        `<button id = "${block[item]}" class="button3" ></button>`
      );
    }
    $("button").on("click", function () {
      $(this).find(".button3").attr("disabled", "disabled");
      $(".votes-container").html("");
    });
    //
  } else if (block.position === "left_vertical_text") {
    $(".votes-container").html("");
    $(".votes-container").append("<div class=left_vertical_text></div>");
    delete block.position;
    for (let item in block) {
      $(".left_vertical_text").append(
        `<button id = "${block[item]}" class="button4"></button>`
      );
    }
    $("button").one("click", function () {
      $(":button").prop("disabled", true);
      $(".votes-container").html("");
    });
    //
  } else if (block.position === "right_horizontal") {
    $(".votes-container").html("");
    $(".votes-container").append("<div class=right_horizontal></div>");
    delete block.position;
    for (let item in block) {
      $(".right_horizontal").append(
        `<button id = "${block[item]}" class="button5"></button>`
      );
    }
    $("button").on("click", function () {
      $(this).find(".button5").attr("disabled", "disabled");
      $(".votes-container").html("");
    });
  } else if (block.hasOwnProperty("mvp_options")) {
    $(".votes-container").html("");
    $(".votes-container").append("<div class=player-votes-container></div>");
    for (let item in block.mvp_options) {
      $(".player-votes-container").append(
        `<button id = "${block.mvp_options[item]}" class="button6" ></button>`
      );
    }

    $("button").on("click", function () {
      $(this).find(".button6").attr("disabled", "disabled");
      $(".player-votes-container").html("");
    });
  }
  setTimeout(() => {
    $(this).find("button").attr("disabled", "disabled");
    $(".votes-container").html("");
  }, 60000);
}
$(function () {
  // listen for incoming broadcast message from our EBS
  window.Twitch.ext.listen("broadcast", function (
    target,
    contentType,
    message
  ) {
    updateBlock(message);
  });
});
