/*!
  Script: animat3d.js
    Proprietary 3D Web Engine based on Three.JS

  About: Owner
    Copyright (c) 2022, Valky Fischer
    VALKYTEQ - All rights reserved

  About: License
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:

        * Redistributions of source code must retain the above copyright notice,
          this list of conditions and the following disclaimer.
        * Redistributions in binary form must reproduce the above copyright
          notice, this list of conditions and the following disclaimer in the
          documentation and/or other materials provided with the distribution.

  About: Notice
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
    LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
    CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
    SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
    INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
    CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
    ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
    POSSIBILITY OF SUCH DAMAGE.
*/

console.log(`Animat3D Version       : public@^0.9.7a`);





// ****************************************************************************************************************** //
//                                                 v  FUNCTIONS  v                                                    //
// ****************************************************************************************************************** //

let hash = {};
let err = false;

function readFileHash(file, hash) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                if (MD5(allText) !== hash) {
                    showFancyMessage("MANIPULATION", "Local files manipulated or corrupt!", "error", false)
                    console.log(file, MD5(allText), hash);
                    err = true;
                }
            }
        }
    }
    rawFile.send(null);
}


function showFancyMessage(title, text, level, autohide) {

    var $fancyMessage = $('.fancy-message').removeClass('error success').addClass(level);
    $fancyMessage.find('.fancy-message-title').html(title);
    $fancyMessage.find('.fancy-message-text').html(text);
    $fancyMessage.stop().fadeIn();

    // Hide after a while
    if (autohide) {
        var seconds = 5;
        var tid = $fancyMessage.data('tid');
        if (typeof tid != 'undefined')
            clearTimeout(tid);
        tid = setTimeout(function () {
            $fancyMessage.fadeOut();
        }, seconds * 1000);
        $fancyMessage.data('tid', tid);
    }
}


function lunaUserLogout() {
    resetItemFlag("SRV_TIME");
    resetItemFlag("SRV_SIGN");
    resetItemFlag("USER");
    resetItemFlag("USER_ID");
    resetItemFlag("USER_NAME");
    resetItemFlag("USER_VIP");
    resetItemFlag("USER_COINS");
    resetItemFlag("USER_UNLOCKS");
    resetItemFlag("CHAR_NAME");
    resetItemFlag("CHAR_SET");
    $('#main-wrap').fadeOut();
    $('#login-wrapper').fadeOut();
    setTimeout(function () {
        console.log('exit|logout');
        $('#login-wrapper').fadeIn();
        // window.close();
    }, 400)
}


function lunaUserExit() {
    $('#control-wrap').fadeOut();
    $('#settings-wrap').fadeOut();
    $('#main-wrap').fadeOut();
    $('#login-wrapper').fadeOut();
    setTimeout(function () {
        console.log('exit|close');
        window.close();
    }, 400)
}


function clientFullscreen() {
    let element = document.querySelector("#screen");
    element.requestFullscreen()
        .then(function() {
            console.log('resize|fullscreen');
            // clientScale(screen.height)
        })
        .catch(function(error) {
            console.log('resize|error');
            console.error(error)
        });
}


function clientMaximize() {
    console.log('resize|maximize');
    window.moveTo(0, 0);
    window.resizeTo(screen.width, screen.height);
    // clientScale(screen.height)
}


function clientResize(width, height) {
    console.log(`resize|${width}x${height}`);
    window.resizeTo(width, height);
    window.moveTo(((screen.width - width) / 2), ((screen.height - height) / 2));
    // clientScale(height)
}


function clientScale(height) {
    let scale, top;

    if (height >= 1080) {
        scale = 1;
        // top = 100;
    }
    else {
        scale = height / 1080;
        // top = 100 * (scale / 4);
    }

    let elements = document.getElementsByClassName("wrapper")
    let elArray = [].slice.call(elements, 0);

    elArray.forEach((el) => {
        // el.style.marginTop = `${top}px`
        el.style.transform = `scale(${scale})`;
        el.style['-o-transform'] = `scale(${scale})`;
        el.style['-webkit-transform'] = `scale(${scale})`;
        el.style['-moz-transform'] = `scale(${scale})`;
    })

    console.log(`scale|${scale}`);
}


function clientControls() {
    var windowTopBar = document.getElementById('window-drag')
    windowTopBar.style.webkitAppRegion = "drag"
    var windowClose = document.getElementById('window-close')
    windowClose.innerText = "X"
}





// ****************************************************************************************************************** //
//                                                 v  USERDATA  v                                                     //
// ****************************************************************************************************************** //

