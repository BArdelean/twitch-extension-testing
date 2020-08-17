var token = "";
var uid = "";


var twitch = window.Twitch.ext;

var requests = {
    set: createRequest('POST', '/control/send-vote')
};

function createRequest(type, method) {

    return {
        type: type,
        url: "http://localhost:8080" + method,
        contentType: 'application/json',
        // dataType: "json",
        // data: JSON.stringify({
        //     vote: this.id
        // })
    }
}

function setAuth(token) {
    Object.keys(requests).forEach((req) => {
        requests[req].headers = {
            'Authorization': 'Bearer ' + token
        }
    });
}
twitch.onAuthorized(function(auth) {
    token = auth.token;
    uid = auth.userId;
    channel = auth.channel_id
    twitch.rig.log('setting auth')
    twitch.rig.log(token, uid, channel)
    
    setAuth(token)
    $.ajax(requests.set)
})

$(function() {
    // listen for incoming broadcast message from our EBS
    twitch.ext.listen('broadcast', function(target, contentType, payload) {
        updateBlock(payload);
        console.log("got it")
    });
});

function updateBlock(payload) {

    // let payload = JSON.parse(message.data);
    console.log(payload)
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

        $("button").on("click", function() {
            $.ajax(requests.set)
            $(this).find(".button1").attr("disabled", "disabled");
            $(".team-votes-container").html("");
        });

    } else if (payload.position === "left_horizontal") {
        $(".votes-container").html("");
        $(".votes-container").append("<div class=left_horizontal></div>");

        delete payload.position;
        for (let item in payload) {
            $(".left_horizontal").append(
                `<button id = "${payload[item]}" class="button2"></button>`
            );
        }

        $("button").on("click", function() {

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
        $("button").on("click", function() {

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
        $("button").one("click", function() {

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
        $("button").on("click", function() {

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

        $("button").on("click", function() {
            $(this).find(".button6").attr("disabled", "disabled");
            $(".player-votes-container").html("");
        });
    }
    setTimeout(() => {
        $(this).find("button").attr("disabled", "disabled");
        $(".votes-container").html("");
    }, 60000);
}