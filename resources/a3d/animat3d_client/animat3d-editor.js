/*!
  Script: animat3d-editor.js
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
import * as THREE from '../animat3d_modules/build/three.module.js';
import { GLTFLoader } from '../animat3d_modules/loaders/GLTFLoader.js';
import * as SkeletonUtils from '../animat3d_modules/utils/SkeletonUtils.js';
import {GUI} from "../animat3d_modules/libs/lil-gui.module.min.js";
import Stats from '../animat3d_modules/libs/stats.module.js';
import { Water } from '../animat3d_modules/objects/Water2.js';

console.log(`Animat3D Version       : public@^0.9.7a`);

let camera, scene, renderer;
let stats1, stats2, stats3;
let clock, character;
let settingsA3D, settingsDummy;
let settingsA3Dbuy = {};

let userCoins, userVip, userUnlocks;

let dirFace, dirHair, dirHorn, dirBody;
let dirRTitle, dirRChar, dirRTitleSet, dirRA3D, dirRA3Dsave;
let elFace, elHair, elHorn, elBody;
let elIcoChar, elIcoSet, elIcoSave;

let elCharHorn, elCharHair, elCharFace, elCharBody;

let arrHair = [];
let arrFace = [];
let arrHorn = [];
let arrBody = [];
let listHair = {};
let listFace = {};
let listHorn = {};
let listBody = {};

let rarity = {
    1: "Basic",
    2: "Uncommon",
    3: "Rare",
    4: "Heroic",
    5: "Mythic",
    6: "Unique"
}
let dirs = {
    'Face':dirFace,
    'Hair':dirHair,
    'Horn':dirHorn,
    'Body':dirBody
}
let lists = {
    'Face':listFace,
    'Hair':listHair,
    'Horn':listHorn,
    'Body':listBody
}
let arrs = [
    arrFace,
    arrHair,
    arrHorn,
    arrBody
];

let gizmo, helper;
let world, water, scale;

let options, optionsCastaFem, optionsCastaKid;

// so we can use degrees as input
let degree = Math.PI / 180;
let inch = 2.54 * 10;
let rgb = Math.PI * 50;

const animController = [];
const gltfController = [];
let animationSkeleton = [];


// ****************************************************************************************************************** //
//                                                 v  USERDATA  v                                                     //
// ****************************************************************************************************************** //


// // get url params
// function getUrlParameter(sParam) {
//     let sPageURL = window.location.search.substring(1),
//         sURLVariables = sPageURL.split('&'),
//         sParameterName,
//         i;
//
//     for (i = 0; i < sURLVariables.length; i++) {
//         sParameterName = sURLVariables[i].split('=');
//
//         if (sParameterName[0] === sParam) {
//             return sParameterName[1];
//         }
//
//         if (sParameterName[1] === undefined) {
//             window.open("https://valkyteq.com/","_self");
//         }
//
//     }
//
// }
//
// // const p = 50000;
// // const m = getUrlParameter('m') ? getUrlParameter('m') !== "Develop" : "custom";
// const m = getUrlParameter('m');
// const u = getUrlParameter('u').replaceAll("%20", " ");
// // const uid = u.split("-")[0];
// const n = u.split("-")[1];
// const s = u.split("-")[2].split("x");
// // const t = u.split("-")[3];
// const x = getUrlParameter('s');

// resetItemFlag("USER_ID")
// resetItemFlag("USER_NAME")
// resetItemFlag("USER_VIP")
// resetItemFlag("USER_COINS")
// resetItemFlag("USER_UNLOCKS")
// resetItemFlag("CHAR_NAME")
// resetItemFlag("CHAR_SET")
// resetItemFlag("SRV_TIME")

const m = getItemFlag("CHAR_NAME");
const u = getItemFlag("USER");
const n = getItemFlag("USER_NAME");
const s = getItemFlag("CHAR_SET").split("x");
const x = getItemFlag("SRV_SIGN");


function lunaUserInfo(type, dataSave) {

    // API: get all infos
    function lunaGet() {
        $.ajax({

            url: "https://valkyteq.com:50000/animat3d/get",
            dataType: "json",
            type: "POST",
            async: true,
            data: {
                "m": m,
                "u": u,
                "s": x
            },

            success: _getHandler

        });
    }

    // API: user save char
    function lunaSet(save) {
        $.ajax({

            url: "https://valkyteq.com:50000/animat3d/set",
            dataType: "json",
            type: "POST",
            async: true,
            data: {
                "m": m,
                "u": u,
                "s": x,
                "save": save
            },

            success: _resHandler

        });
    }

    // API: user buy item
    function lunaBuy(item) {
        $.ajax({

            url: "https://valkyteq.com:50000/animat3d/buy",
            dataType: "json",
            type: "POST",
            async: true,
            data: {
                "m": m,
                "u": u,
                "s": x,
                "item": item
            },

            success: _resHandler

        });
    }

    // API: ping
    function lunaPing() {
        $.ajax({

            url: "https://valkyteq.com:50000/ping",
            dataType: "json",
            type: "POST",
            async: true,
            data: {
                "m": m,
                "u": u,
                "s": x,
                "ping": `${Date.now()/1000}`
            },

            success: _resHandler

        });
    }

    // Getter handler -> Start Animat3D
    function _getHandler (obj, status, xhr) {
        if (!xhr) { }
        if (status !== "success") window.open("https://valkyteq.com/","_self");
        else {
            // Update User Values
            userCoins = obj.coins;
            userVip = obj.vip;
            if (obj.unlocks) {
                userUnlocks = obj.unlocks;
            } else {
                userUnlocks = "empty";
            }

            // Go through all items from database
            obj.items.forEach(function (item) {
                switch (item.category) {
                    case "Body":
                        arrBody.push(item)
                        listBody[item.name] = function () {
                            updateEquipment(item)
                            removeEntity(item.category);
                            addEntity(item);
                            setTimeout(function () {
                                setAnimation("idle");
                            }, 100);
                        }
                        settingsDummy[item.name] = function () {};
                        break;
                    case "Face":
                        arrFace.push(item)
                        listFace[item.name] = function () {
                            updateEquipment(item)
                            removeEntity(item.category);
                            addEntity(item);
                            setTimeout(function () {
                                setAnimation("idle");
                            }, 100);
                        }
                        settingsDummy[item.name] = function () {};
                        break;
                    case "Hair":
                        arrHair.push(item)
                        listHair[item.name] = function () {
                            updateEquipment(item)
                            removeEntity(item.category);
                            addEntity(item);
                            setTimeout(function () {
                                setAnimation("idle");
                            }, 100);
                        }
                        settingsDummy[item.name] = function () {};
                        break;
                    case "Horn":
                        arrHorn.push(item)
                        listHorn[item.name] = function () {
                            updateEquipment(item)
                            removeEntity(item.category);
                            addEntity(item);
                            setTimeout(function () {
                                setAnimation("idle");
                            }, 100);
                        }
                        settingsDummy[item.name] = function () {};
                        break;
                }
            });

            //
            // START ANIMAT3D
            // =================
            init(options);

        }
    }

    // Response handler
    function _resHandler (obj, status, xhr) {
        if (!xhr) { }
        if (status !== "success") window.open("https://valkyteq.com/","_self");
        else {

            // Update User Values
            userCoins = obj.coins;
            userVip = obj.vip;
            if (obj.unlocks) {
                userUnlocks = obj.unlocks;
            } else {
                userUnlocks = "empty";
            }

            //
            // LOCKED ITEMS FOUND
            // =====================
            if (obj.buy) {

                let btnIDs = [];
                let info = ``;
                let vip;

                // Set VIP
                if (obj.vip) {
                    vip = `<span class="success">YES</span>`;
                } else {
                    vip = `<span class="error">NO</span>`;
                }

                // Design Item List (Right Panel)
                obj.buy.forEach(function (item) {

                    btnIDs.push(item.id)
                    settingsA3Dbuy[`${item.id}`] = function() {
                        buyEquipment(item);
                    }

                    // Decide if VIP or Ꝟ Coins
                    let amount;
                    if (item.price !== 99999) {
                        amount = item.price + ' Ꝟ';
                    } else {
                        amount = 'VIP Membership';
                    }

                    // Design Item Block Info (right)
                    let itemName = `<div class="item_grade_${item.grade}">${item.name_en} (${rarity[item.grade]})</div>`;
                    let itemDesc = `<div class="hr_grade_${item.grade}"></div>${item.desc_en}`;
                    let itemPrice = `Unlock ${item.name_en} with: <span class="item_price">${amount}</span>`;
                    let itemBuy = `<button class="btn btn-sm btn-outline-buy" id="${item.id}">Unlock</button>`;

                    // Design Item Block Image (left)
                    let itemImg = `
                        <div class="icon_grade_${item.grade}" style="width: 132px;height: 130px;">
                            <img src="https://valkyteq.com/static/${item.icon}" alt="${item.name}" width="128" height="128">
                        </div>
                    `;

                    // Put Design Block Together
                    let itemInfoL = `<div class="a3d-modal-body-l-cnt">${itemImg}</div>`;
                    let itemInfoR = `<div class="a3d-modal-body-m-cnt">${itemName}${itemDesc}<br><br>${itemPrice}<br>${itemBuy}</div>`;

                    // Add Item To List
                    info += `<br><div class="a3d-block" id="block${item.id}">${itemInfoL}${itemInfoR}</div>`;

                })

                // Design Info Panel (left)
                let infoImage = `<img src="https://valkyteq.com/static/vteq.png" alt="VALKYTEQ" width="128">`;
                let infoA3D = `<br><div style="font-family:'Russo One',serif;letter-spacing:0.05em;">..a project by VALKYTEQ</div><br>`;
                let infoTitle = `<i class="fal fa-info-square"></i>     INFORMATION     <i class="fal fa-info-square"></i>`;
                let infoText = `
                    You have items equipped, which aren't unlocked yet. Select an item on the right to unlock it, 
                    or the button below to close this window and switch the equipped item.
                `;

                // Get Modal Template
                let modal = $('.a3d-modal');
                let title = $('.a3d-modal-title');
                let body = [$('.a3d-modal-body-l'), $('.a3d-modal-body-m')];
                let footer = [$('.a3d-modal-footer-l'), $('.a3d-modal-footer-m'), $('.a3d-modal-footer-r')];

                // Build Modal Info
                title.text("Locked Items");
                body[0].html(`${infoImage}${infoA3D}<br><b>${infoTitle}</b><br>${infoText}`);
                body[1].html(`${info}`);
                footer[0].html(`
                    <b><i class="fal fa-user"></i> ${n}</b>     <br>
                    <span class="item_price"><i class="fal fa-coins"></i> <span id="coins">${obj.coins}</span> Ꝟ</span>     
                    <span class="success"><i class="fal fa-crown"></i> VIP:</span> ${vip}
                `);
                footer[1].html(`<a href="https://valkyteq.com/support/" target="_blank">Need Help? <i class="fal fa-external-link"></i></a>`);
                footer[2].html(`<button type="button" class="a3d-modal-button btn a3d-btn" onclick="$('#a3d-modal').hide()">Close</button>`);

                // Bind function to buy buttons
                btnIDs.forEach(function (id) {
                    let buyBtn = $(`#${id}`)
                    buyBtn.on("click", settingsA3Dbuy[`${id}`])
                })

                // Show Modal
                modal.show();
            }

            //
            // CONFIRM RESPONSE
            // ===================
            else if (obj.res) {
                // ITEM BOUGHT
                if (obj.res.constructor === Array) {
                    let item = obj.res[0];
                    // Update Coins Display
                    parent.postMessage(userCoins, '*');
                    $('#coins').html(userCoins);
                    // Delete Image from Locked Items panel
                    $(`#block${item.id}`).remove()
                    // Create Confirm Modal
                    let buyTitle = `<div class="item_grade_3">Congratulations!</div><div class="hr_grade_3">`;
                    let buyMessage = `${item.name_en} has been unlocked! Enjoy!`;
                    // showFancyMessage("Hooray!", buyMessage, "success", true);
                    doConfirm(buyTitle, buyMessage);
                }
                // CHARACTER SAVED
                else {
                    // Create Confirm Modal
                    let buyTitle = `<div class="item_grade_3">Congratulations!</div><div class="hr_grade_3">`;
                    let buyMessage = `Your character has been saved!`;
                    setItemFlag("CHAR_SET", obj.char);
                    setItemFlag("USER_VIP", obj.vip);
                    setItemFlag("USER_COINS", obj.coins);
                    setItemFlag("USER_UNLOCKS", obj.unlocks);
                    // showFancyMessage("Hooray!", buyMessage, "success", true);
                    doConfirm(buyTitle, buyMessage);
                }
            }


        }
    }

    if (type === "ping") {
        lunaPing();
    } else if (type === "get") {
        lunaGet();
    } else if (type === "set") {
        lunaSet(dataSave);
    } else if (type === "buy") {
        lunaBuy(dataSave);
    }

}
lunaUserInfo("get")


// ****************************************************************************************************************** //
//                                               v  SERVER EVENTS  v                                                  //
// ****************************************************************************************************************** //


// let serverEvents = new EventSource(`https://valkyteq.com:${p}/user/${uid}/a3d/?m=${m}&u=${u}&s=${x}`);
//
// serverEvents.addEventListener('message', function(event){
//
//     // chat command
//     function _aiCmd(command) {
//
//         const cmd = (command[0].toString().toLowerCase()).replace("/", "")
//         setAnimation(cmd);
//
//     }
//
//     let msg = event.data.split(" ")
//     _aiCmd(msg)
//
// });


// ****************************************************************************************************************** //
//                                                 v  SETTINGS  v                                                     //
// ****************************************************************************************************************** //


settingsDummy = {
    'horn': function () { },
    'hair': function () { },
    'face': function () { },
    'body': function () { }
}

settingsA3D = {
    'Show Model': true,
    'Show Scenery': function () {
        showScenery( true );
    },
    'Show Engine Stats': function () {
        showStats( true );
    },
    'Show Debug Lines': false,
    'Sync Char Animation': function () {
        setAnimation("idle");
    },
    'Save Character': function () {
        saveCharacter();
    },
    'Water Color': '#fce1b8',
    'Water Scale': 3,
    'Water Flow X': 0,
    'Water Flow Y': 0,
    'save_char': function () {
        dirRA3D.close();
        dirRA3Dsave.open();
        for (let elm of [elIcoSave, elIcoSet]) {
            if (elm === elIcoSave) {
                let css = elm.domElement.children[0].children[0].style;
                css.backgroundColor = 'transparent';
                css.borderColor = '#ffffff';
            } else {
                let css = elm.domElement.children[0].children[0].style;
                css.backgroundColor = 'rgba(0,0,0,0.77)';
                css.borderColor = '#000000';
            }
        }
    },
    'settings': function () {
        dirRA3D.open();
        dirRA3Dsave.close();
        for (let elm of [elIcoSave, elIcoSet]) {
            if (elm === elIcoSet) {
                let css = elm.domElement.children[0].children[0].style;
                css.backgroundColor = 'transparent';
                css.borderColor = '#ffffff';
            } else {
                let css = elm.domElement.children[0].children[0].style;
                css.backgroundColor = 'rgba(0,0,0,0.77)';
                css.borderColor = '#000000';
            }
        }
    },
    'hair': function () {
        dirHair.open()
        dirFace.close()
        dirHorn.close()
        dirBody.close()
        for (let elm of [elHair, elFace, elHorn, elBody]) {
            if (elm === elHair) {
                let css = elm.domElement.children[0].children[0].style;
                css.backgroundColor = 'transparent';
                css.borderColor = '#ffffff';
            } else {
                let css = elm.domElement.children[0].children[0].style;
                css.backgroundColor = 'rgba(0,0,0,0.77)';
                css.borderColor = '#000000';
            }
        }
    },
    'face': function () {
        dirHair.close()
        dirFace.open()
        dirHorn.close()
        dirBody.close()
        for (let elm of [elHair, elFace, elHorn, elBody]) {
            if (elm === elFace) {
                let css = elm.domElement.children[0].children[0].style;
                css.backgroundColor = 'transparent';
                css.borderColor = '#ffffff';
            } else {
                let css = elm.domElement.children[0].children[0].style;
                css.backgroundColor = 'rgba(0,0,0,0.77)';
                css.borderColor = '#000000';
            }
        }
    },
    'horn': function () {
        dirHair.close()
        dirFace.close()
        dirHorn.open()
        dirBody.close()
        for (let elm of [elHair, elFace, elHorn, elBody]) {
            if (elm === elHorn) {
                let css = elm.domElement.children[0].children[0].style;
                css.backgroundColor = 'transparent';
                css.borderColor = '#ffffff';
            } else {
                let css = elm.domElement.children[0].children[0].style;
                css.backgroundColor = 'rgba(0,0,0,0.77)';
                css.borderColor = '#000000';
            }
        }
    },
    'body': function () {
        dirHair.close()
        dirFace.close()
        dirHorn.close()
        dirBody.open()
        for (let elm of [elHair, elFace, elHorn, elBody]) {
            if (elm === elBody) {
                let css = elm.domElement.children[0].children[0].style;
                css.backgroundColor = 'transparent';
                css.borderColor = '#ffffff';
            } else {
                let css = elm.domElement.children[0].children[0].style;
                css.backgroundColor = 'rgba(0,0,0,0.77)';
                css.borderColor = '#000000';
            }
        }
    }
}


// ****************************************************************************************************************** //
//                                                  v  OPTIONS  v                                                     //
// ****************************************************************************************************************** //


optionsCastaKid = {
    "stats":true,
    "debug":true,
    "gizmo":10,
    "cpanel":true,
    "camera":{
        "fov":35,
        "near":1,
        "far":10000,
        "position":[-77, 27, -123],
        "rotation":[0, 200, 0]
    },
    "scene":{
        "ground":false,
        "gcolor":0x0d5bdd,
        "gsize":[500,500],
        "background":true,
        "bgcolor":0x0d5bdd,
        "fog":false,
        "fogcolor":0x0d5bdd,
        "fognear":30,
        "fogfar":300
    },
    "light":{
        "shadow":true,
        "color":0xffffff,
        "skycolor":0xffffff,
        "groundcolor":0x444444,
        "position":[-30, 100, -100],
        "size":30,
        "near":0.00001,
        "far":2000,
        "bias":-0.00001
    }
};
optionsCastaFem = {
    "stats":true,
    "debug":true,
    "gizmo":200,
    "cpanel":true,
    "camera":{
        "fov":45,
        "near":1,
        "far":10000,
        "position":[
            optionsCastaKid.camera.position[0] * inch,
            optionsCastaKid.camera.position[1] * inch,
            optionsCastaKid.camera.position[2] * inch
        ],
        "rotation":[2, 180, 0]
    },
    "scene":{
        "ground":false,
        "gcolor":0x0d5bdd,
        "gsize":[20000,20000],
        "background":true,
        "bgcolor":0x0d5bdd,
        "fog":false,
        "fogcolor":0x0d5bdd,
        "fognear":777,
        "fogfar":7777
    },
    "light":{
        "shadow":true,
        "color":0xffffff,
        "skycolor":0xffffff,
        "groundcolor":0x444444,
        "position":[-300, 1000, -1000],
        "size":1000,
        "near":0.00001,
        "far":100000,
        "bias":-0.00001
    }
};

// if (m !== "custom") {
//     if (m === "kara" || m === "kara1") {
//         // settings = settingsCastaKid;
//         options = optionsCastaKid;
//         scale = false;
//     }
//     else if (m === "hiphop" || m === "police" || m === "pubg" || m === "cyba") {
//         // settings = settingsCastaFem;
//         options = optionsCastaKid;
//         scale = false;
//     }
//     else {
//         // settings = settingsCastaFem;
//         options = optionsCastaKid;
//         scale = true;
//     }
// } else {
    // settings = settingsCastaFem;
    options = optionsCastaKid;
    scale = true;
// }


// ****************************************************************************************************************** //
//                                                v  INITIALIZE  v                                                    //
// ****************************************************************************************************************** //


function init(opt) {

    // load all animations
    gltfLoadBase();

    camera = new THREE.PerspectiveCamera(
        opt.camera.fov,
        window.innerWidth/window.innerHeight,
        opt.camera.near,
        opt.camera.far
    );
    camera.position.set(
        opt.camera.position[0],
        opt.camera.position[1],
        opt.camera.position[2]
    );
    camera.rotation.set(
        opt.camera.rotation[0] * degree,
        opt.camera.rotation[1] * degree,
        opt.camera.rotation[2] * degree
    );

    clock = new THREE.Clock();
    scene = new THREE.Scene();

    // background
    if (opt.scene.background) {
        scene.background = new THREE.Color(opt.scene.bgcolor);
    }

    // fog / bg transmission
    if (opt.scene.fog) {
        scene.fog = new THREE.Fog(opt.scene.fogcolor, opt.scene.fognear, opt.scene.fogfar);
    }

    // water
    const waterGeometry = new THREE.PlaneGeometry( 300, 400 );
    water = new Water( waterGeometry, {
        color: settingsA3D['Water Color'],
        scale: settingsA3D['Water Scale'],
        flowDirection: new THREE.Vector2( settingsA3D['Water Flow X'], settingsA3D['Water Flow Y'] ),
        textureWidth: 1024,
        textureHeight: 1024
    } );
    water.position.x = 0;
    water.position.y = -3;
    water.position.z = 100;
    water.rotation.x = Math.PI * - 0.5;
    scene.add( water );

    // Load background texture
    const textureSky = new THREE.TextureLoader();
    textureSky.load('animat3d_textures/sky/night1.jpg' , function(texture) {
        scene.background = texture;
    });

    // omni light
    // const omniLight = new THREE.HemisphereLight( opt.light.skycolor, opt.light.groundcolor );
    // omniLight.position.set( 0, 50, 0 );
    // omniLight.intensity = 1.2;
    // scene.add(omniLight);

    // ambient light
    const ambientLight = new THREE.AmbientLight( 0xb8bbfc, 1 );
    scene.add( ambientLight );

    // directional light
    const dirLight = new THREE.DirectionalLight( 0xb8bbfc, 2.75 );
    dirLight.position.set( - 0, 100, - 100 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 400;
    dirLight.shadow.camera.bottom = -400;
    dirLight.shadow.camera.left = -167;
    dirLight.shadow.camera.right = 233;
    dirLight.shadow.camera.near = 0.001;
    dirLight.shadow.camera.far = 400;
    dirLight.shadow.bias = -0.0065;
    scene.add( dirLight );


    // ground
    // if (opt.scene.ground) {
    //     const mesh = new THREE.Mesh(
    //         new THREE.PlaneGeometry(opt.scene.gsize[0], opt.scene.gsize[1]),
    //         new THREE.MeshPhongMaterial({color: opt.scene.gcolor, depthWrite: false})
    //     );
    //     mesh.rotation.x = -Math.PI / 2;
    //     mesh.receiveShadow = opt.light.shadow;
    //     scene.add(mesh);
    // }

    // character loading
    const loader = new GLTFLoader();
    loader.load( './animat3d_objects/scenes/ruins.a3d', function ( gltf ) {

        world = gltf.scene;
        scene.add( world );

        // allow to cast shadow
        world.traverse( function ( object ) {
            if ( object.isMesh ) {
                object.castShadow = opt.light.shadow;
                object.receiveShadow = opt.light.shadow;
                object.material.transparency = true;
                object.material.opacity = 1;
            }
        } );

        // model.material.transparency = true;
        // model.material.opacity = 0.1;

        world.position.x = 0;
        world.position.y = -16.2;
        world.position.z =300;

        world.rotation.x = 0;
        world.rotation.y = 180 * degree;
        world.rotation.z = 0;

    } );

    // chars
    // if (m !== "custom") {
    //     let clip, speed;
    //     if (m === "kara") {
    //         clip = 11;
    //         speed = .75;
    //     } else if (m === "cyba") {
    //         clip = 19;
    //         speed = .5;
    //     }else {
    //         clip = 19;
    //         speed = .5;
    //     }
    //     setTimeout(function (){
    //         loadGLTF( `./animat3d_objects/chars/${m}.a3d`, clip, speed, [-33,0,0], [0,22,0], opt.light.shadow, "Char");
    //     }, 5000)
    // }
    // else {

        // BODY SET CODE:
        const body = s[0];
        let bodyName;
        arrBody.forEach(function (item) {
            if (item.id.toString().substring(2) === body) bodyName = item.name;
        })

        // FACE SET CODE:
        const face = s[1];

        // HAIR SET CODE:
        const hair = s[2];

        // HORN SET CODE:
        const horn = s[3];

        setTimeout(function (){
            loadGLTF(`./animat3d_objects/body/${bodyName}.a3d`, 19, .5, [-33,0,0], [0,22,0], opt.light.shadow, "Body");
            loadGLTF(`./animat3d_objects/face/face${face}.a3d`, 19, .5, [-33,0,0], [0,22,0], opt.light.shadow, "Face");
            loadGLTF(`./animat3d_objects/hair/hair${hair}.a3d`, 19, .5, [-33,0,0], [0,22,0], opt.light.shadow, "Hair");
            loadGLTF(`./animat3d_objects/horn/horn${horn}.a3d`, 19, .5, [-33,0,0], [0,22,0], opt.light.shadow, "Horn");
        }, 5000)



    // }


    // debug
    if (opt.debug) {
        // world gizmo
        gizmo = new THREE.AxesHelper(opt.gizmo);
        gizmo.position.set(-33, 0.2, 0);
        scene.add(gizmo);

        // light helper
        helper = new THREE.CameraHelper(dirLight.shadow.camera);
        scene.add(helper);

        // disable
        showGizmo( false );
    }

    // load stats
    if (opt.stats) {
        stats1 = new Stats();
        stats1.showPanel(0); // Panel 0 = fps
        stats1.domElement.style.cssText = 'position:absolute;bottom:100px;left:0px;padding-left:2%;';
        // document.body.appendChild(stats1.domElement);

        stats2 = new Stats();
        stats2.showPanel(1); // Panel 1 = ms
        stats2.domElement.style.cssText = 'position:absolute;bottom:100px;left:80px;padding-left:2%;';
        // document.body.appendChild(stats2.domElement);

        stats3 = new Stats();
        stats3.showPanel(2); // Panel 2 = vram
        stats3.domElement.style.cssText = 'position:absolute;bottom:100px;left:160px;padding-left:2%;';
        // document.body.appendChild(stats3.domElement);

        // stats = new Stats();
        const container = document.getElementById('a3d-stat-container');
        container.appendChild(stats1.domElement);
        container.appendChild(stats2.domElement);
        container.appendChild(stats3.domElement);
    }

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // softer shadows
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = opt.light.shadow;

    // build page
    document.body.appendChild( renderer.domElement );

    // add resize event
    window.addEventListener( 'resize', onWindowResize );

    // control panel
    if (opt.cpanel) {
        objectPanel();
    }

}


// ****************************************************************************************************************** //
//                                            v  SETTINGS FUNCTIONS  v                                                //
// ****************************************************************************************************************** //


// function showModel( visibility ) {
//     let models = [
//         scene.getObjectByName("BODY"),
//         scene.getObjectByName("FACE"),
//         scene.getObjectByName("HAIR")
//     ];
//     if (m !== "custom") {
//         scene.getObjectByName("CHAR").visible = visibility;
//     } else {
//         models.forEach(function (model) {
//             model.visible = visibility;
//         });
//     }
// }

function showScenery( ) {
    if (world.visible) {
        world.visible = false;
        water.visible = false;
    }
    else {
        world.visible = true;
        water.visible = true;
    }
}

// function updateEquipment(item) {
//     switch (item.category.toLowerCase()) {
//         case "body":
//             elCharBody.domElement.remove();
//             elCharBody = dirRChar.add(settingsDummy, 'body');
//             stylePanelBtn(elCharBody, item);
//             break;
//         case "face":
//             elCharFace.domElement.remove();
//             elCharFace = dirRChar.add(settingsDummy, 'face');
//             stylePanelBtn(elCharFace, item);
//             break;
//         case "hair":
//             elCharHair.domElement.remove();
//             elCharHair = dirRChar.add(settingsDummy, 'hair');
//             stylePanelBtn(elCharHair, item);
//             break;
//         case "horn":
//             elCharHorn.domElement.remove();
//             elCharHorn = dirRChar.add(settingsDummy, 'horn');
//             stylePanelBtn(elCharHorn, item);
//             break;
//     }
// }

function updateEquipment(item) {
    switch (item.category.toLowerCase()) {
        case "body":
            elCharBody.domElement.remove();
            elCharBody = dirRChar.add(settingsDummy, item.name);
            stylePanelBtn(elCharBody, item);
            break;
        case "face":
            elCharFace.domElement.remove();
            elCharFace = dirRChar.add(settingsDummy, item.name);
            stylePanelBtn(elCharFace, item);
            break;
        case "hair":
            elCharHair.domElement.remove();
            elCharHair = dirRChar.add(settingsDummy, item.name);
            stylePanelBtn(elCharHair, item);
            break;
        case "horn":
            elCharHorn.domElement.remove();
            elCharHorn = dirRChar.add(settingsDummy, item.name);
            stylePanelBtn(elCharHorn, item);
            break;
    }
}

/**
 *
 * @returns {{}} Current Equipped Character Items
 */