function lunaUserInfo(type, dataSave) {
    // API: login user
    function lunaHash() {
        let jsonData = JSON.stringify({
            "s": `${$('#recap').val()}`
        })
        $.ajax({

            url: "https://valkyteq.com:50000/a3dhash",
            dataType: "json",
            type: "POST",
            async: true,
            data: jsonData,

            success: _hashHandler

        });
    }

    // API: login user
    function lunaLogin() {
        let jsonData = JSON.stringify({
            "u": `${$('#login').val()}`,
            "p": `${$('#password').val()}`,
            "s": `${$('#recap').val()}`
        })
        $.ajax({

            url: "https://valkyteq.com:50000/a3dlogin",
            dataType: "json",
            type: "POST",
            async: true,
            data: jsonData,

            success: _loginHandler

        });
    }

    // Hash handler
    function _hashHandler(obj, status, xhr) {
        if (!xhr) {
        }
        if (status !== "success") window.open("https://valkyteq.com/", "_self");
        else {
            if (obj.status !== "success") {
                console.log(obj)
            }
            else {
                for (let file in obj.hash) {
                    readFileHash(file, obj.hash[file])
                }
            }
        }
    }

    // Login handler
    function _loginHandler(obj, status, xhr) {
        if (!xhr) {
        }
        if (status !== "success") window.open("https://valkyteq.com/", "_self");
        else {

            if (obj.status !== "success") {
                // console.log(obj)
                showFancyMessage("CREDENTIALS", "Wrong Username or Password!", "error", true)
                resetItemFlag("USER")
                resetItemFlag("USER_ID")
                resetItemFlag("USER_NAME")
                resetItemFlag("USER_VIP")
                resetItemFlag("USER_COINS")
                resetItemFlag("USER_UNLOCKS")
                resetItemFlag("CHAR_NAME")
                resetItemFlag("CHAR_SET")
                resetItemFlag("SRV_TIME")
                resetItemFlag("SRV_SIGN")
            } else {
                // console.log(obj)
                showFancyMessage("Yay!", "Welcome!", "success", true)
                setItemFlag("USER", obj.acc)
                setItemFlag("USER_ID", obj.acc_id)
                setItemFlag("USER_NAME", obj.acc_name)
                setItemFlag("USER_VIP", obj.vip)
                setItemFlag("USER_COINS", obj.coins)
                setItemFlag("USER_UNLOCKS", obj.unlocks)
                setItemFlag("CHAR_NAME", obj.char_name)
                setItemFlag("CHAR_SET", obj.char_set)
                setItemFlag("SRV_TIME", obj.timestamp)
                setItemFlag("SRV_SIGN", obj.sign)
                $('#login-wrapper').fadeOut();
                setTimeout(function () {
                    $('#main-wrap').fadeIn();
                }, 400)
                // location.href = "./electron.html"
            }

        }
    }

    if (type === "login") {
        lunaLogin();
    }
    else if (type === "hash") {
        lunaHash();
    }

}





// ****************************************************************************************************************** //
//                                                 v  MAIN MENU  v                                                    //
// ****************************************************************************************************************** //

$('#main-lnk-preview').click(function () {
    if (err) { showFancyMessage("MANIPULATION", "Local files manipulated or corrupt!", "error", false) }
    else { location.href = "./preview.html" }
});

$('#main-lnk-editor').click(function () {
    if (err) { showFancyMessage("MANIPULATION", "Local files manipulated or corrupt!", "error", false) }
    else { location.href = "./editor.html" }
});

$('#main-lnk-control').click(function () {
    if (err) { showFancyMessage("MANIPULATION", "Local files manipulated or corrupt!", "error", false) }
    else { location.href = "./control.html" }
});

$('#main-lnk-settings').click(function () {
    $('#main-wrap').fadeOut();
    setTimeout(function () {
        $('#settings-wrap').fadeIn();
        $('#control-wrap').fadeIn();
    }, 400)
});

$('#main-lnk-logout').click(function () {
    lunaUserLogout();
});

$('#main-lnk-exit').click(function () {
    lunaUserExit();
});





// ****************************************************************************************************************** //
//                                                 v  SETTINGS  v                                                   //
// ****************************************************************************************************************** //

$('#settings-lnk-1').click(function () {
    clientFullscreen();
});

$('#settings-lnk-2').click(function () {
    clientMaximize();
});

$('#settings-lnk-3').click(function () {
    clientResize(1920, 1080);
});

$('#settings-lnk-4').click(function () {
    clientResize(1600, 900);
});

$('#settings-lnk-5').click(function () {
    clientResize(2580, 1080);
});

$('#settings-lnk-6').click(function () {
    clientResize(1720, 720);
});





// ****************************************************************************************************************** //
//                                                  v  CONTROLS  v                                                    //
// ****************************************************************************************************************** //

var page = 1,
    moving = false;
var animationIteration = "animationiteration webkitAnimationIteration mozAnimationIteration oAnimationIteration oanimationiteration",
    transitionEnd      = "transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd";
$(".load-more").on("click", function() {
    if ( moving == false ) {
        moving = true;
        $(".load-more").addClass("active");
        setTimeout(function() {
            $(".load-more").one(animationIteration, function() {
                $(".load-more").removeClass("active");
                $(".load-more").one(transitionEnd, function() {
                    page++;
                    moving = false;
                });
            });
        }, 2000);
    }
});

