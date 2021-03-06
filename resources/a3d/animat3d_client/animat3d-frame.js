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
import { GUI } from "../animat3d_modules/libs/lil-gui.module.min.js";
import Stats from '../animat3d_modules/libs/stats.module.js';
import { Water } from '../animat3d_modules/objects/Water2.js';
import { EffectComposer } from '../animat3d_modules/postprocessing/EffectComposer.js';
import { RenderPass } from '../animat3d_modules/postprocessing/RenderPass.js';
import { ShaderPass } from '../animat3d_modules/postprocessing/ShaderPass.js';
import { CopyShader } from '../animat3d_modules/shaders/CopyShader.js';
import { FXAAShader } from '../animat3d_modules/shaders/FXAAShader.js';
import { SSAARenderPass } from '../animat3d_modules/postprocessing/SSAARenderPass.js';
import { GammaCorrectionShader } from "../animat3d_modules/shaders/GammaCorrectionShader.js";


let camera, scene, renderer;
let stats1, stats2, stats3;
let clock, character, skeleton;
let settingsA3D, settingsDummy, settingsPreview;
let settingsA3Dbuy = {};

let userCoins, userVip, userUnlocks;
let composer, fxaaPass, ssaaPass, container;

let dirFace, dirHair, dirHorn, dirBody, dirAnim;
let dirRTitle, dirRChar, dirRTitleSet, dirRA3D, dirRA3Dsave, dirRA3Danim;
let elFace, elHair, elHorn, elBody, elAnim;
let elIcoChar, elIcoSet, elIcoSave;

let elCharHorn, elCharHair, elCharFace, elCharBody;

let arrHair = [];
let arrFace = [];
let arrHorn = [];
let arrBody = [];
let arrAnim = [];
let arrSets = [];
let listHair = {};
let listFace = {};
let listHorn = {};
let listBody = {};
let listAnim = {};

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
    'Body':dirBody,
    'Anim':dirAnim
}
let lists = {
    'Face':listFace,
    'Hair':listHair,
    'Horn':listHorn,
    'Body':listBody,
    'Anim':listAnim
}
let arrs = [
    arrFace,
    arrHair,
    arrHorn,
    arrBody,
    arrAnim
];

let gizmo, samples;
let world, water, scale, options;

// so we can use degrees as input
let degree = Math.PI / 180;
let inch = 2.54 * 10;
let rgb = Math.PI * 50;

const animController = [];
const gltfController = [];
let animationSkeleton = [];


// ****************************************************************************************************************** //
//                                               v  DATA INTERFACE  v                                                 //
// ****************************************************************************************************************** //


const m = getItemFlag("CHAR_NAME");
const u = getItemFlag("USER");
const uid = getItemFlag("USER_ID");
const n = getItemFlag("USER_NAME");
const x = getItemFlag("SRV_SIGN");
let s;
if (getItemFlag("FRAME") === "preview") {
    s = getItemFlag("CHAR_SET");
} else {
    s = getItemFlag("CHAR_SET").split("x");
}


/** VALKYTEQ ADI
 * ------------------------
 * Accessible Data Interface
 *
 * ------------------------
 * - adi_getDataAll
 * - adi_getDataPreview
 * - adi_setDataAll
 * - adi_setDataBuy
 * - adi_serverPing
 *
 * @param {string} type
 * @param {{}} dataSave
 */
function vteqADI(type, dataSave) {

    // API: get preview data
    function adi_getDataPreview() {
        let jsonData = JSON.stringify({
            "p": `placeholder`,
            "s": `${$('#recap').val()}`
        });
        $.ajax({

            url: "https://valkyteq.com:50000/animat3d/preview",
            dataType: "json",
            type: "POST",
            async: true,
            data: jsonData,

            success: _getHandler

        });
    }

    // API: get all infos
    function adi_getDataAll() {
        let jsonData = JSON.stringify({
            "m": m,
            "u": u,
            "s": x
        });
        $.ajax({

            url: "https://valkyteq.com:50000/animat3d/get",
            dataType: "json",
            type: "POST",
            async: true,
            data: jsonData,

            success: _getHandler

        });
    }

    // API: user save char
    function adi_setDataAll(save) {
        let jsonData = JSON.stringify({
            "m": m,
            "u": u,
            "s": x,
            "save": save
        });
        $.ajax({

            url: "https://valkyteq.com:50000/animat3d/set",
            dataType: "json",
            type: "POST",
            async: true,
            data: jsonData,

            success: _resHandler

        });
    }

    // API: user buy item
    function adi_setDataBuy(item) {
        let jsonData = JSON.stringify({
            "m": m,
            "u": u,
            "s": x,
            "item": item
        });
        $.ajax({

            url: "https://valkyteq.com:50000/animat3d/buy",
            dataType: "json",
            type: "POST",
            async: true,
            data: jsonData,

            success: _resHandler

        });
    }

    // API: ping
    function adi_serverPing() {
        let jsonData = JSON.stringify({
            "m": m,
            "u": u,
            "s": x,
            "ping": `${Date.now()/1000}`
        });
        $.ajax({

            url: "https://valkyteq.com:50000/ping",
            dataType: "json",
            type: "POST",
            async: true,
            data: jsonData,

            success: _resHandler

        });
    }

    // Event: connect
    function adi_eventConnect() {
        let eventData = JSON.stringify({
            "m": `${m}`,
            "u": `${u}`,
            "s": `${x}`
        })
        let serverEvents = new EventSource(`https://valkyteq.com:50000/animat3d/event/${uid}?${eventData}`);
        serverEvents.addEventListener('message', function (event) {
            function _aiCmd(command) {
                const cmd = (command[0].toString().toLowerCase()).replace("/", "")
                setAnimation(cmd);
            }
            let msg = event.data.split(" ")
            _aiCmd(msg)
        });
    }

    // Getter handler -> Start Animat3D
    function _getHandler (obj, status, xhr) {
        if (!xhr) { }
        if (status !== "success") window.open("https://valkyteq.com/","_self");
        else {

            // Update User Values
            userDataUpdateBase(obj);

            // Go through all items
            // if (getItemFlag("FRAME") === "preview") {
                obj.payload.forEach(function (item) {
                    updateItem(item);
                });
            // } else {
            //     // items
            //     obj.payload[0].forEach(function (item) {
            //         updateItem(item);
            //     });
            //     // sets
            //     obj.payload[1].forEach(function (item) {
            //         arrSets.push(item)
            //     });
            // }

            //
            // START ANIMAT3D
            // =================
            if (getItemFlag("FRAME") !== "store") {
                init(options);
            }

        }
    }

    // Response handler
    function _resHandler (obj, status, xhr) {
        if (!xhr) { }
        if (status !== "success") window.open("https://valkyteq.com/","_self");
        else {

            // Update User Values
            userDataUpdateBase(obj);

            //
            // LOCKED ITEMS FOUND
            // =====================
            if (obj.status === "itemToBuy") {

                let btnIDs = [];
                let infoItem = ``;

                // Design Item List
                obj.payload.forEach(function (item) {
                    btnIDs.push(item.id)
                    settingsA3Dbuy[`${item.id}`] = function() {
                        buyEquipment(item);
                    }
                    infoItem += styleStoreItem(item, "");
                })

                // Add info about locked items
                let infoText = `
                    You have items equipped, which aren't unlocked yet. Select an item on the right to unlock it,
                    or the X on top right to close this window and switch the equipped item.
                `;

                // Show locked items in store
                let htmlId = 'store-cat-equip';
                let shopBody = $(`#${htmlId}`);
                shopBody.html(infoItem);
                toggleStoreCategory(htmlId, infoText);

                // Bind function to buy buttons
                btnIDs.forEach(function (id) {
                    let buyBtn = $(`#${id}`)
                    buyBtn.on("click", settingsA3Dbuy[`${id}`])
                })

                // Store Modal
                storeUserInfo();
                showStore();
            }

            //
            // CONFIRM RESPONSE
            // ===================
            else if (obj.status === "success") {
                // ITEM BOUGHT
                if (obj.payload.constructor === Array) {
                    let item = obj.payload[0];
                    // Update Coins Display
                    $('#coins').html(obj.coins);
                    // Delete Image from Locked Items panel
                    $(`#block${item.id}`).remove()
                    $(`#blockstore${item.id}`).remove()
                    $(`#blocksets${item.id}`).remove()
                    $(`#br${item.id}`).remove()
                    $(`#brstore${item.id}`).remove()
                    $(`#brsets${item.id}`).remove()
                    // Create Confirm Modal
                    let buyTitle = `<div class="item_grade_3">Congratulations!</div><div class="hr_grade_3">`;
                    let buyMessage = `${item.name_en} has been unlocked! Enjoy!`;
                    doConfirm(buyTitle, buyMessage);
                }
                // CHARACTER SAVED
                else {
                    // Updated Info
                    userDataUpdate(obj);
                    // Create Confirm Modal
                    let buyTitle = `<div class="item_grade_3">Congratulations!</div><div class="hr_grade_3">`;
                    let buyMessage = `Your character has been saved!`;
                    doConfirm(buyTitle, buyMessage);
                }
            }


        }
    }

    if (type === "ping") {
        adi_serverPing();
    } else if (type === "get") {
        adi_getDataAll();
    } else if (type === "set") {
        adi_setDataAll(dataSave);
    } else if (type === "buy") {
        adi_setDataBuy(dataSave);
    } else if (type === "pre") {
        adi_getDataPreview();
    } else if (type === "event") {
        adi_eventConnect();
    }

}