function getEquipment() {
    let data = {};
    let el = [
        elCharBody, elCharFace, elCharHair, elCharHorn
    ];
    arrs.forEach(function (arr) {
        arr.forEach(function (item) {
            if (item.name === el[0]._name) {
                data['body'] = item.id;
            }
            else if (item.name === el[1]._name) {
                data['face'] = item.id;
            }
            else if (item.name === el[2]._name) {
                data['hair'] = item.id;
            }
            else if (item.name === el[3]._name) {
                data['horn'] = item.id;
            }
        })
    })
    return data;
}


function saveCharacter() {
    const equipment = getEquipment();
    lunaUserInfo("set", equipment)
}


function buyEquipment( item ) {

    if (item.price !== 99999) {
        let buyTitle = `<div class="item_grade_${item.grade}">${item.name_en} (${rarity[item.grade]})</div><div class="hr_grade_${item.grade}">`;
        let buyMessage = `You really want to unlock ${item.name_en}?<br>Cost: <span class="item_price"> ${item.price} Ꝟ</span>`;
        doConfirm(
            buyTitle,
            buyMessage,
            function yes() {
                lunaUserInfo("buy", item.id)
            },
            function no() {
                // Do nothing
                console.log("┬─┬ ノ( ゜-゜ノ)")
            });
    } else {
        window.open('https://valkyteq.com/vip/', '_blank').focus();
    }

}