$('#control-wrap').click(function () {
    $('#settings-wrap').fadeOut();
    setTimeout(function () {
        $('#control-wrap').fadeOut();
        $('#main-wrap').fadeIn();
    }, 400)
})

$('#window-close').click(function () {
    lunaUserExit();
});



$('#sign-out').click(function () {
    lunaUserExit();
});

$('#sign-in').click(function() {
    if ($('#notbot').is(":checked")) {
        lunaUserInfo('login');
    }
    else {
        showFancyMessage("BOT CHECK", "Please accept the Checkbox!", "error", true)
    }
});





$('.fancy-message .close-message').click(function() {
    $('.fancy-message').fadeOut();
    return false;
});

$('input').keypress(function(){
    if(event.keyCode==13){
        $('#sign-in').click();
        return false;
    }
});





// ****************************************************************************************************************** //
//                                                  v  DESIGN  v                                                      //
// ****************************************************************************************************************** //


/**
 * SLIDER
 */
var inputRange = document.getElementById('sld-ssaa'),
    maxValue = 100, // the higher the smoother when dragging
    speed = 1,
    currValue, rafID;

// set min/max value
inputRange.min = 0;
inputRange.max = maxValue;

// listen for unlock
function unlockStartHandler() {
    // clear raf if trying again
    window.cancelAnimationFrame(rafID);

    // set to desired value
    currValue = +this.value;
}

function unlockEndHandler() {
    // store current value
    currValue = +this.value;

    // determine if we have reached success or not
    rafID = window.requestAnimationFrame(animateHandler);
}

// handle range animation
function animateHandler() {

    // calculate gradient transition
    var transX = currValue - maxValue;

    // update input range
    inputRange.value = currValue;

    //Change slide thumb color on mouse up
    if (currValue < 20) {
        inputRange.classList.remove('ltpurple');
    }
    if (currValue < 40) {
        inputRange.classList.remove('purple');
    }
    if (currValue < 60) {
        inputRange.classList.remove('pink');
    }

    // determine if we need to continue
    if(currValue > 0 && 20 > currValue) {
        window.requestAnimationFrame(animateHandler);
    }
    else if(currValue > 20 && 40 > currValue) {
        window.requestAnimationFrame(animateHandler);
    }
    else if(currValue > 40 && 60 > currValue) {
        window.requestAnimationFrame(animateHandler);
    }
    else if(currValue > 60 && 80 > currValue) {
        window.requestAnimationFrame(animateHandler);
    }
    else if(currValue > 80 && 100 > currValue) {
        window.requestAnimationFrame(animateHandler);
    }
    else {
        successHandler(currValue)
    }

    // decrement value
    currValue = currValue - speed;
}

// handle successful unlock
function successHandler(currValue) {
    let samples = 0;
    switch (currValue) {
        case 20:
            samples = 2;
            break;
        case 40:
            samples = 4;
            break;
        case 60:
            samples = 6;
            break;
        case 80:
            samples = 8;
            break;
        case 100:
            samples = 16;
            break;
    }

    if (samples !== 0) {
        $('#SSAA').text(`x${samples}`)
    }
    else {
        $('#SSAA').text(`OFF`)
    }
}

// bind events
inputRange.addEventListener('mousedown', unlockStartHandler, false);
inputRange.addEventListener('mousestart', unlockStartHandler, false);
inputRange.addEventListener('mouseup', unlockEndHandler, false);
inputRange.addEventListener('touchend', unlockEndHandler, false);

// move gradient
inputRange.addEventListener('input', function() {
    //Change slide thumb color on way up
    if (this.value > 20) {
        inputRange.classList.add('ltpurple');
    }
    if (this.value > 40) {
        inputRange.classList.add('purple');
    }
    if (this.value > 60) {
        inputRange.classList.add('pink');
    }

    //Change slide thumb color on way down
    if (this.value < 20) {
        inputRange.classList.remove('ltpurple');
    }
    if (this.value < 40) {
        inputRange.classList.remove('purple');
    }
    if (this.value < 60) {
        inputRange.classList.remove('pink');
    }
});





// ****************************************************************************************************************** //
//                                                 v  START UP  v                                                     //
// ****************************************************************************************************************** //

clientControls();
lunaUserInfo("hash");

if (getItemFlag("SRV_SIGN") !== null && getItemFlag("SRV_SIGN").length > 5) {
    // clientScale(document.documentElement.clientHeight);
    $('#login-wrapper').fadeOut();
    setTimeout(function () {
        $('#control-wrap').fadeOut();
        $('#main-wrap').fadeIn();
    }, 400);
}
else {
    // clientScale(document.documentElement.clientHeight);
    $('#control-wrap').fadeOut();
    $('#login-wrapper').fadeIn();
}
