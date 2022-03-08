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

console.log(`Animat3D Version       : public@^0.9.6c`);

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

// ****************************************************************************************************************** //
//                                                 v  USERDATA  v                                                     //
// ****************************************************************************************************************** //

// resetItemFlag("SRV_SIGN");
lunaUserInfo("hash");

if (getItemFlag("SRV_SIGN").length > 5) {
    $('#login-wrap').hide();
    $('#main').fadeIn();
}
else {
    $('#login-wrap').fadeIn();
}

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
                $('#login-wrap').fadeOut();
                $('#main').fadeIn();
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







$('#main-lnk-preview').click(function () {
    if (err) { showFancyMessage("MANIPULATION", "Local files manipulated or corrupt!", "error", false) }
    else { location.href = "./preview.html" }
});

$('#main-lnk-editor').click(function () {
    if (err) { showFancyMessage("MANIPULATION", "Local files manipulated or corrupt!", "error", false) }
    else { location.href = "./editor.html" }
});

$('.submit').click(function() {
    if ($('#notbot').is(":checked")) {
        lunaUserInfo('login');
        var $this = $(this);
        if ($this.hasClass('processing'))
            return false;
        $this.parents('form').submit();
        $this.addClass('processing');
    }
    else {
        showFancyMessage("BOT CHECK", "Please accept the Checkbox!", "error", true)
    }
});

$('input').keypress(function(){
    if(event.keyCode==13){
        $(this).parents('form').submit();
        return false;
    }
});

$('.fancy-message .close-message').click(function() {
    $('.fancy-message').fadeOut();
    return false;
});

$('input').keyup(function(){
    $('.fancy-message').fadeOut();
    $('.row.error').removeClass('error');
});

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