function showStats( visibility ) {
    visibility = `#a3d-stat-container`;
    $(visibility).toggle()
}


function showGizmo( visibility ) {
    gizmo.visible = visibility;
    helper.visible = visibility;
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}


function doConfirm(ttl, msg, yesFn, noFn) {
    let confirmBox = $("#a3d-confirm-modal");
    confirmBox.find(".a3d-confirm-header").html(ttl);
    confirmBox.find(".a3d-confirm-body").html(msg);
    confirmBox.find(".yes,.no,.ok").unbind().click(function() {
        confirmBox.hide();
        // $("#a3d-modal").hide()
    });
    if (!yesFn && !noFn) {
        confirmBox.find(".ok").show();
        confirmBox.find(".yes").hide();
        confirmBox.find(".no").hide();
    }
    else {
        confirmBox.find(".ok").hide();
        confirmBox.find(".yes").show();
        confirmBox.find(".no").show();
        confirmBox.find(".yes").click(yesFn);
        confirmBox.find(".no").click(noFn);
    }
    confirmBox.show();
}


// ****************************************************************************************************************** //
//                                                v  ITEM PANEL  v                                                    //
// ****************************************************************************************************************** //

/**
 *
 * @param { HTMLCanvasElement | HTMLCanvasElement | OffscreenCanvas | CanvasRenderingContext2D | any } element
 * @param { object } item
 */
