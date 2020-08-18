var token = "";
var uid = "";


window.Twitch.ext.onAuthorized(function (auth) {
  token = auth.token;
  uid = auth.userId;

});
function disableButton(){

        $(":button").prop("disabled", true);
        $(".votes-container").html("");
      
}
function updateBlock(payload) {
  let block = JSON.parse(payload);
  $(".votes-container").html("");
  $(".votes-container").append(`<div class="${block.position}"></div>`)
  for(let item in block){
    if(item === "position"){}
    else{
      $(`.${block.position}`).append(`<button id = "${block[item]}" class="button1"></button>`)
    }
  }
  $("button").on("click", function () {

        $.ajax({
          type: "POST",
          url: "http://localhost:8080/control/send-vote",
          contentType:"application/json",
          headers : {
                  Authorization: "Bearer " + token},
          data: JSON.stringify({vote:this.id}),
          success:disableButton,
  })})
  if (block.stop_voting === true) {
    $(".votes-container").html("");
  }
$(function () {
  // listen for incoming broadcast message from our EBS
  window.Twitch.ext.listen("broadcast", function (
    target,
    contentType,
    message
  ) {
    updateBlock(message);
  })
})}