// ****************************************************************************************************************** //
//                                                 v  ANIMATIONS  v                                                   //
// ****************************************************************************************************************** //

const anim = {
    "castanic": {
        "male": {},
        "female": {
            "fast": {
                "angry":"0",
                "applaud":"1",
                "attack":2,
                "beg":3,
                "bow":4,
                "cry":15,
                "dance":5,
                "fund":6,
                "idle":19,
                "idle2":22,
                "idle3":23,
                "idle4":24,
                "point":10,
                "propose":11,
                "request":12,
                "shy":13,
                "laugh":14,
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
                "angry":"0", "dance":9, "worry":"1", "greet":2,
                "idle":11, "laugh":3, "propose":7, "run":10,
                "sad":4, "shy":5, "fund":6, "walk":8
            },
            "slow": {},
        }
    }
}





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
    'Show Model':  function () {
        showModel();
    },
    'Show Scenery': function () {
        showScenery();
    },
    'Show Engine Stats': function () {
        showStats();
    },
    'Show Debug Lines': false,
    'Sync Animation': function () {
        setAnimation("idle");
    },
    'Save Character': function () {
        saveCharacter();
    },
    'Animat3D Store': function () {
        storeUserInfo();
        showStore();
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
    'animation': function () {
        dirHair.close()
        dirFace.close()
        dirHorn.close()
        dirBody.close()
        dirAnim.open();
        for (let elm of [elHair, elFace, elHorn, elBody, elAnim]) {
            if (elm === elAnim) {
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
        dirAnim.close();
        for (let elm of [elHair, elFace, elHorn, elBody, elAnim]) {
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
        dirAnim.close();
        for (let elm of [elHair, elFace, elHorn, elBody, elAnim]) {
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
        dirAnim.close();
        for (let elm of [elHair, elFace, elHorn, elBody, elAnim]) {
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
        dirAnim.close();
        for (let elm of [elHair, elFace, elHorn, elBody, elAnim]) {
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
    },
    'settings_Preview': function () {
        dirRA3D.open();
        dirRA3Danim.close();
        for (let elm of [elAnim, elIcoSet]) {
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
    'settings_Preview_Anim': function () {
        dirRA3D.close();
        dirRA3Danim.open();
        for (let elm of [elAnim, elIcoSet]) {
            if (elm === elAnim) {
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
}

settingsPreview = {
    'show model': true,
    'show scenery': true,
    'Show Skeleton': function () {
        showSkeleton();
    },
    'Show World Gizmo': function () {
        showGizmo();
    },
    'Use Angry Animation': function () {
        setAnimation('angry');
    },
    'Use Worry Animation': function () {
        setAnimation('worry');
    },
    'Use Greet Animation': function () {
        setAnimation('greet');
    },
    'Use Laugh Animation': function () {
        setAnimation('laugh');
    },
    'Use Sad Animation': function () {
        setAnimation('sad');
    },
    'Use Shy Animation': function () {
        setAnimation('shy');
    },
    'Use Fund Animation': function () {
        setAnimation('fund');
    },
    'Use Propose Animation': function () {
        setAnimation('propose');
    },
    'Use Dance Animation': function () {
        setAnimation('dance');
    },
    'use default duration': true,
    'set custom duration': 3.5,
    'modify idle weight': 0.0,
    'modify walk weight': 1.0,
    'modify run weight': 0.0,
    'modify angry weight': 0.0,
    'modify fear weight': 0.0,
    'modify greet weight': 0.0,
    'modify laugh weight': 0.0,
    'modify sad weight': 0.0,
    'modify shy weight': 0.0,
    'modify fund weight': 0.0,
    'modify propose weight': 0.0,
    'modify dance weight': 0.0,
    'modify time scale': 1.0,
    'water color': '#b8bbfc',
    'water scale': 3,
    'water flowX': 0,
    'water flowY': 0
};


// ****************************************************************************************************************** //
//                                                  v  OPTIONS  v                                                     //
// ****************************************************************************************************************** //


options = {
    "stats":getItemFlag("SETTING_STATS") === "true",
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
    scale = true;
// }


// ****************************************************************************************************************** //
//                                                v  INITIALIZE  v                                                    //
// ****************************************************************************************************************** //


function init(opt) {

    container = document.getElementById( 'a3d-container' );

    // LOAD BASE SKELETON
    if (getItemFlag("FRAME") !== "preview") {
        gltfLoadBase();
    }

    // SET CAMERA
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

    // LOAD CLOCK / SCENE
    clock = new THREE.Clock();
    scene = new THREE.Scene();

    // CHROMA KEY BG
    if (getItemFlag("FRAME") === "control") {
        $('#a3d-content-mask').hide();
        scene.background = new THREE.Color(opt.scene.bgcolor);
    }

    // ENVIRONMENT SETTINGS
    if (getItemFlag("FRAME") !== "control") {

        // fog / bg transmission
        if (opt.scene.fog) {
            scene.fog = new THREE.Fog(opt.scene.fogcolor, opt.scene.fognear, opt.scene.fogfar);
        }

        let skyMap, waterX = 300, waterY = 400, noWater = false, waterPos = [0, -3, 100];
        const waterTexture = new THREE.TextureLoader();
        let waterOptions = {
            color: '#fce1b8',
            scale: 3,
            flowSpeed: 0.00001,
            flowDirection: new THREE.Vector2(settingsA3D['Water Flow X'], settingsA3D['Water Flow Y']),
            flowMap: waterTexture.load('animat3d_textures/water/Water_1_M_Flow.jpg'),
            textureWidth: 1024,
            textureHeight: 1024
        };

        // Get water and sky
        if (getItemFlag("SETTING_ENV") === "ruins") {
            waterOptions['flowSpeed'] = 0.01;
            if (getItemFlag("FRAME") === "preview") {
                waterOptions['color'] = '#b8bbfc';
                skyMap = 'animat3d_textures/sky/night.jpg';
            }
            else {
                skyMap = 'animat3d_textures/sky/night1.jpg';
            }
        }
        else if (getItemFlag("SETTING_ENV") === "stage") {
            waterOptions['color'] = '#cdcefa';
            waterOptions['flowSpeed'] = 0.00001;
            skyMap = 'animat3d_textures/sky/night.jpg';
        }
        else if (getItemFlag("SETTING_ENV") === "island") {
            waterOptions['color'] = '#7f9498';
            waterOptions['flowSpeed'] = 0.025;
            waterOptions['scale'] = 5;
            waterX = 10000;
            waterY = 10000;
            waterPos = [2500, -22, 5000]
            skyMap = 'animat3d_textures/sky/island.jpg';
        }
        else {
            noWater = true;
            skyMap = 'animat3d_textures/sky/night.jpg';
        }

        // Create water
        if (!noWater) {
            const waterGeometry = new THREE.PlaneGeometry(waterX, waterY);
            water = new Water(waterGeometry, waterOptions);
            water.position.x = waterPos[0];
            water.position.y = waterPos[1];
            water.position.z = waterPos[2];
            water.rotation.x = Math.PI * -0.5;
            scene.add(water);
        }

        // Create background
        const textureSky = new THREE.TextureLoader();
        textureSky.load(skyMap, function(texture) {
            scene.background = texture;
        });

    }


    // omni light
    const omniLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    omniLight.position.set(0, 100, 0);
    omniLight.intensity = 0.15;
    scene.add(omniLight);

    if (getItemFlag("SETTING_ENV") === "bunker" || getItemFlag("FRAME") === "control") {
        // ambient light
        const ambientLight = new THREE.AmbientLight(0xb8bbfc, 1.337);
        scene.add(ambientLight);

        // directional light
        const dirLight = new THREE.DirectionalLight( 0xb8bbfc, 0.666);
        dirLight.position.set( -50, 30, -50 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 200;
        dirLight.shadow.camera.bottom = -200;
        dirLight.shadow.camera.left = -200;
        dirLight.shadow.camera.right = 200;
        dirLight.shadow.camera.near = 0.0001;
        dirLight.shadow.camera.far = 200;
        dirLight.shadow.bias = -0.05;
        scene.add( dirLight );
    }
    else if (getItemFlag("SETTING_ENV") === "island") {
        // ambient light
        const ambientLight = new THREE.AmbientLight(0xb8bbfc, 0.33);
        scene.add(ambientLight);

        // directional light
        const dirLight = new THREE.DirectionalLight( 0xb8bbfc, 1.337);
        dirLight.position.set( -20, 30, -50 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 200;
        dirLight.shadow.camera.bottom = -200;
        dirLight.shadow.camera.left = -200;
        dirLight.shadow.camera.right = 200;
        dirLight.shadow.camera.near = 0.0001;
        dirLight.shadow.camera.far = 200;
        dirLight.shadow.bias = -0.0001;
        scene.add( dirLight );

        // directional light
        // const dirLight2 = new THREE.DirectionalLight(0xb8bbfc, 0.66);
        // dirLight2.position.set(0, 30, -20);
        // dirLight.castShadow = true;
        // scene.add(dirLight2);
    }
    else {
        // ambient light
        const ambientLight = new THREE.AmbientLight(0xb8bbfc, 0.3);
        scene.add(ambientLight);

        // directional light
        const dirLight = new THREE.DirectionalLight(0xb8bbfc, 1);
        dirLight.position.set(0, 100, -200);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 400;
        dirLight.shadow.camera.bottom = -400;
        dirLight.shadow.camera.left = -167;
        dirLight.shadow.camera.right = 233;
        dirLight.shadow.camera.near = 0.001;
        dirLight.shadow.camera.far = 400;
        dirLight.shadow.bias = -0.065;
        scene.add(dirLight);
    }

    // light helper
    // helper = new THREE.CameraHelper(dirLight.shadow.camera)
    // scene.add(helper);

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


    // world loading
    if (getItemFlag("FRAME") !== "control") {
        const worldLoader = new GLTFLoader();

        // Desert Ruins
        if (getItemFlag("SETTING_ENV") === "ruins") {
            worldLoader.load('./animat3d_objects/scenes/ruins.a3d', function (gltf) {

                world = gltf.scene;

                // allow to cast shadow
                world.traverse(function (object) {
                    if (object.isMesh) {
                        object.castShadow = opt.light.shadow;
                        object.receiveShadow = opt.light.shadow;
                        object.material.transparency = true;
                        // object.material.opacity = 1;
                    }
                });

                world.position.x = 0;
                world.position.y = -16.2;
                world.position.z = 300;

                world.rotation.x = 0;
                world.rotation.y = 180 * degree;
                world.rotation.z = 0;

                scene.add(world);

            });
        }
        // Ice Stage (Default)
        else if (getItemFlag("SETTING_ENV") === "stage" || getItemFlag("SETTING_ENV") === "" || getItemFlag("SETTING_ENV") === null) {
            worldLoader.load('./animat3d_objects/scenes/stage.a3d', function (gltf) {

                world = gltf.scene;

                world.traverse(function (object) {
                    if (object.isMesh) {
                        object.receiveShadow = opt.light.shadow;
                        object.material.transparency = true;
                    }
                });

                world.position.x = -23;
                world.position.y = -35.7;
                world.position.z = 20;

                world.rotation.x = 0;
                world.rotation.y = 110 * degree;
                world.rotation.z = 0;
                world.scale.set(1.2 / inch, 1.2 / inch, 1.2 / inch);

                scene.add(world);

            });
        }
        // Cyber Bunker
        else if (getItemFlag("SETTING_ENV") === "bunker") {
            worldLoader.load('./animat3d_objects/scenes/bunker.a3d', function (gltf) {

                world = gltf.scene;

                world.traverse(function (object) {
                    if (object.isMesh) {
                        object.castShadow = opt.light.shadow;
                        object.receiveShadow = opt.light.shadow;
                        // object.material.transparency = true;
                    }
                });

                world.position.x = -58;
                world.position.y = -0.5;
                world.position.z = 20;

                world.rotation.x = 0;
                world.rotation.y = 200 * degree;
                world.rotation.z = 0;
                // world.scale.set(1 / inch, 1 / inch, 1 / inch);

                scene.add(world);

            });
        }
        // Tropical Island
        else if (getItemFlag("SETTING_ENV") === "island") {
            worldLoader.load('./animat3d_objects/scenes/island.a3d', function (gltf) {

                world = gltf.scene;

                world.traverse(function (object) {
                    if (object.isMesh) {
                        object.castShadow = opt.light.shadow;
                        object.receiveShadow = opt.light.shadow;
                        // object.material.transparency = true;
                    }
                });

                world.position.x = -55;
                world.position.y = -33;
                world.position.z = 66;

                scene.add(world);

            });
        }

    }

    // Character Loader
    if (getItemFlag("FRAME") === "preview") {

        // PRINCESS KARA
        setTimeout(function (){
            loadGLTF( `./animat3d_objects/chars/kara.a3d`, 11, .75, [-33,0,0], [0,22,0], opt.light.shadow, "Char");
        }, 5000)

    }
    else {

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

    }


    // debug
    // if (opt.debug) {
        // world gizmo
        // gizmo = new THREE.AxesHelper(opt.gizmo);
        // gizmo.position.set(-33, 0.2, 0);
        // scene.add(gizmo);

        // light helper
        // helper = new THREE.CameraHelper(dirLight.shadow.camera);
        // scene.add(helper);

        // disable
        // showGizmo( false );
    // }

    // load stats
    if (getItemFlag("SETTING_STATS") === "true" || getItemFlag("FRAME") === "preview") {
        stats1 = new Stats();
        stats1.showPanel(0); // Panel 0 = fps
        stats1.domElement.style.cssText = 'position:absolute;top:32px;right:0px;padding-right:2%;';
        // document.body.appendChild(stats1.domElement);

        stats2 = new Stats();
        stats2.showPanel(1); // Panel 1 = ms
        stats2.domElement.style.cssText = 'position:absolute;top:32px;right:80px;padding-right:2%;';
        // document.body.appendChild(stats2.domElement);

        stats3 = new Stats();
        stats3.showPanel(2); // Panel 2 = vram
        stats3.domElement.style.cssText = 'position:absolute;top:32px;right:160px;padding-right:2%;';
        // document.body.appendChild(stats3.domElement);

        // stats = new Stats();
        const containerStats = document.getElementById('a3d-stat-container');
        containerStats.appendChild(stats1.domElement);
        containerStats.appendChild(stats2.domElement);
        containerStats.appendChild(stats3.domElement);
    }

    // renderer
    if (getItemFlag("SETTING_MSAA") === "true") {
        renderer = new THREE.WebGLRenderer({antialias: true, samples: 4});
    }
    else {
        renderer = new THREE.WebGLRenderer();
    }
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // softer shadows
    renderer.shadowMap.enabled = opt.light.shadow;


    const target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
    });

    // build page
    container.appendChild( renderer.domElement );


    const renderPass = new RenderPass( scene, camera );
    const gammaPass =  new ShaderPass( GammaCorrectionShader );

    // SETTING FXAA
    if (getItemFlag("SETTING_FXAA") === "true") {
        const pixelRatio = renderer.getPixelRatio();
        fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.material.uniforms['resolution'].value.x = 1 / (container.offsetWidth * pixelRatio);
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (container.offsetHeight * pixelRatio);

        composer = new EffectComposer(renderer, target);
        composer.addPass(gammaPass);
        composer.addPass(renderPass);
        composer.addPass(fxaaPass);
    }
    // SETTING MSAA
    else if (getItemFlag("SETTING_MSAA") === "true") {
        composer = new EffectComposer(renderer);
        composer.addPass(gammaPass);
        composer.addPass(renderPass);
    }
    // SETTING SSAA
    else if (getItemFlag("SETTING_SSAA") === "true") {
        ssaaPass = new SSAARenderPass( scene, camera );
        composer = new EffectComposer(renderer, target);
        composer.setPixelRatio( 1 ); // ensure pixel ratio is always 1 for performance reasons
        composer.addPass(gammaPass);
        composer.addPass(renderPass);
        composer.addPass(ssaaPass);
    }
    // SETTING NO AA
    else {
        const copyPass = new ShaderPass( CopyShader );
        composer = new EffectComposer(renderer, target);
        composer.addPass(gammaPass);
        composer.addPass(renderPass);
        composer.addPass(copyPass);
    }


    // add resize event
    window.addEventListener( 'resize', onWindowResize );

    // control panel
    if (getItemFlag("FRAME") === "editor") {
        objectPanel(getItemFlag("FRAME"));
    }
    else if (getItemFlag("FRAME") === "preview") {
        // world gizmo
        gizmo = new THREE.AxesHelper(10);
        gizmo.position.set(-33, 0.5, 0);
        scene.add(gizmo);
        objectPanel(getItemFlag("FRAME"));
    }

}


// ****************************************************************************************************************** //
//                                            v  SETTINGS FUNCTIONS  v                                                //
// ****************************************************************************************************************** //


function showModel() {
    if (getItemFlag("FRAME") === "preview") {
        scene.getObjectByName("CHAR").visible = !scene.getObjectByName("CHAR").visible;
    } else {
        let models = [
            scene.getObjectByName("BODY"),
            scene.getObjectByName("FACE"),
            scene.getObjectByName("HAIR"),
            scene.getObjectByName("HORN")
        ];
        models.forEach(function (model) {
            model.visible = !model.visible;
        });
    }
}

function showSkeleton() {
    skeleton.visible = !skeleton.visible;
}

function showGizmo() {
    gizmo.visible = !gizmo.visible;
    // helper.visible = visibility;
}

function showScenery() {
    if (world.visible) {
        world.visible = false;
        if (getItemFlag("SETTING_ENV") === "stage" || getItemFlag("SETTING_ENV") === "ruins") {
            water.visible = false;
        }
    }
    else {
        world.visible = true;
        if (getItemFlag("SETTING_ENV") === "stage" || getItemFlag("SETTING_ENV") === "ruins") {
            water.visible = true;
        }
    }
}

function showStats()  {
    let visibility = `#a3d-stat-container`;
    $(visibility).toggle()
}

function showStore() {
    $('#a3d-store').fadeToggle();
}

function storeUserInfo() {
    let user_coins = getItemFlag("USER_COINS");
    let user_vip = getItemFlag("USER_VIP");

    let string = `<img src="https://valkyteq.com/avatars/${uid}.jpg" alt="${n}" style="width: 32px; height: 32px;">${n} ?? <span style="color: #ffd700;"><span id="coins">${user_coins}</span> ???<i class="fas fa-coins"></i></span>`;
    let stringVip;

    if (user_vip === "true") {
        stringVip = `<li class="nav-item"><a class="nav-link" href="#" style="color: #ffd700;" disabled="true"><i class="fal fa-crown mr-2"></i> VIP Account</a></li>`;
    } else {
        stringVip = ``;
    }

    $('#user-chip').html('');
    $('#user-vip').html('');
    $('#user-chip').html(string);
    $('#user-vip').html(stringVip);
}

function storeUpdate() {

    let btnItemIDs = [];
    let btnSetIDs = [];

    let styledItemBody = '';
    let styledItemFace = '';
    let styledItemHair = '';
    let styledItemHorn = '';
    let styledItemAnim = '';
    let styledItemSets = '';

    // Get Items
    arrs.forEach(function (arr) {
        arr.forEach(function (item) {

            let unlocks = getItemFlag("USER_UNLOCKS");
            if (unlocks.includes(item.id)) return;
            if ((item.tradable).toString() === "0") return;
            if (getItemFlag("USER_VIP") === "true" && (item.tradable).toString() === "2") return;

            btnItemIDs.push(item.id)
            settingsA3Dbuy[`store${item.id}`] = function() {
                buyEquipment(item);
            }

            switch (item.category.toLowerCase()) {
                case "body":
                    styledItemBody += styleStoreItem(item, "store");
                    break;
                case "face":
                    styledItemFace += styleStoreItem(item, "store");
                    break;
                case "hair":
                    styledItemHair += styleStoreItem(item, "store");
                    break;
                case "horn":
                    styledItemHorn += styleStoreItem(item, "store");
                    break;
                case "anim":
                    styledItemAnim += styleStoreItem(item, "store");
                    break;
            }

        })
    })

    // Get Sets
    arrSets.forEach(function (item) {

        // let unlocks = getItemFlag("USER_UNLOCKS");
        // if (unlocks.includes(item.id)) return;
        if ((item.tradable).toString() === "0") return;
        if (getItemFlag("USER_VIP") === "true" && (item.tradable).toString() === "2") return;

        btnSetIDs.push(item.id)
        settingsA3Dbuy[`sets${item.id}`] = function() {
            buyEquipment(item);
        }

        styledItemSets += styleStoreSet(item, "sets");

    })

    // Fill Categories
    $('#store-cat-body').html(styledItemBody !== "" ? styledItemBody : SHOP_IMG)
    $('#store-cat-face').html(styledItemFace !== "" ? styledItemFace : SHOP_IMG)
    $('#store-cat-hair').html(styledItemHair !== "" ? styledItemHair : SHOP_IMG)
    $('#store-cat-horn').html(styledItemHorn !== "" ? styledItemHorn : SHOP_IMG)
    $('#store-cat-anim').html(styledItemAnim !== "" ? styledItemAnim : SHOP_IMG)
    $('#store-cat-sets').html(styledItemSets !== "" ? styledItemSets : SHOP_IMG)

    // Bind function to buy buttons
    btnItemIDs.forEach(function (id) {
        let buyBtn = $(`#store${id}`)
        buyBtn.on("click", settingsA3Dbuy[`store${id}`])
    })

    // Bind function to buy buttons
    btnSetIDs.forEach(function (id) {
        let buyBtn = $(`#sets${id}`)
        buyBtn.on("click", settingsA3Dbuy[`sets${id}`])
    })

}

function updateItem(item) {

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
        case "Anim":
            arrAnim.push(item)
            listAnim[item.name] = function () {
                // updateEquipment(item)
                // removeEntity(item.category);
                // addEntity(item);
                setTimeout(function () {
                    setAnimation(item.name);
                }, 100);
            }
            settingsDummy[item.name] = function () {};
            break;
    }

}

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
    vteqADI("set", equipment)
}


function buyEquipment( item ) {

    if (item.price !== 99999) {
        let buyTitle = `<div class="item_grade_${item.grade}">${item.name_en} (${rarity[item.grade]})</div><div class="hr_grade_${item.grade}">`;
        let buyMessage = `You really want to unlock ${item.name_en}?<br>Cost: <span class="item_price"> ${item.price} ???</span>`;
        doConfirm(
            buyTitle,
            buyMessage,
            function yes() {
                vteqADI("buy", item.id)
            },
            function no() {
                // Do nothing
                console.log("????????? ???( ???-??????)")
            });
    } else {
        window.open('https://valkyteq.com/vip/', '_blank').focus();
    }

}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );

    if (getItemFlag("SETTING_FXAA") === "true") {
        const pixelRatio = renderer.getPixelRatio();

        fxaaPass.material.uniforms['resolution'].value.x = 1 / (container.offsetWidth * pixelRatio);
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (container.offsetHeight * pixelRatio);
    }
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


function userDataUpdateBase(obj) {
    if (obj.coins) {
        userCoins = obj.coins;
        setItemFlag("USER_COINS", userCoins);
    }
    if (obj.vip) {
        userVip = obj.vip;
        setItemFlag("USER_VIP", userVip);
    }
    if (obj.unlocks) {
        userUnlocks = obj.unlocks;
        setItemFlag("USER_UNLOCKS", userUnlocks);
    }
}


// ****************************************************************************************************************** //
//                                                v  ITEM PANEL  v                                                    //
// ****************************************************************************************************************** //

/**
 * @param {Object} item
 * @param {string} type
 * @return {string} html
 * */
function styleStoreItem (item, type) {

    let info = '';

    // Decide if VIP, Exclusive or ??? Coins
    let amount;
    switch (item.tradable) {
        case 1:
            amount = item.price + ' ???';
            break;
        case 2:
            amount = 'VIP Membership';
            break;
        case 3:
            amount = 'Exclusive';
            break;
    }

    // Design Item Block Info (right)
    let itemName = `<div class="item_grade_${item.grade}">${item.name_en} (${rarity[item.grade]})</div>`;
    let itemDesc = `<div class="hr_grade_${item.grade}"></div>${item.desc_en}`;
    let itemPrice = `Unlock ${item.name_en} with: <span class="item_price">${amount}</span>`;
    let itemBuy = `<button class="btn btn-sm a3d-btn" id="${type}${item.id}">Unlock</button>`;

    // Design Item Block Image (left)
    let itemImg = `
                        <div class="icon_grade_${item.grade}" style="width: 132px;height: 132px;">
                            <img src="https://valkyteq.com/static/${item.icon}" alt="${item.name}" width="128" height="128">
                        </div>
                    `;

    // Put Design Block Together
    let itemInfoL = `<div class="a3d-modal-body-l-cnt">${itemImg}</div>`;
    let itemInfoR = `<div class="a3d-modal-body-m-cnt">${itemName}${itemDesc}<br><br>${itemPrice}<br>${itemBuy}</div>`;

    // Add Item To List
    info += `<br id="br${type}${item.id}"><div class="a3d-block" id="block${type}${item.id}">${itemInfoL}${itemInfoR}</div>`;

    return info;

}

/**
 * @param {Object} item
 * @param {string} type
 * @return {string} html
 * */
function styleStoreSet (item, type) {

    let info = '';

    // Decide if VIP, Exclusive or ??? Coins
    let amount;
    switch (item.tradable) {
        case 1:
            amount = item.price + ' ???';
            break;
        case 2:
            amount = 'VIP Membership';
            break;
        case 3:
            amount = 'Exclusive';
            break;
    }

    // Design Item Block Info (right)
    let itemName = `<div class="item_grade_${item.grade}">${item.set_name_en} (${rarity[item.grade]})</div>`;
    let itemDesc = `<div class="hr_grade_${item.grade}"></div>${item.set_desc_en}`;
    let itemPrice = `Unlock ${item.set_name_en} with: <span class="item_price">${amount}</span>`;
    let itemBuy = `<button class="btn btn-sm a3d-btn" id="${type}${item.id}">Unlock</button>`;

    // Design Item Block Image (left)
    let itemImg = `
                        <div class="icon_grade_${item.grade}" style="width: 132px;height: 132px;">
                            <img src="https://valkyteq.com/static/${item.icon}" alt="${item.name}" width="128" height="128">
                        </div>
                    `;

    // Put Design Block Together
    let itemInfoL = `<div class="a3d-modal-body-l-cnt">${itemImg}</div>`;
    let itemInfoR = `<div class="a3d-modal-body-m-cnt">${itemName}${itemDesc}<br><br>${itemPrice}<br>${itemBuy}</div>`;

    // Add Item To List
    info += `<br id="br${type}${item.id}"><div class="a3d-block" id="block${type}${item.id}">${itemInfoL}${itemInfoR}</div>`;

    return info;

}

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
    else if (item.tradable === 1 && getItemFlag("USER_UNLOCKS").includes(item.id)) {
        shop = false;
    }
    else shop = !(item.tradable === 2 && getItemFlag("USER_VIP") === "true");

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
        case "Anim":
            size = '70px';
            posi = '50% 50%';
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
    element.domElement.children[0].children[0].innerText = "??";
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
    const image = `<div class="icon_grade_${item.grade}"><img src='${previewImage}' alt="${item.name}" width="254px"/></div>`;
    const descRarity = `<div class="item_grade_${item.grade}">${rarity} ${item.category}</div>`;

    // Decide if VIP, Exclusive or ??? Coins
    let price = '';
    if (shop) {
        let amount;
        switch (item.tradable) {
            case 1:
                amount = item.price + ' ???';
                break;
            case 2:
                amount = 'VIP Membership';
                break;
            case 3:
                amount = 'Exclusive';
                break;
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
    // if (item === "anim") {
    //     cssController.width = '70px';
    //     cssController.height = '70px';
    // } else {
        cssController.width = '50px';
        cssController.height = '50px';
    // }

    // widget
    element.domElement.children[0].style = "";
    let cssWidget = element.domElement.children[0].style;
    cssWidget.backgroundImage = `url(https://valkyteq.com/static/icons/misc/icon_cat_${item}.jpg)`;
    cssWidget.backgroundRepeat = 'no-repeat';
    cssWidget.backgroundPosition = '50% 50%';
    cssWidget.backgroundColor = 'transparent';
    cssWidget.display = 'inline-block';
    cssWidget.margin = '3.5px';
    // if (item === "anim") {
    //     cssWidget.backgroundSize = '70px';
    //     cssWidget.width = '70px';
    //     cssWidget.height = '70px';
    // } else {
        cssWidget.backgroundSize = '50px';
        cssWidget.width = '50px';
        cssWidget.height = '50px';
    // } else {
    //     cssWidget.backgroundSize = '70px';
    //     cssWidget.width = '50px';
    //     cssWidget.height = '50px';
    // }

    // button
    element.domElement.children[0].children[0].style = "";
    element.domElement.children[0].children[0].innerText = "??";
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
    // if (item === "anim") {
    //     css.backgroundImage = `url(https://valkyteq.com/static/icons/misc/icon_setting_32.png)`;
    //     css.backgroundColor = 'transparent';
    //     css.borderColor = '#0094FF';
    //     css.width = '70px';
    //     css.height = '70px';
    // } else {
        css.width = '50px';
        css.height = '50px';
    // }

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


function objectPanel(frame) {

    //
    // LIL GUI
    // ============================
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
    cssPanelR.marginLeft = 'auto';
    cssPanelR.marginRight = '0';
    cssPanelR.alignSelf = 'right';
    cssPanelR.alignContent = 'right';
    cssPanelR.alignItems = 'right';



    //
    // Right Panel
    // ===============

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

    // Char Settings Items
    dirRA3Danim = panelR.addFolder( 'Character Animations' );
    // dirRA3Dsave.domElement.style = "";
    let cssdirRA3Danim = dirRA3Danim.domElement.style;
    cssdirRA3Danim.backgroundColor = 'transparent';
    cssdirRA3Danim.width = '100%';
    cssdirRA3Danim.paddingLeft = '40%';
    cssdirRA3Danim.verticalAlign = 'right';
    cssdirRA3Danim.textAlign = 'right';
    cssdirRA3Danim.alignSelf = 'right';
    cssdirRA3Danim.alignContent = 'right';
    cssdirRA3Danim.alignItems = 'right';



    //
    // PREVIEW PANEL
    // ============================
    if (frame === "preview") {

        // Hide elements
        cssdirRTitle.display = 'none';
        cssdirRChar.display = 'none';
        cssdirRA3Dsave.display = 'none';


        // 3D Engine Settings
        let setModel = dirRA3D.add( settingsA3D, 'Show Model' );
        stylePanelSetting(setModel)
        let setSkel = dirRA3D.add( settingsPreview, 'Show Skeleton' );
        stylePanelSetting(setSkel)
        let setGizmo = dirRA3D.add( settingsPreview, 'Show World Gizmo' );
        stylePanelSetting(setGizmo)
        let setScene = dirRA3D.add( settingsA3D, 'Show Scenery' );
        stylePanelSetting(setScene)
        let elSetStat = dirRA3D.add( settingsA3D, 'Show Engine Stats' );
        stylePanelSetting(elSetStat)
        let elSetSync = dirRA3D.add( settingsA3D, 'Sync Animation' );
        stylePanelSetting(elSetSync)

        // Dynamic Water Setting
        if (getItemFlag("SETTING_ENV") === "ruins" || getItemFlag("SETTING_ENV") === "stage") {
            dirRA3D.addColor(settingsPreview, 'water color').onChange(function (value) {
                water.material.uniforms['color'].value.set(value);
            });
            dirRA3D.add(settingsPreview, 'water scale', 1, 10).onChange(function (value) {
                water.material.uniforms['config'].value.w = value;
            });
        }

        // Get all Animations
        arrAnim.forEach(function (item) {
            if (anim.castanic.kid.mid[item.name]) {
                let button = dirRA3Danim.add(listAnim, item.name);
                stylePanelBtn(button, item)
            }
        })

        // Set icons for titles
        elIcoSet = dirRTitleSet.add( settingsA3D, 'settings_Preview' );
        stylePanelDir(elIcoSet, 'set', 'Animat3D Settings', false);
        elAnim = dirRTitleSet.add( settingsA3D, 'settings_Preview_Anim' );
        stylePanelDir(elAnim, 'anim', 'Preview Animations', true);

        // Show / hide dirs
        dirRA3D.close();
        dirRA3Danim.open();

        // Blend in content
        $('.preview-content').fadeIn();

    }



    //
    // EDITOR PANEL
    // ============================
    else if (frame === "editor") {

        // Arrays for rarity sorting
        let rar1 = [], rar2 = [], rar3 = [], rar4 = [], rar5 = [], rar6 = [];
        let rars = [
            rar1, rar2, rar3, rar4, rar5, rar6
        ];

        /** Sort Rarity
         * -------------------
         * Private function to sort items by rarity
         * @param {{}} item
         * @private
         */
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

        // Hide Elements
        cssdirRA3Danim.display = 'none';
        $('.content-bg-l').innerHTML = '';

        // 3D Engine Settings
        let setModel = dirRA3D.add(settingsA3D, 'Show Model');
        stylePanelSetting(setModel)
        let setScene = dirRA3D.add(settingsA3D, 'Show Scenery');
        stylePanelSetting(setScene)
        if (getItemFlag("SETTING_STATS") === "true") {
            let elSetStat = dirRA3D.add(settingsA3D, 'Show Engine Stats');
            stylePanelSetting(elSetStat)
        }

        // Character Settings
        let elSetStore = dirRA3Dsave.add(settingsA3D, 'Animat3D Store');
        stylePanelSetting(elSetStore)
        let elSetSave = dirRA3Dsave.add(settingsA3D, 'Save Character');
        stylePanelSetting(elSetSave)
        let elSetSync = dirRA3Dsave.add(settingsA3D, 'Sync Animation');
        stylePanelSetting(elSetSync)

        // Set icons for categories - right
        elIcoChar = dirRTitle.add(settingsDummy, 'body');
        stylePanelDir(elIcoChar, 'char', 'Current Equiped Character Items', true);
        elIcoSet = dirRTitleSet.add(settingsA3D, 'settings');
        stylePanelDir(elIcoSet, 'set', 'Animat3D Settings', false);
        elIcoSave = dirRTitleSet.add(settingsA3D, 'save_char');
        stylePanelDir(elIcoSave, 'set_char', 'Character Settings', true);


        // show / hide
        dirRA3D.close();
        dirRA3Dsave.open();


        // ========================================================================================================== //


        //
        // Left Panel
        // ===============

        const panel = new GUI( {  } );
        panel.domElement.classList.add("fixed-bottom");
        panel.domElement.classList.add("content-l");
        let cssPanel = panel.domElement.style;
        cssPanel.backgroundColor = 'transparent';
        cssPanel.width = '30%';
        cssPanel.height = '100%';
        cssPanel.padding = '2%';
        cssPanel.overflow = 'auto';

        const dirA3D = panel.addFolder( '3D Model Categories' );
        let cssdirA3D = dirA3D.domElement.style;
        cssdirA3D.backgroundColor = 'transparent';
        cssdirA3D.width = '80%';
        cssdirA3D.paddingTop = '65px';

        dirFace = panel.addFolder( 'Face' );
        let cssdirFace = dirFace.domElement.style;
        cssdirFace.backgroundColor = 'transparent';
        cssdirFace.width = '80%';
        cssdirFace.overflow = 'auto';

        dirHair = panel.addFolder( 'Hair' );
        let cssdirHair = dirHair.domElement.style;
        cssdirHair.backgroundColor = 'transparent';
        cssdirHair.width = '80%';
        cssdirHair.overflow = 'auto';

        dirHorn = panel.addFolder( 'Horn' );
        let cssdirHorn = dirHorn.domElement.style;
        cssdirHorn.backgroundColor = 'transparent';
        cssdirHorn.width = '80%';
        cssdirHorn.overflow = 'auto';

        dirBody = panel.addFolder( 'Body' );
        let cssdirBody = dirBody.domElement.style;
        cssdirBody.backgroundColor = 'transparent';
        cssdirBody.width = '80%';
        cssdirBody.overflow = 'auto';

        dirAnim = panel.addFolder( 'Animation' );
        let cssdirAnim = dirAnim.domElement.style;
        cssdirAnim.backgroundColor = 'transparent';
        cssdirAnim.width = '80%';
        cssdirAnim.overflow = 'auto';


        // Set icons for categories - left
        elHorn = dirA3D.add( settingsA3D, 'horn' );
        stylePanelDir(elHorn, 'horn', 'Show All Horns', false);
        elHair = dirA3D.add( settingsA3D, 'hair' );
        stylePanelDir(elHair, 'hair', 'Show All Hairstyles', true);
        elFace = dirA3D.add( settingsA3D, 'face' );
        stylePanelDir(elFace, 'face', 'Show All Faces', false);
        elBody = dirA3D.add( settingsA3D, 'body' );
        stylePanelDir(elBody, 'body', 'Show All Costumes', false);
        elAnim = dirA3D.add( settingsA3D, 'animation' );
        stylePanelDir(elAnim, 'anim', 'Show All Animations', false);


        // Gather all items for sorting
        dirs = {
            'Face':dirFace,
            'Hair':dirHair,
            'Horn':dirHorn,
            'Body':dirBody,
            'Anim':dirAnim
        }
        lists = {
            'Face':listFace,
            'Hair':listHair,
            'Horn':listHorn,
            'Body':listBody,
            'Anim':listAnim
        }
        arrs = [
            arrFace,
            arrHair,
            arrHorn,
            arrBody,
            arrAnim
        ];

        // Sort Items for rarity
        arrs.forEach(function (arr) {
            arr.forEach(function (item) {
                _sortRarity(item, false);
            })
        })

        // Put all gathered items in its category dir
        rars.forEach(function (rarity) {
            rarity.forEach(function (rarityItem) {


                // Put item in correct category on left panel
                let button = dirs[rarityItem.category].add(lists[rarityItem.category], rarityItem.name);
                stylePanelBtn(button, rarityItem)


                // Check if item is currently equipped and add it to
                // the character items bar on the right panel
                // NOTE: animation icons added above ^
                if (rarityItem.id.toString().substring(0,2) === "10" && rarityItem.id.toString().substring(2) === s[0]) {
                    elCharBody = dirRChar.add(settingsDummy, rarityItem.name);
                    stylePanelBtn(elCharBody, rarityItem)
                }
                else if (rarityItem.id.toString().substring(0,2) === "20" && rarityItem.id.toString().substring(2) === s[1]) {
                    elCharFace = dirRChar.add(settingsDummy, rarityItem.name);
                    stylePanelBtn(elCharFace, rarityItem)
                }
                else if (rarityItem.id.toString().substring(0,2) === "30" && rarityItem.id.toString().substring(2) === s[2]) {
                    elCharHair = dirRChar.add(settingsDummy, rarityItem.name);
                    stylePanelBtn(elCharHair, rarityItem)
                }
                else if (rarityItem.id.toString().substring(0,2) === "40" && rarityItem.id.toString().substring(2) === s[3]) {
                    elCharHorn = dirRChar.add(settingsDummy, rarityItem.name);
                    stylePanelBtn(elCharHorn, rarityItem)
                }


            })
        })


        // show / hide
        dirA3D.open();
        dirHorn.close();
        dirHair.open();
        dirFace.close();
        dirBody.close();
        dirAnim.close();

    }

    // Item Category highlight switch
    $('.title').css('display', 'none');

}


// ****************************************************************************************************************** //
//                                            v  ANIMAT3D FUNCTIONS  v                                                //
// ****************************************************************************************************************** //


/** Load GLTF Base
 * -------------------
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


/** Set Animation
 * -------------------
 * Set Animation Clip to play
 * @param {string|number} clip
 */
function setAnimation(clip) {

    if (getItemFlag("FRAME") !== "preview") {
        if (anim.castanic.female.fast[clip]) {
            let id = 0;
            animController.forEach(function (animControl) {
                let idleAction = animControl.clipAction(animationSkeleton[anim.castanic.female.fast['idle']]);
                let eventAction = animControl.clipAction(animationSkeleton[Number(anim.castanic.female.fast[clip])]);
                animControl.timeScale = .5;
                animationFading(eventAction, idleAction, animControl);
                id++;
            });
        }
        else if (anim.castanic.female.mid[clip]) {
            let id = 0;
            animController.forEach(function (animControl) {
                let idleAction = animControl.clipAction(animationSkeleton[anim.castanic.female.fast['idle']]);
                let eventAction = animControl.clipAction(animationSkeleton[Number(anim.castanic.female.mid[clip])]);
                animControl.timeScale = .75;
                animationFading(eventAction, idleAction, animControl);
                id++;
            });
        }
        else if (anim.castanic.female.slow[clip]) {
            let id = 0;
            animController.forEach(function (animControl) {
                let idleAction = animControl.clipAction(animationSkeleton[anim.castanic.female.fast['idle']]);
                let eventAction = animControl.clipAction(animationSkeleton[Number(anim.castanic.female.slow[clip])]);
                animControl.timeScale = 1;
                animationFading(eventAction, idleAction, animControl);
                id++;
            });
        }
    }
    else {
        if (anim.castanic.kid.mid[clip]) {
            let id = 0;
            animController.forEach(function (animControl) {
                let gltfControl = gltfController[id];
                let idleAction = animControl.clipAction(gltfControl.animations[anim.castanic.kid.mid['idle']]);
                let eventAction = animControl.clipAction(gltfControl.animations[Number(anim.castanic.kid.mid[clip])]);
                animControl.timeScale = .75;
                animationFading(eventAction, idleAction, animControl);
                id++;

            });
        }
    }

}


/** Load GLTF Model
 * -------------------
 * Load a 3D model and set its animation,
 * position and rotation
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

        if (getItemFlag("FRAME") !== "preview") {
            mixer.clipAction(animationSkeleton[clip]).play();
        }
        else {
            mixer.clipAction(gltf.animations[clip]).play();
            // load the skeleton rig
            skeleton = new THREE.SkeletonHelper( model );
            skeleton.visible = false;
            scene.add( skeleton );
        }

        mixer.timeScale = speed
        model.name = type.toUpperCase();

        model.position.x = position[0];
        model.position.y = position[1];
        model.position.z = position[2];

        model.rotation.x = rotation[0] * degree;
        model.rotation.y = rotation[1] * degree;
        model.rotation.z = rotation[2] * degree;

        if (getItemFlag("FRAME") !== "preview") {
            model.scale.set(1 / inch, 1 / inch, 1 / inch);
        }

        if (type === "Hair") {
            const matAmount = model.children[1].children.length;
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


/** Add Entity
 * -------------------
 * Load a new item and add it to the scene
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


/** Remove Entity
 * -------------------
 * Remove an existing item based on its name
 * @param name
 */
function removeEntity(name) {
    let selectedObject = scene.getObjectByName(name.toUpperCase());
    scene.remove( selectedObject );
}


/** Animation Fading
 * -------------------
 * Fade animation from idle to event back to idle
 * @param eventAction
 * @param idleAction
 * @param mixer
 */
function animationFading( eventAction, idleAction, mixer ) {
    if (eventAction === idleAction) {
        let speed;
        if (getItemFlag("FRAME") === "preview") {
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
                if (getItemFlag("FRAME") === "preview") {
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


/** Animat3D
 * -------------------
 * Start the 3D Web Engine
 */
function animat3d() {

    requestAnimationFrame( animat3d );

    const delta = clock.getDelta();

    for ( const mixer of animController ) {
        mixer.update(delta);
    }

    if (getItemFlag("SETTING_STATS") === "true" || getItemFlag("FRAME") === "preview") {
        for (let stats of [stats1, stats2, stats3]) {
            stats.update();
        }
    }

    if (getItemFlag("SETTING_SSAA") === "true") {
        ssaaPass.sampleLevel = samples;
        ssaaPass.unbiased = true;
    }

    composer.render(scene, camera);
    // renderer.render( scene, camera );

}


// ****************************************************************************************************************** //
//                                                v    -R-U-N-    v                                                   //
// ****************************************************************************************************************** //



console.log(`Animat3D Loader        : ${getItemFlag("FRAME").toUpperCase()}`);

// Get API Data
if (getItemFlag("FRAME") === "preview") {
    showStats();
    vteqADI("pre", null);
}
else if (getItemFlag("FRAME") === "store") {
    vteqADI("get", null);
}
else if (getItemFlag("FRAME") === "control") {
    vteqADI("get", null);
    vteqADI("event", null);
}
else {
    vteqADI("get", null);
}


// FRAMES
if (getItemFlag("FRAME") === "store") {

    $('#sidebar-info').html(SHOP_INFO);

    setTimeout(function () {
        storeUserInfo();
        storeUpdate();

        $('#a3d-content-mask').hide();
        $('#loading-screen').fadeOut()

        showStore();
    }, 1337);

} else {

    // Anti Aliasing
    if (getItemFlag("SETTING_SSAA") === "true") {
        // TODO: Fix this workaround to fully support SSAA
        //       with every frame, not only Twitch controls
        //       Please note, the Cyber Bunker would support
        //       high SSAA samples too.
        if (getItemFlag("FRAME") !== "control") {
            setItemFlag("SETTING_SSAA_SAMPLE", "0");
        }
        switch (Number(getItemFlag("SETTING_SSAA_SAMPLE"))) {
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
    }

    // Wait until everything is done loading:
    // ~2 sec for handling API data
    // ~5 sec for loading 3D data
    setTimeout(function () {
        if (getItemFlag("FRAME") !== "preview") {
            $('#sidebar-info').html(SHOP_INFO);
            storeUserInfo();
            storeUpdate();
        }
        animat3d();
    }, 7000);
}