function stylePanelBtn( element, item ) {

    let shop;

    if (item.tradable === 0) {
        shop = false;
    }
    else if (item.tradable === 1 && userUnlocks.includes(item.id)) {
        shop = false;
    }
    else shop = !(item.tradable === 2 && userVip);

    const url = `https://valkyteq.com/static/`;
    // type
    let size, posi;
    switch (item.category) {
        case "Face":
            size = '112px';
            posi = '50% 50%';
            break;
        case "Hair":
            size = '96px';
            posi = '50% 30%';
            break;
        case "Horn":
            size = '96px';
            posi = '50% 30%';
            break;
        case "Body":
            size = '96px';
            posi = '50% 40%';
            break;
    }
    // rarity
    let rarity, rarityColor;
    switch (item.grade) {
        case 1:
            rarity = "Basic";
            rarityColor = '#1fa717';
            break;
        case 2:
            rarity = "Uncommon";
            rarityColor = '#03c4be';
            break;
        case 3:
            rarity = "Rare";
            rarityColor = '#0347c4';
            break;
        case 4:
            rarity = "Heroic";
            rarityColor = '#ffa414';
            break;
        case 5:
            rarity = "Mythic";
            rarityColor = '#c63db6';
            break;
        case 6:
            rarity = "Unique";
            rarityColor = '#b42525';
            break;
    }

    //
    // Controller Box
    // -----------------
    // if (shop) element.domElement.disabled = true;
    element.domElement.style = "";
    let cssController = element.domElement.style;
    cssController.display = 'inline';
    cssController.width = '70px';
    cssController.height = '70px';
    cssController.margin = '0 0 0 0';
    cssController.padding = '0 0 0 0';

    //
    // Item Icon
    // ------------
    // if (shop) element.domElement.children[0].disabled = true;
    element.domElement.children[0].style = "";
    let cssWidget = element.domElement.children[0].style;
    let previewImage  = `${url}${item.icon}`;
    cssWidget.backgroundImage = `url(${previewImage})`;
    cssWidget.backgroundRepeat = 'no-repeat';
    cssWidget.backgroundPosition = posi;
    cssWidget.backgroundColor = 'transparent';
    cssWidget.backgroundSize = size;
    cssWidget.display = 'inline-block';
    cssWidget.margin = '3.5px';
    cssWidget.width = '70px';
    cssWidget.height = '70px';

    //
    // Item Rarity
    // --------------
    element.domElement.children[0].children[0].innerText = " ";
    element.domElement.children[0].children[0].style = "";
    let css = element.domElement.children[0].children[0].style;
    css.width = '70px';
    css.height = '70px';
    css.margin = '0 0 0 0';
    css.padding = '0 0 0 0';
    css.fontSize = '3.5em';
    css.color = 'transparent';
    css.borderColor = rarityColor;
    css.backgroundColor = 'transparent';
    if (shop) {
        css.backgroundImage = `url(https://valkyteq.com/static/icons/grade/icon_grade_${item.grade}.png), url(https://valkyteq.com/static/icons/misc/icon_lock_32.png)`;
        css.backgroundRepeat = 'no-repeat, no-repeat';
        css.backgroundPosition = 'left top, right bottom';
        css.backgroundColor = 'transparent, transparent';
    }
    else {
        css.backgroundImage = `url(https://valkyteq.com/static/icons/grade/icon_grade_${item.grade}.png)`;
        css.backgroundRepeat = 'no-repeat';
        css.backgroundPosition = 'left top';
        css.backgroundColor = 'transparent, transparent';
    }


    //
    // TOOLTIPS
    // ------------

    // info
    let info = `${item.desc_en}`;
    const image = `<div class="icon_grade_${item.grade}"><img src='${previewImage}' alt="${item.name}" width="256px"/></div>`;
    const descRarity = `<div class="item_grade_${item.grade}">${rarity} ${item.category}</div>`;

    // vip?
    let price = '';
    if (shop) {
        let amount;
        if (item.price !== 99999) {
            amount = item.price + ' Ꝟ';
        } else {
            amount = 'VIP Membership';
        }
        price = `Unlock ${item.name_en} for: <div class="item_price">${amount}</div><hr>`;
    }

    // Add tooltip
    let tooltip = `<hr>${item.name_en}<hr>${image}<hr>${descRarity}<br>${info}<hr>${price}`;
    element.domElement.children[0].setAttribute(`title`, tooltip);
    element.domElement.children[0].setAttribute(`data-bs-html`, `true`);
    element.domElement.children[0].setAttribute(`data-bs-trigger`, `hover`);
    element.domElement.children[0].setAttribute(`data-bs-toggle`, `tooltip`);
    element.domElement.children[0].setAttribute(`data-bs-placement`, `auto`);
    element.domElement.children[0].setAttribute(`data-bs-animation`, `true`);
    element.domElement.children[0].setAttribute(`data-bs-container`, `body`);

    new bootstrap.Tooltip(element.domElement.children[0])

}

