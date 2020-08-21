// Create variables for token
var token = "";

// Check if user is authorized
window.Twitch.ext.onAuthorized(function (auth) {
  token = auth.token;
  uid = auth.userId;
});

// Disable the buttons
function changeBorder() {
  $(":button").prop("disabled", true);
}

// Update the block with data recieved from pubsub
function updateBlock(payload) {
  
  $(".votes-container").html("");
  let block = JSON.parse(payload);
  if (!block.position) {
    $(".votes-container").append(
      '<div class="team1"></div><div class="team2"></div>'
    );  
    for (let player in block) {
      if (player <= 4) {
        $(".team1").append(
          `<button id = "${block[player]}" class="team1_button"></button>`
        );
      } else {
        $(".team2").append(
          `<button id = "${block[player]}" class="team2_button"></button>`
        );
      }
    }
  } else {
    if(block.position){
      $(".votes-container").append(
        `<div class="${block.position}"></div>`
      );
    for (let item in block) {
      if (item === "position") {
      } else {
        $(`.${block.position}`).append(
          `<button id = "${block[item]}" class="${block.position}_button"></button>`
        );
      }
    }
  }}
  $("button").on("click", function () {
    $(this).addClass("clicked")
    $("button").not(this).addClass("disabled")
    $.ajax({
      type: "POST",
      url: "http://localhost:8080/control/send-vote",
      contentType: "application/json",
      headers: {
        Authorization: "Bearer " + token,
      },
      data: JSON.stringify({ vote: this.id }),
      success: changeBorder,
    });
  });

//  Clear HTML if stop_voting is triggered
  if (block.stop_voting === true) {
    $(".votes-container").html("");
  }
}
$(function () {
  // listen for incoming broadcast message from backend for curent channel
  window.Twitch.ext.listen("broadcast", function (
    target,
    contentType,
    message
  ) {
    updateBlock(message);
  });
});
