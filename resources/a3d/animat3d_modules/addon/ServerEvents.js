



// get url params
function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1];
        }

        if (sParameterName[1] === undefined) {
            window.open("https://valkyteq.com/","_self");
        }

    }

}

const p = 50000;
const m = getUrlParameter('m');
const u = getUrlParameter('u').replaceAll("%20", " ");
const i = u.split("-")[0];
const n = u.split("-")[1];
const s = u.split("-")[2];
const t = u.split("-")[3];
const x = getUrlParameter('s');

var serverEvents = new EventSource(`https://valkyteq.com:${p}/user/${i}/ai/?m=${m}&u=${u}&s=${x}`);
console.log("Animat3D Version       : ^0.5.1");

serverEvents.addEventListener('message', function(event){

    // chat command
    function _aiCmd(command) {

        const cmd = (command[0].toString().toLowerCase()).replace("/", "")
        const anim = {
            "castanic": {
                "male": {},
                "female": {
                    "fast": {
                        "angry":[angryAction, angryActionF, angryActionH],
                        "applaud":[applaudAction, applaudActionF, applaudActionH],
                        "attack":[attackAction, attackActionF, attackActionH],
                        "beg":[begAction, begActionF, begActionH],
                        "bow":[bowAction, bowActionF, bowActionH],
                        "cry":[cryAction, cryActionF, cryActionH],
                        "dance":[danceAction, danceActionF, danceActionH],
                        "fund":[fundAction, fundActionF, fundActionH],
                        "idle":[idleAction, idleActionF, idleActionH],
                        "point":[pointAction, pointActionF, pointActionH],
                        "propose":[proposeAction, proposeActionF, proposeActionH],
                        "request":[requestAction, requestActionF, requestActionH],
                        "shy":[shyAction, shyActionF, shyActionH],
                        "smile":[smileAction, smileActionF, smileActionH],
                        "taunt":[tauntAction, tauntActionF, tauntActionH],
                        "victory":[victoryAction, victoryActionF, victoryActionH],
                        "worry":[worryAction, worryActionF, worryActionH]
                    },
                    "mid": {
                        "dance2":[dance2Action, dance2ActionF, dance2ActionH],
                        "dance3":[dance3Action, dance3ActionF, dance3ActionH],
                        "run":[runAction, runActionF, runActionH],
                        "walk":[walkAction, walkActionF, walkActionH]
                    },
                    "slow": {
                        "greet":[greetAction, greetActionF, greetActionH]
                    }
                },
                "kid": {
                    "fast": {},
                    "mid": {
                        "angry":[angryAction], "dance":[danceAction], "fear":[fearAction], "greet":[greetAction],
                        "idle":[idleAction], "laugh":[laughAction], "propose":[proposeAction], "run":[runAction],
                        "sad":[sadAction], "shy":[shyAction], "talk":[talkAction], "walk":[walkAction]
                    },
                    "slow": {},
                }
            }
        }
        animSpeed = anim;


        if (m === "custom") {
            if (anim.castanic.female.fast[cmd]) {
                prepareCrossFade( idleAction, anim.castanic.female.fast[cmd][0] );
                prepareCrossFade( idleActionF, anim.castanic.female.fast[cmd][1] );
                prepareCrossFade( idleActionH, anim.castanic.female.fast[cmd][2] );
            }
            else if (anim.castanic.female.mid[cmd]) {
                prepareCrossFade( idleAction, anim.castanic.female.mid[cmd][0] );
                prepareCrossFade( idleActionF, anim.castanic.female.mid[cmd][1] );
                prepareCrossFade( idleActionH, anim.castanic.female.mid[cmd][2] );
            }
            else if (anim.castanic.female.slow[cmd]) {
                prepareCrossFade( idleAction, anim.castanic.female.slow[cmd][0] );
                prepareCrossFade( idleActionF, anim.castanic.female.slow[cmd][1] );
                prepareCrossFade( idleActionH, anim.castanic.female.slow[cmd][2] );
            }
        }
        else if (m === "kara") {
            if (anim.castanic.kid.fast[cmd]) {
                prepareCrossFade( idleAction, anim.castanic.kid.fast[cmd][0] );
            }
            else if (anim.castanic.kid.mid[cmd]) {
                prepareCrossFade( idleAction, anim.castanic.kid.mid[cmd][0] );
            }
            else if (anim.castanic.kid.slow[cmd]) {
                prepareCrossFade( idleAction, anim.castanic.kid.slow[cmd][0] );
            }
        }
        else {
            if (anim.castanic.female.fast[cmd]) {
                prepareCrossFade( idleAction, anim.castanic.female.fast[cmd][0] );
            }
            else if (anim.castanic.female.mid[cmd]) {
                prepareCrossFade( idleAction, anim.castanic.female.mid[cmd][0] );
            }
            else if (anim.castanic.female.slow[cmd]) {
                prepareCrossFade( idleAction, anim.castanic.female.slow[cmd][0] );
            }
        }

    }

    let msg = event.data.split(" ")
    _aiCmd(msg)

});