/**
 *
 * @param { HTMLCanvasElement | HTMLCanvasElement | OffscreenCanvas | CanvasRenderingContext2D | any } element HTML element
 * @param { string } item String for icon lookup
 * @param { string } tip String for manual tooltip
 * @param { boolean } active Bool for highlighting
 */
function stylePanelDir( element, item , tip, active) {
    // controller
    element.domElement.style = "";
    let cssController = element.domElement.style;
    cssController.display = 'inline';
    cssController.margin = '0 0 0 0';
    cssController.padding = '0 0 0 0';
    if (item === "anim") {
        cssController.width = '70px';
        cssController.height = '70px';
    } else {
        cssController.width = '50px';
        cssController.height = '50px';
    }

    // widget
    element.domElement.children[0].style = "";
    let cssWidget = element.domElement.children[0].style;
    cssWidget.backgroundImage = `url(https://valkyteq.com/static/icons/misc/icon_cat_${item}.jpg)`;
    cssWidget.backgroundRepeat = 'no-repeat';
    cssWidget.backgroundPosition = '50% 50%';
    cssWidget.backgroundColor = 'transparent';
    cssWidget.display = 'inline-block';
    cssWidget.margin = '3.5px';
    if (item === "anim") {
        cssWidget.backgroundSize = '70px';
        cssWidget.width = '70px';
        cssWidget.height = '70px';
    } else {
        cssWidget.backgroundSize = '50px';
        cssWidget.width = '50px';
        cssWidget.height = '50px';
    // } else {
    //     cssWidget.backgroundSize = '70px';
    //     cssWidget.width = '50px';
    //     cssWidget.height = '50px';
    }

    // button
    element.domElement.children[0].children[0].style = "";
    element.domElement.children[0].children[0].innerText = " ";
    let css = element.domElement.children[0].children[0].style;
    // css.backgroundImage = `url(https://valkyteq.com/static/icons/misc/icon_dir_g_32.png)`;
    // css.backgroundColor = 'rgba(3,71,196,0.22)';
    // css.borderColor = '#0347c4';
    if (active) {
        css.backgroundColor = 'transparent';
        css.borderColor = '#ffffff';
    }
    else {
        css.backgroundColor = 'rgba(0,0,0,0.77)';
        css.borderColor = '#000000';
    }
    css.color = '#0347c4';
    css.backgroundRepeat = 'no-repeat';
    css.backgroundPosition = 'bottom right';
    css.margin = '0 0 0 0';
    css.padding = '0 0 0 0';
    if (item === "anim") {
        css.backgroundImage = `url(https://valkyteq.com/static/icons/misc/icon_setting_32.png)`;
        css.backgroundColor = 'transparent';
        css.borderColor = '#0094FF';
        css.width = '70px';
        css.height = '70px';
    } else {
        css.width = '50px';
        css.height = '50px';
    }

    // tooltip
    let tooltip;
    if (tip) tooltip = `<hr>${tip}<hr>`;
    else tooltip = `<hr>Show ${item.toUpperCase()} Items<hr>`;
    element.domElement.children[0].setAttribute(`title`, tooltip);
    element.domElement.children[0].setAttribute(`data-bs-html`, `true`);
    element.domElement.children[0].setAttribute(`data-bs-trigger`, `hover`);
    element.domElement.children[0].setAttribute(`data-bs-toggle`, `tooltip`);
    element.domElement.children[0].setAttribute(`data-bs-placement`, `auto`);
    element.domElement.children[0].setAttribute(`data-bs-animation`, `true`);
    element.domElement.children[0].setAttribute(`data-bs-container`, `body`);

    new bootstrap.Tooltip(element.domElement.children[0])

}


