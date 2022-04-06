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


function showFrame(frame) {
    setItemFlag("FRAME", frame);
    $('#main-wrap').fadeOut();
    $('#login-wrapper').fadeOut();
    setTimeout(function () {
        $('#frame-wrap').fadeIn();
        $('#control-wrap').fadeIn();
        $("#frame").attr("src", `./frame.html`);
    }, 400)
}


function lunaUserLogout() {
    lunaUserClear();
    $('#main-wrap').fadeOut();
    $('#login-wrapper').fadeOut();
    setTimeout(function () {
        console.log('exit|logout');
        $('#login-wrapper').fadeIn();
        // window.close();
    }, 400)
}


function clientSettingsClear() {
    resetItemFlag("SETTING_MSAA");
    resetItemFlag("SETTING_FXAA");
    resetItemFlag("SETTING_SSAA");
    resetItemFlag("SETTING_SSAA_SAMPLE");
    resetItemFlag("SETTING_STATS");
}


function lunaUserClear() {
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
}


function lunaUserUpdate(obj) {
    setItemFlag("USER", `${obj.user_id}-${obj.user_name}-${obj.char_set}-${obj.timestamp}`)
    setItemFlag("USER_ID", obj.user_id)
    setItemFlag("USER_NAME", obj.user_name)
    setItemFlag("USER_VIP", obj.vip)
    setItemFlag("USER_COINS", obj.coins)
    setItemFlag("USER_UNLOCKS", obj.unlocks)
    setItemFlag("CHAR_NAME", obj.char_name)
    setItemFlag("CHAR_SET", obj.char_set)
    setItemFlag("SRV_TIME", obj.timestamp)
    setItemFlag("SRV_SIGN", obj.sign)
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


function clientScale(scale) {
    // let scale, top;
    //
    // if (height >= 1080) {
    //     scale = 1;
    //     // top = 100;
    // }
    // else {
    //     scale = height / 1080;
    //     // top = 100 * (scale / 4);
    // }

    let elements = document.getElementsByClassName("wrapper")
    let elArray = [].slice.call(elements, 0);

    elArray.forEach((el) => {
        // el.style.marginTop = `0px`
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


function startupHandler() {

    // SSAA
    if (getItemFlag("SETTING_SSAA") === "true") {
        $('#switch-ssaa').addClass('toggle-on');
        $('#sld-ssaa').prop('disabled', false);
        $('#sld-ssaa-txt').css('color', 'white');
    }

    // FXAA
    if (getItemFlag("SETTING_FXAA") === "true") {
        $('#switch-fxaa').addClass('toggle-on');
    }

    // MSAA
    if (getItemFlag("SETTING_MSAA") === "true") {
        $('#switch-msaa').addClass('toggle-on');
    }

    // STATS
    if (getItemFlag("SETTING_STATS") === "true") {
        $('#switch-stats').addClass('toggle-on');
    }

    // ENV
    if (getItemFlag("SETTING_ENV") === "ruins") {
        $('#env0').removeClass('active');
        $('#env1').addClass('active');
        $('#env2').removeClass('active');
        $('#envIndicator0').removeClass('active');
        $('#envIndicator1').addClass('active');
        $('#envIndicator2').removeClass('active');
    }
    else if (getItemFlag("SETTING_ENV") === "bunker") {
        $('#env2').addClass('active');
        $('#env1').removeClass('active');
        $('#env0').removeClass('active');
        $('#envIndicator2').addClass('active');
        $('#envIndicator1').removeClass('active');
        $('#envIndicator0').removeClass('active');
    }
    else {
        setItemFlag("SETTING_ENV", "stage");
        $('#env2').removeClass('active');
        $('#env1').removeClass('active');
        $('#env0').addClass('active');
        $('#envIndicator2').removeClass('active');
        $('#envIndicator1').removeClass('active');
        $('#envIndicator0').addClass('active');
    }

}


function toggleSettings(id) {
    const idArray = ['setting-menu-resolution', 'setting-menu-aliasing', 'setting-menu-renderer', 'setting-menu-env']
    idArray.forEach((item) => {
        if (id !== item) {
            let tab = item.replace('menu', 'tab');
            $(`#${item}`).hide();
            $(`#${tab} > i`).removeClass('fa-angle-down').addClass('fa-angle-right');
        } else {
            let tab = id.replace('menu', 'tab');
            $(`#${id}`).show();
            $(`#${tab} > i`).removeClass('fa-angle-right').addClass('fa-angle-down');
        }
    });
}





// ****************************************************************************************************************** //
//                                                 v  USERDATA  v                                                     //
// ****************************************************************************************************************** //

function lunaUserInfo(type, dataSave) {
    // API: login user
    function lunaHash() {
        let jsonData = JSON.stringify({
            "p": `placeholder`,
            "s": `${$('#recap').val()}`
        })
        $.ajax({

            url: "https://valkyteq.com:50000/animat3d/hash",
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

            url: "https://valkyteq.com:50000/animat3d/login",
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
                for (let file in obj.payload) {
                    let path = "./";
                    let ext = file.split(".")[file.split(".").length - 1];
                    if (ext === "css" || ext === "js") {
                        path = "./animat3d_client/";
                    }
                    else if (ext === "json") {
                        path = "../app/"
                    }
                    readFileHash(path + file, obj.payload[file])
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
                showFancyMessage("CREDENTIALS", "Wrong Username or Password!", "error", true);
                lunaUserClear();
            } else {
                // console.log(obj)
                showFancyMessage("Yay!", "Welcome!", "success", true);
                lunaUserUpdate(obj);
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

// TODO:
$('#main-lnk-preview').click(function () {
    if (err) { showFancyMessage("MANIPULATION", "Local files manipulated or corrupt!", "error", false) }
    else { showFrame("preview") }
    // showFrame("preview")
});

$('#main-lnk-editor').click(function () {
    if (err) { showFancyMessage("MANIPULATION", "Local files manipulated or corrupt!", "error", false) }
    else { showFrame("editor") }
    // showFrame("editor")
});

$('#main-lnk-control').click(function () {
    if (err) { showFancyMessage("MANIPULATION", "Local files manipulated or corrupt!", "error", false) }
    else { showFrame("control") }
    // showFrame("control")
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

$('#lnk-preview').click(function () {
    showFrame("preview")
});





// ****************************************************************************************************************** //
//                                                 v  SETTINGS  v                                                   //
// ****************************************************************************************************************** //


$('#settings-lnk-1').click(function () {
    clientMaximize();
});

$('#settings-lnk-2').click(function () {
    clientResize(1600, 900);
});

// $('#settings-lnk-3').click(function () {
//     clientResize(1920, 1080);
// });
//
// $('#settings-lnk-4').click(function () {
//     clientFullscreen();
// });
//
// $('#settings-lnk-5').click(function () {
//     clientResize(2580, 1080);
// });
//
// $('#settings-lnk-6').click(function () {
//     clientResize(1720, 720);
// });





// ****************************************************************************************************************** //
//                                                  v  CONTROLS  v                                                    //
// ****************************************************************************************************************** //

var page = 1,
    moving = false;
var animationIteration = "animationiteration webkitAnimationIteration mozAnimationIteration oAnimationIteration oanimationiteration",
    transitionEnd      = "transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd";
$(".a3d-arrow").on("click", function() {
    if ( moving == false ) {
        moving = true;
        $(".a3d-arrow").addClass("active");
        setTimeout(function() {
            $(".a3d-arrow").one(animationIteration, function() {
                $(".a3d-arrow").removeClass("active");
                $(".a3d-arrow").one(transitionEnd, function() {
                    page++;
                    moving = false;
                });
            });
        }, 2000);
    }
});

$('#control-wrap').click(function () {
    $('#settings-wrap').fadeOut();
    $('#frame-wrap').fadeOut();
    setTimeout(function () {
        $('#control-wrap').fadeOut();
        if (getItemFlag("SRV_SIGN") !== null && getItemFlag("SRV_SIGN").length > 5) {
            $('#main-wrap').fadeIn();
        } else {
            $('#login-wrapper').fadeIn();
        }
        $("#frame").contents().find("body").html('');
        $("#frame").contents().find("head").html('');
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
    if(event.keyCode === 13){
        $('#sign-in').click();
        return false;
    }
});




$('#switch-msaa').click(function(e){
    // disable ssaa and fxaa
    if (getItemFlag("SETTING_SSAA") === "true") {
        setItemFlag("SETTING_SSAA", "false")
        $('#switch-ssaa').removeClass('toggle-on');
    }
    if (getItemFlag("SETTING_FXAA") === "true") {
        setItemFlag("SETTING_FXAA", "false")
        $('#switch-fxaa').removeClass('toggle-on');
    }

    if (getItemFlag("SETTING_MSAA") === "true") {
        setItemFlag("SETTING_MSAA", "false")
        $('#switch-msaa').removeClass('toggle-on');
        $('#sld-ssaa').prop('disabled', true);
        $('#sld-ssaa-txt').css('color', 'grey');
    }
    else {
        setItemFlag("SETTING_MSAA", "true")
        $('#branding').attr('title',`Anti Aliasing: MSAA`)
        $('#switch-msaa').addClass('toggle-on');
        $('#sld-ssaa').prop('disabled', true);
        $('#sld-ssaa-txt').css('color', 'grey');
    }
});

$('#switch-fxaa').click(function(e){
    if (getItemFlag("SETTING_MSAA") === "true") {
        setItemFlag("SETTING_MSAA", "false")
        $('#switch-msaa').removeClass('toggle-on');
    }
    if (getItemFlag("SETTING_SSAA") === "true") {
        setItemFlag("SETTING_SSAA", "false")
        $('#switch-ssaa').removeClass('toggle-on');
    }

    if (getItemFlag("SETTING_FXAA") === "true") {
        setItemFlag("SETTING_FXAA", "false")
        $('#switch-fxaa').removeClass('toggle-on');
        $('#sld-ssaa').prop('disabled', true);
        $('#sld-ssaa-txt').css('color', 'grey');
    }
    else {
        setItemFlag("SETTING_FXAA", "true")
        $('#branding').attr('title',`Anti Aliasing: FXAA`)
        $('#switch-fxaa').addClass('toggle-on');
        $('#sld-ssaa').prop('disabled', true);
        $('#sld-ssaa-txt').css('color', 'grey');
    }
});

$('#switch-ssaa').click(function(e){
    if (getItemFlag("SETTING_MSAA") === "true") {
        setItemFlag("SETTING_MSAA", "false")
        $('#switch-msaa').removeClass('toggle-on');
    }
    if (getItemFlag("SETTING_FXAA") === "true") {
        setItemFlag("SETTING_FXAA", "false")
        $('#switch-fxaa').removeClass('toggle-on');
    }

    if (getItemFlag("SETTING_SSAA") === "true") {
        setItemFlag("SETTING_SSAA", "false")
        $('#switch-ssaa').removeClass('toggle-on');
        $('#sld-ssaa').prop('disabled', true);
        $('#sld-ssaa-txt').css('color', 'grey');
    }
    else {
        setItemFlag("SETTING_SSAA", "true")
        $('#branding').attr('title',`Anti Aliasing: SSAA`)
        $('#switch-ssaa').addClass('toggle-on');
        $('#sld-ssaa').prop('disabled', false);
        $('#sld-ssaa-txt').css('color', 'white');
    }
});

$('#switch-stats').click(function(e){
    if (getItemFlag("SETTING_STATS") === "true") {
        setItemFlag("SETTING_STATS", "false")
        $('#switch-stats').removeClass('toggle-on');
    }
    else {
        setItemFlag("SETTING_STATS", "true")
        $('#switch-stats').addClass('toggle-on');
    }
});

$('#environments').on('slide.bs.carousel', function onSlide (env) {
    const envId = env.relatedTarget.id;
    switch (envId) {
        case "env0":
            setItemFlag("SETTING_ENV", "stage");
            break;
        case "env1":
            setItemFlag("SETTING_ENV", "ruins");
            break;
        case "env2":
            setItemFlag("SETTING_ENV", "bunker");
            break;
    }
})




// ****************************************************************************************************************** //
//                                                  v  DESIGN  v                                                      //
// ****************************************************************************************************************** //


/**
 * SLIDER
 */
let sliderSSAA = document.getElementById('sld-ssaa'),
    // sliderEnableAA = document.getElementById('sld-enable-aa'),
    // sliderScaleUI = document.getElementById('sld-scale'),
    sliders = [sliderSSAA],
    sliderMin = 1,
    sliderMax = 101,     // the higher the smoother
    speed = 1;          // the lower the preciser

function slideHandler () {

    sliders.forEach((slide) => {

        let currValue, rafID, setting;

        // Get and set user settings
        if (slide === sliderSSAA) {
            setting = getItemFlag("SETTING_SSAA_SAMPLE");
        }
        // else if (slide === sliderEnableAA) {
        //     setting = getItemFlag("SETTING_ENABLE_AA");
        // }
        // else if (slide === sliderScaleUI) {
        //     setting = getItemFlag("SETTING_SCALE_UI");
        // }

        if (setting !== null) {
            currValue = parseInt(setting) + 1;
            slide.value = currValue;
            thumbHandler(slide, currValue);
            window.requestAnimationFrame(function () {
                animateHandler(slide, currValue);
            });
        }
        // else {
        //     if (slide === sliderScaleUI) {
        //         setItemFlag("SETTING_SCALE_UI", "66");
        //         currValue = parseInt("66") + 1;
        //         slide.value = currValue;
        //         thumbHandler(slide, currValue);
        //         window.requestAnimationFrame(function () {
        //             animateHandler(slide, currValue);
        //         });
        //     }
        // }

        // set min/max value
        slide.min = sliderMin;
        slide.max = sliderMax;

        // bind events
        slide.addEventListener('mousedown', function () {
            window.cancelAnimationFrame(rafID);
            currValue = +this.value;
        }, false);
        slide.addEventListener('mousestart', function () {
            window.cancelAnimationFrame(rafID);
            currValue = +this.value;
        }, false);
        slide.addEventListener('mouseup', function () {
            currValue = +this.value;
            rafID = window.requestAnimationFrame(function () {
                animateHandler(slide, currValue);
            });
        }, false);
        slide.addEventListener('touchend', function () {
            currValue = +this.value;
            rafID = window.requestAnimationFrame(function () {
                animateHandler(slide, currValue);
            });
        }, false);
        slide.addEventListener('input', function () {
            currValue = +this.value;
            thumbHandler(slide, currValue);
        });

    })
}

function thumbHandler(slide, currValue) {
    // Update ssaa sample text
    if (slide === sliderSSAA) {
        if (currValue >= 0) {
            $('#SSAA-samples').text(`x2`)
        }
        if (currValue > 25) {
            $('#SSAA-samples').text(`x4`)
        }
        if (currValue > 50) {
            $('#SSAA-samples').text(`x8`)
        }
        if (currValue > 75) {
            $('#SSAA-samples').text(`x16`)
        }
        if (currValue > 100) {
            $('#SSAA-samples').text(`x32`)
        }
    }
    // else if (slide === sliderScaleUI) {
    //     if (currValue >= 0) {
    //         $('#scale').text(`x0.5`)
    //     }
    //     if (currValue > 33) {
    //         $('#scale').text(`x0.75`)
    //     }
    //     if (currValue > 66) {
    //         $('#scale').text(`x1`)
    //     }
    //     if (currValue > 100) {
    //         $('#scale').text(`x1.25`)
    //     }
    // }

    // Change slide thumb color on way up
    if (currValue > 25) {
        slide.classList.add('ltpurple');
    }
    if (currValue > 50) {
        slide.classList.add('purple');
    }
    if (currValue > 75) {
        slide.classList.add('pink');
    }

    // Change slide thumb color on way down
    if (currValue < 25) {
        slide.classList.remove('ltpurple');
    }
    if (currValue < 50) {
        slide.classList.remove('purple');
    }
    if (currValue < 75) {
        slide.classList.remove('pink');
    }
}

// handle range animation
function animateHandler(slide, currValue) {

    // calculate gradient transition
    var transX = currValue - sliderMax;

    // update input range
    slide.value = currValue;
    if (currValue !== 101) currValue = currValue - speed;

    // Change slide thumb color on mouse up
    if (currValue < 25) {
        slide.classList.remove('ltpurple');
    }
    if (currValue < 50) {
        slide.classList.remove('purple');
    }
    if (currValue < 75) {
        slide.classList.remove('pink');
    }

    // determine if we continue SSAA slider animation
    if (slide === sliderSSAA) {
        if (currValue > 0 && 25 > currValue) {
            window.requestAnimationFrame(function () {
                animateHandler(slide, currValue);
            });
        } else if (currValue > 25 && 50 > currValue) {
            window.requestAnimationFrame(function () {
                animateHandler(slide, currValue);
            });
        } else if (currValue > 50 && 75 > currValue) {
            window.requestAnimationFrame(function () {
                animateHandler(slide, currValue);
            });
        } else if (currValue > 75 && 100 > currValue) {
            window.requestAnimationFrame(function () {
                animateHandler(slide, currValue);
            });
        } else {
            successHandler(slide, currValue)
        }
    }
    // determine if we continue FXAA slider animation
    // else if (slide === sliderEnableAA) {
    //     if (currValue > 0 && 100 > currValue) {
    //         window.requestAnimationFrame(function () {
    //             if (getItemFlag("SETTING_ENABLE_AA") !== "100" || getItemFlag("SETTING_ENABLE_AA") !== "101") {
    //                 $('#FXAA').css('color', 'grey')
    //                 $('#SSAA').css('color', 'white')
    //             }
    //             else {
    //                 setItemFlag("SETTING_ENABLE_AA", "0")
    //                 $('#SSAA').css('color', 'grey')
    //                 $('#FXAA').css('color', 'white')
    //             }
    //             animateHandler(slide, currValue);
    //         });
    //     } else {
    //         successHandler(slide, currValue)
    //     }
    // }
    // determine if we continue scale slider animation
    // else if (slide === sliderScaleUI) {
    //     if (currValue > 0 && 33 > currValue) {
    //         window.requestAnimationFrame(function () {
    //             animateHandler(slide, currValue);
    //         });
    //     } else if (currValue > 33 && 66 > currValue) {
    //         window.requestAnimationFrame(function () {
    //             animateHandler(slide, currValue);
    //         });
    //     } else if (currValue > 66 && 100 > currValue) {
    //         window.requestAnimationFrame(function () {
    //             animateHandler(slide, currValue);
    //         });
    //     } else {
    //         successHandler(slide, currValue)
    //     }
    // }
    // error
    else {
        console.error(slide, currValue)
    }
}

// handle successful unlock
function successHandler(slide, currValue) {
    // SSAA
    if (slide === sliderSSAA) {
        let samples;
        switch (currValue) {
            case 0:
                samples = 2;
                break;
            case 25:
                samples = 4;
                break;
            case 50:
                samples = 8;
                break;
            case 75:
                samples = 16;
                break;
            case 100:
            case 101:
                samples = 32;
                break;
        }
        setItemFlag("SETTING_SSAA_SAMPLE", `${currValue}`)
        $('#SSAA-samples').text(`x${samples}`)
        slide.value = currValue;
    }
    // Enable AA Type
    // else if (slide === sliderEnableAA) {
    //     // FXAA
    //     if (currValue === 0) {
    //         setItemFlag("SETTING_ENABLE_AA", `${currValue}`)
    //         $('#FXAA').css('color', 'white')
    //         $('#SSAA').css('color', 'grey')
    //         slide.value = currValue;
    //         // Set and disable SSAA Samples slide
    //         window.requestAnimationFrame(function () {
    //             animateHandler(sliderSSAA, currValue);
    //         });
    //         $('#sld-ssaa').prop('disabled', true);
    //         $('#sld-ssaa-txt').css('color', 'grey')
    //     }
    //     // SSAA
    //     else {
    //         setItemFlag("SETTING_ENABLE_AA", `${currValue}`)
    //         $('#sld-ssaa').prop('disabled', false);
    //         $('#sld-ssaa-txt').css('color', 'white')
    //         $('#FXAA').css('color', 'grey')
    //         $('#SSAA').css('color', 'white')
    //         slide.value = currValue;
    //     }
    // }
    // Set client scaling
    // else if (slide === sliderScaleUI) {
    //     let scaling = 1;
    //     switch (currValue) {
    //         case 0:
    //             scaling = 0.5;
    //             break;
    //         case 33:
    //             scaling = 0.75;
    //             break;
    //         case 66:
    //             scaling = 1;
    //             break;
    //         case 100:
    //         case 101:
    //             scaling = 1.25;
    //             break;
    //     }
    //
    //     setItemFlag("SETTING_SCALE_UI", `${currValue}`);
    //     $('#scale').text(`x${scaling}`);
    //     slide.value = currValue;
    //     clientScale(scaling);
    // }
    // error
    else {
        console.error(slide, currValue)
    }
}





// ****************************************************************************************************************** //
//                                                 v  START UP  v                                                     //
// ****************************************************************************************************************** //

if (location.pathname.split("/")[location.pathname.split("/").length-1].split(".")[0] === "index") {

    const brand = "VALKYTEQ";
    const version = "0.9.12";
    const name = "Animat3D";
    let source;

    let itemFlags = {
        "AA":false,
        "MSAA":getItemFlag("SETTING_MSAA"),
        "FXAA":getItemFlag("SETTING_FXAA"),
        "SSAA":getItemFlag("SETTING_SSAA")
    };

    let aliasing = "OFF";
    for (let [key, val] of Object.entries(itemFlags)) {
        if (val === "true") {
            itemFlags['AA'] = true;
            aliasing = key;
        }
    }

    if (location.hostname === "valkyteq.com" || location.hostname === "www.valkyteq.com") {
        source = "Web";
        $('#window-wrap').hide();
        setItemFlag("SETTING_MSAA", "true");
        setItemFlag("SETTING_FXAA", "false");
        setItemFlag("SETTING_SSAA", "false");
    } else {
        source = "Client";
    }

    console.log(`Animat3D Version       : public@^${version}`);
    console.log(`Animat3D Loader        : ${source}`);
    $('#branding').text(`${brand}@^${version}-${name}-${source}`).attr('title',`Anti Aliasing: ${aliasing}`);


    slideHandler();
    clientControls();
    lunaUserInfo("hash");
    startupHandler();  // Get User Settings

    if (getItemFlag("SRV_SIGN") !== null && getItemFlag("SRV_SIGN").length > 5) {
        // clientScale(document.documentElement.clientHeight);
        $('#login-wrapper').fadeOut();
        setTimeout(function () {
            $('#control-wrap').fadeOut();
            $('#main-wrap').fadeIn();
        }, 400);
    } else {
        // clientScale(document.documentElement.clientHeight);
        $('#control-wrap').fadeOut();
        $('#login-wrapper').fadeIn();
    }
}