function stylePanelSetting(element) {
    // controller
    // element.domElement.style = "";
    let cssController = element.domElement.style;
    cssController.height = '2.5rem';

    // widget
    // element.domElement.children[0].style = "";
    let cssWidget = element.domElement.children[0].style;
    cssWidget.height = '2.5rem';

    // button
    element.domElement.children[0].children[0].classList.add("a3d-modal-button");
    element.domElement.children[0].children[0].classList.add("btn");
    element.domElement.children[0].children[0].classList.add("a3d-btn");
    let cssButton = element.domElement.children[0].children[0].style;
    cssButton.height = '2.5rem';
    cssButton.fontSize = '1rem';

}


function objectPanel() {

    let rar1 = [], rar2 = [], rar3 = [], rar4 = [], rar5 = [], rar6 = [];
    let rars = [
        rar1, rar2, rar3, rar4, rar5, rar6
    ];

    function _sortRarity(item) {
        switch (item.grade) {
            case 1:
                rar1.push(item)
                break;
            case 2:
                rar2.push(item)
                break;
            case 3:
                rar3.push(item)
                break;
            case 4:
                rar4.push(item)
                break;
            case 5:
                rar5.push(item)
                break;
            case 6:
                rar6.push(item)
                break;
        }
    }



    //
    // Right Panel
    // ===============
    const panelR = new GUI( {  } );
    panelR.domElement.classList.add("fixed-bottom");
    // panelR.domElement.style = '';
    let cssPanelR = panelR.domElement.style;
    cssPanelR.backgroundColor = 'transparent';
    cssPanelR.display = 'inline';
    cssPanelR.width = '30%';
    cssPanelR.height = '100%';
    cssPanelR.padding = '2%';
    cssPanelR.overflow = 'hidden';
    cssPanelR.verticalAlign = 'right';
    cssPanelR.textAlign = 'right';
    cssPanelR.alignSelf = 'right';
    cssPanelR.alignContent = 'right';
    cssPanelR.alignItems = 'right';

    // Char Title
    dirRTitle = panelR.addFolder( 'Char Title' );
    // dirRTitle.domElement.style = "";
    let cssdirRTitle = dirRTitle.domElement.style;
    cssdirRTitle.backgroundColor = 'transparent';
    cssdirRTitle.display = 'inline-block';
    cssdirRTitle.width = '100%';
    cssdirRTitle.paddingTop = '65px';
    cssdirRTitle.paddingLeft = '20%';
    cssdirRTitle.verticalAlign = 'right';
    cssdirRTitle.textAlign = 'right';
    cssdirRTitle.alignSelf = 'right';
    cssdirRTitle.alignContent = 'right';
    cssdirRTitle.alignItems = 'right';

    // Char Items
    dirRChar = panelR.addFolder( 'Char Items' );
    // dirRChar.domElement.style = "";
    let cssdirRChar = dirRChar.domElement.style;
    cssdirRChar.backgroundColor = 'transparent';
    cssdirRChar.display = 'inline';
    cssdirRChar.width = '100%';
    cssdirRChar.paddingLeft = '20%';
    cssdirRChar.verticalAlign = 'right';
    cssdirRChar.textAlign = 'right';
    cssdirRChar.alignSelf = 'right';
    cssdirRChar.alignContent = 'right';
    cssdirRChar.alignItems = 'right';

    // Settings Title
    dirRTitleSet = panelR.addFolder( 'Settings Title' );
    // dirRTitleSet.domElement.style = "";
    let cssdirRTitleSet = dirRTitleSet.domElement.style;
    cssdirRTitleSet.backgroundColor = 'transparent';
    cssdirRTitleSet.display = 'inline-block';
    cssdirRTitleSet.width = '100%';
    cssdirRTitleSet.paddingTop = '50px';
    cssdirRTitleSet.paddingLeft = '20%';
    cssdirRTitleSet.verticalAlign = 'right';
    cssdirRTitleSet.textAlign = 'right';
    cssdirRTitleSet.alignSelf = 'right';
    cssdirRTitleSet.alignContent = 'right';
    cssdirRTitleSet.alignItems = 'right';

    // Settings Items
    dirRA3D = panelR.addFolder( 'Animat3D Settings' );
    // dirRA3D.domElement.style = "";
    let cssdirRA3D = dirRA3D.domElement.style;
    cssdirRA3D.backgroundColor = 'transparent';
    cssdirRA3D.width = '100%';
    cssdirRA3D.paddingLeft = '40%';
    cssdirRA3D.verticalAlign = 'right';
    cssdirRA3D.textAlign = 'right';
    cssdirRA3D.alignSelf = 'right';
    cssdirRA3D.alignContent = 'right';
    cssdirRA3D.alignItems = 'right';

    // Char Settings Items
    dirRA3Dsave = panelR.addFolder( 'Character Settings' );
    // dirRA3Dsave.domElement.style = "";
    let cssdirRA3Dsave = dirRA3Dsave.domElement.style;
    cssdirRA3Dsave.backgroundColor = 'transparent';
    cssdirRA3Dsave.width = '100%';
    cssdirRA3Dsave.paddingLeft = '40%';
    cssdirRA3Dsave.verticalAlign = 'right';
    cssdirRA3Dsave.textAlign = 'right';
    cssdirRA3Dsave.alignSelf = 'right';
    cssdirRA3Dsave.alignContent = 'right';
    cssdirRA3Dsave.alignItems = 'right';



    // 3D Model Visibility
    // folder0.add( settingsA3D, 'Show Model' ).onChange( showModel );
    // folder0.add( settingsA3D, 'Show FPS Stats' ).onChange( showStats );
    // folder0.add( settingsA3D, 'Show Debug Lines' ).onChange( showGizmo );

    // let elSync = dirRA3Dsave.add( settingsA3D, 'Sync Char Animation' );
    // stylePanelDir(elSync, 'anim', 'Resync Animation', true);
    // let elStat = dirRA3D.add( settingsA3D, 'Show Engine Stats' ).onChange( showStats );
    // stylePanelDir(elStat, 'unknown.png');

    // Character Settings
    let elSetSave = dirRA3Dsave.add( settingsA3D, 'Save Character' );
    stylePanelSetting(elSetSave)

    let elSetSync = dirRA3Dsave.add( settingsA3D, 'Sync Char Animation' );
    stylePanelSetting(elSetSync)


    // Engine Settings
    let elSetStat = dirRA3D.add( settingsA3D, 'Show Engine Stats' ).onChange( showStats );
    stylePanelSetting(elSetStat)

    let elSetScene = dirRA3D.add( settingsA3D, 'Show Scenery' ).onChange( showScenery );
    stylePanelSetting(elSetScene)


    // Set icons for titles
    elIcoChar = dirRTitle.add( settingsDummy, 'body' );
    stylePanelDir(elIcoChar, 'char', 'Current Equiped Character Items', true);

    elIcoSet = dirRTitleSet.add( settingsA3D, 'settings' );
    stylePanelDir(elIcoSet, 'set', 'Animat3D Settings', false);

    elIcoSave = dirRTitleSet.add( settingsA3D, 'save_char' );
    stylePanelDir(elIcoSave, 'set_char', 'Character Settings', true);

    dirRA3D.close();
    dirRA3Dsave.open();

    
    // ===========================================================================================================


    const panel = new GUI( {  } );
    panel.domElement.classList.add("fixed-bottom");
    panel.domElement.classList.add("content-l");
    // panel.domElement.style = "";
    let cssPanel = panel.domElement.style;
    cssPanel.backgroundColor = 'transparent';
    cssPanel.width = '30%';
    cssPanel.height = '100%';
    cssPanel.padding = '2%';
    cssPanel.overflow = 'hidden';


    const dirA3D = panel.addFolder( '3D Web Engine Settings' );
    // dirA3D.domElement.classList.add("col-md-12");
    // dirA3D.domElement.style = "";
    let cssdirA3D = dirA3D.domElement.style;
    cssdirA3D.backgroundColor = 'transparent';
    cssdirA3D.width = '80%';
    cssdirA3D.paddingTop = '65px';


    dirFace = panel.addFolder( 'Face' );
    // dirFace.domElement.classList.add("col-md-3");
    // dirFace.domElement.style = "";
    let cssdirFace = dirFace.domElement.style;
    cssdirFace.backgroundColor = 'transparent';
    cssdirFace.width = '80%';
    // cssdirFace.paddingTop = '50px';


    dirHair = panel.addFolder( 'Hair' );
    // dirHair.domElement.classList.add("col-md-3");
    // dirHair.domElement.style = "";
    let cssdirHair = dirHair.domElement.style;
    cssdirHair.backgroundColor = 'transparent';
    cssdirHair.width = '80%';
    // cssdirHair.paddingTop = '15px';


    dirHorn = panel.addFolder( 'Horn' );
    // dirHorn.domElement.classList.add("col-md-3");
    // dirHorn.domElement.style = "";
    let cssdirHorn = dirHorn.domElement.style;
    cssdirHorn.backgroundColor = 'transparent';
    cssdirHorn.width = '80%';
    // cssdirHorn.paddingTop = '15px';


    dirBody = panel.addFolder( 'Body' );
    // dirBody.domElement.classList.add("col-md-3");
    // dirBody.domElement.style = "";
    let cssdirBody = dirBody.domElement.style;
    cssdirBody.backgroundColor = 'transparent';
    cssdirBody.width = '80%';
    // cssdirBody.paddingTop = '15px';


    // const dirShop = panel.addFolder( 'New Items' );



    elHorn = dirA3D.add( settingsA3D, 'horn' );
    stylePanelDir(elHorn, 'horn', 'Show All Horns', false);

    elHair = dirA3D.add( settingsA3D, 'hair' );
    stylePanelDir(elHair, 'hair', 'Show All Hairstyles', true);

    elFace = dirA3D.add( settingsA3D, 'face' );
    stylePanelDir(elFace, 'face', 'Show All Faces', false);

    elBody = dirA3D.add( settingsA3D, 'body' );
    stylePanelDir(elBody, 'body', 'Show All Costumes', false);


    dirs = {
        'Face':dirFace,
        'Hair':dirHair,
        'Horn':dirHorn,
        'Body':dirBody
    }
    lists = {
        'Face':listFace,
        'Hair':listHair,
        'Horn':listHorn,
        'Body':listBody
    }
    arrs = [
        arrFace,
        arrHair,
        arrHorn,
        arrBody
    ];


    arrs.forEach(function (arr) {
        arr.forEach(function (item) {
            _sortRarity(item, false);
        })
    })

    rars.forEach(function (rarity) {
        rarity.forEach(function (rarityItem) {

            // if (rarityItem.tradable === 0) {
            //     let button = dirs[rarityItem.category].add(lists[rarityItem.category], rarityItem.name);
            //     stylePanelBtn(button, rarityItem, false)
            // }
            // else if (rarityItem.tradable === 1 && userUnlocks.includes(rarityItem.id)) {
            //     let button = dirs[rarityItem.category].add(lists[rarityItem.category], rarityItem.name);
            //     stylePanelBtn(button, rarityItem, false)
            // }
            // else if (rarityItem.tradable === 2 && userVip) {
            //     let button = dirs[rarityItem.category].add(lists[rarityItem.category], rarityItem.name);
            //     stylePanelBtn(button, rarityItem, false)
            // }
            // else {
            //     let button = dirs[rarityItem.category].add(lists[rarityItem.category], rarityItem.name);
            //     stylePanelBtn(button, rarityItem, true)
            // }

            let button = dirs[rarityItem.category].add(lists[rarityItem.category], rarityItem.name);
            stylePanelBtn(button, rarityItem)

            // // BODY SET CODE:
            // const body = s[0];
            //
            // // FACE SET CODE:
            // const face = s[1];
            //
            // // HAIR SET CODE:
            // const hair = s[2];
            //
            // // HORN SET CODE:
            // const horn = s[3];

            if (rarityItem.id.toString().substring(0,2) === "10" && rarityItem.id.toString().substring(2) === s[0]) {
                // let elBody = dirRCharBody.add( settingsDummy, 'body' );
                // stylePanelDir(elBody, 'body', 'Current Equiped Costume', true);
                elCharBody = dirRChar.add(settingsDummy, rarityItem.name);
                stylePanelBtn(elCharBody, rarityItem)
            }
            else if (rarityItem.id.toString().substring(0,2) === "20" && rarityItem.id.toString().substring(2) === s[1]) {
                // let elFace = dirRCharBody.add( settingsDummy, 'face' );
                // stylePanelDir(elFace, 'face', 'Current Equiped Face', true);
                elCharFace = dirRChar.add(settingsDummy, rarityItem.name);
                stylePanelBtn(elCharFace, rarityItem)
            }
            else if (rarityItem.id.toString().substring(0,2) === "30" && rarityItem.id.toString().substring(2) === s[2]) {
                // let elHair = dirRCharBody.add( settingsDummy, 'hair' );
                // stylePanelDir(elHair, 'hair', 'Current Equiped Hairstyle', true);
                elCharHair = dirRChar.add(settingsDummy, rarityItem.name);
                stylePanelBtn(elCharHair, rarityItem)
            }
            else if (rarityItem.id.toString().substring(0,2) === "40" && rarityItem.id.toString().substring(2) === s[3]) {
                elCharHorn = dirRChar.add(settingsDummy, rarityItem.name);
                stylePanelBtn(elCharHorn, rarityItem)
            }

        })
    })

    // trars.forEach(function (trarity) {
    //     trarity.forEach(function (trarityItem) {
    //         let button = dirs[trarityItem.category].add(listShop, trarityItem.name);
    //         stylePanelBtn(button, trarityItem, true)
    //     })
    // })


    // show / hide
    dirA3D.open();
    dirHorn.close();
    dirHair.open();
    dirFace.close();
    dirBody.close();
    // dirShop.open();

    // Item Category highlight switch
    $('.title').css('display', 'none');
    // for (let elm of [elHair, elFace, elHorn, elBody, elSync]) {
    //     if (elm === elHair) {
    //         let css = elm.domElement.children[0].children[0].style;
    //         // css.backgroundImage = `url(https://valkyteq.com/static/icons/misc/icon_dir_w_32.png)`;
    //         css.backgroundColor = 'transparent';
    //         css.borderColor = '#ffffff';
    //     } else if (elm === elSync) {
    //         let css = elm.domElement.children[0].children[0].style;
    //         css.backgroundImage = `url(https://valkyteq.com/static/icons/misc/icon_setting_32.png)`;
    //         css.backgroundColor = 'transparent';
    //         css.borderColor = '#0094FF';
    //     } else {
    //         let css = elm.domElement.children[0].children[0].style;
    //         // css.backgroundImage = `url(https://valkyteq.com/static/icons/misc/icon_dir_g_32.png)`;
    //         css.backgroundColor = 'rgba(0,0,0,0.66)';
    //         css.borderColor = '#000000';
    //     }
    // }

}


// ****************************************************************************************************************** //
//                                            v  ANIMAT3D FUNCTIONS  v                                                //
// ****************************************************************************************************************** //


/**
 * Load all animation from external file
 * to be used with all models
 */
function gltfLoadBase() {
    const loader = new GLTFLoader();
    loader.load( `./animat3d_objects/_skel/skeleton.a3d`, function ( gltf ) {
        for (let i = 0; i <= 21; i++) {
            animationSkeleton.push(gltf.animations[i])
        }
    } );
    return true;
}


/**
 * @param {string|number} clip
 */
function setAnimation(clip) {

    const anim = {
        "castanic": {
            "male": {},
            "female": {
                "fast": {
                    "angry":0,
                    "applaud":1,
                    "attack":2,
                    "beg":3,
                    "bow":4,
                    "cry":15,
                    "dance":5,
                    "fund":6,
                    "idle":19,
                    "point":10,
                    "propose":11,
                    "request":12,
                    "shy":13,
                    "smile":14,
                    "taunt":16,
                    "victory":17,
                    "worry":18
                },
                "mid": {
                    "dance2":7,
                    "dance3":8,
                    "run":21,
                    "walk":20
                },
                "slow": {
                    "greet":9
                }
            },
            "kid": {
                "fast": {},
                "mid": {
                    "angry":0, "dance":9, "fear":1, "greet":2,
                    "idle":11, "laugh":3, "propose":7, "run":10,
                    "cry":4, "shy":5, "talk":6, "walk":8
                },
                "slow": {},
            }
        }
    }


    if (m !== "kara") {
        if (anim.castanic.female.fast[clip]) {
            let id = 0;
            animController.forEach(function (animControl) {
                let idleAction = animControl.clipAction(animationSkeleton[anim.castanic.female.fast['idle']]);
                let eventAction = animControl.clipAction(animationSkeleton[anim.castanic.female.fast[clip]]);
                animControl.timeScale = .5;
                animationFading(eventAction, idleAction, animControl);
                id++;
            });
        }
        else if (anim.castanic.female.mid[clip]) {
            let id = 0;
            animController.forEach(function (animControl) {
                let idleAction = animControl.clipAction(animationSkeleton[anim.castanic.female.fast['idle']]);
                let eventAction = animControl.clipAction(animationSkeleton[anim.castanic.female.mid[clip]]);
                animControl.timeScale = .75;
                animationFading(eventAction, idleAction, animControl);
                id++;
            });
        }
        else if (anim.castanic.female.slow[clip]) {
            let id = 0;
            animController.forEach(function (animControl) {
                let idleAction = animControl.clipAction(animationSkeleton[anim.castanic.female.fast['idle']]);
                let eventAction = animControl.clipAction(animationSkeleton[anim.castanic.female.slow[clip]]);
                animControl.timeScale = 1;
                animationFading(eventAction, idleAction, animControl);
                id++;
            });
        }
    }
    else if (m === "kara") {
        if (!scale) {
            if (anim.castanic.kid.mid[clip]) {
                let id = 0;
                animController.forEach(function (animControl) {
                    let gltfControl = gltfController[id];
                    let idleAction = animControl.clipAction(gltfControl.animations[anim.castanic.kid.mid['idle']]);
                    let eventAction = animControl.clipAction(gltfControl.animations[anim.castanic.kid.mid[clip]]);
                    animationFading(eventAction, idleAction, animControl);
                    id++;
                });
            }
        }
    }

}


/**
 * @param {string} file
 * @param {number} clip
 * @param {number} speed
 * @param {array<number>} position
 * @param {array<number>} rotation
 * @param {boolean} shadow
 * @param {string} type
 */
function loadGLTF(file, clip, speed, position, rotation, shadow, type) {
    character = new GLTFLoader();
    character.load( file, function ( gltf ) {

        gltf.scene.traverse( function ( object ) {
            if ( object.isMesh ) {
                object.castShadow = shadow;
            }
        } );

        const model = SkeletonUtils.clone( gltf.scene );
        const mixer = new THREE.AnimationMixer( model );

        mixer.clipAction( animationSkeleton[clip] ).play();
        // mixer.clipAction( gltf.animations[clip] );
        mixer.timeScale = speed

        model.position.x = position[0];
        model.position.y = position[1];
        model.position.z = position[2];

        model.rotation.x = rotation[0] * degree;
        model.rotation.y = rotation[1] * degree;
        model.rotation.z = rotation[2] * degree;

        model.name = type;
        if (scale) model.scale.set(1/inch,1/inch,1/inch);

        if (type === "Hair") {
            const matAmount = model.children[1].children.length;
            // materialColors = new Float32Array(matAmount * 3)
            for (let child = 0; child < matAmount; child++) {
                model.children[1].children[child].material.color.r = s[4] / rgb;
                model.children[1].children[child].material.color.g = s[5] / rgb;
                model.children[1].children[child].material.color.b = s[6] / rgb;
            }
        }

        scene.add( model );
        animController.push( mixer );
        gltfController.push( gltf )

    });
}


/**
 * @param {object} item
 */
function addEntity(item) {

    if (["kara", "kara1", "hiphop", "police", "pubg", "cyba"].includes(m) && !scale) scale = true;

    let clip, speed;
    if (item === "kara") {
        clip = 11;
        speed = .75;
    } else {
        clip = 19;
        speed = .5;
    }

    let pos = [-33,0,0];
    let rot = [0,22,0];

    switch (item.category) {
        case "Char":
            loadGLTF( `./animat3d_objects/chars/${item}.a3d`, clip, speed, pos, rot, options.light.shadow, item.category);
            break;
        case "Body":
            loadGLTF(`./animat3d_objects/body/${item.name}.a3d`, clip, speed, pos, rot, options.light.shadow, item.category);
            break;
        case "Face":
            loadGLTF(`./animat3d_objects/face/face${item.id.toString().substring(2)}.a3d`, clip, speed, pos, rot, options.light.shadow, item.category);
            break;
        case "Hair":
            loadGLTF(`./animat3d_objects/hair/hair${item.id.toString().substring(2)}.a3d`, clip, speed, pos, rot, options.light.shadow, item.category);
            break;
        case "Horn":
            loadGLTF(`./animat3d_objects/horn/horn${item.id.toString().substring(2)}.a3d`, clip, speed, pos, rot, options.light.shadow, item.category);
            break;
    }





}


function removeEntity(name) {
    let selectedObject = scene.getObjectByName(name);
    scene.remove( selectedObject );
    // animate();
}


function animationFading( eventAction, idleAction, mixer ) {
    if (eventAction === idleAction) {
        let speed;
        if (m === "kara") {
            speed = .75;
        } else {
            speed = .5;
        }
        mixer.timeScale = speed;
        idleAction.stop();
        idleAction.play();
    }
    else {
        idleAction.stop();
        eventAction.play();

        mixer.addEventListener('loop', onLoopFinished);

        function onLoopFinished(event) {
            if (event.action === eventAction) {
                mixer.removeEventListener('loop', onLoopFinished);
                let speed;
                if (m === "kara") {
                    speed = .75;
                } else {
                    speed = .5;
                }
                mixer.timeScale = speed;
                idleAction.play();
                eventAction.stop();
            }
        }
    }

}


function animate() {

    requestAnimationFrame( animate );

    const delta = clock.getDelta();

    for ( const mixer of animController ) {
        mixer.update(delta);
    }

    for ( let stats of [stats1, stats2, stats3]) {
        stats.update();
    }
    // stats1.update();
    // stats2.update();
    // stats3.update();

    renderer.render( scene, camera );

}


// ****************************************************************************************************************** //
//                                                v    -R-U-N-    v                                                   //
// ****************************************************************************************************************** //

setTimeout(function (){animate()}, 7000)
