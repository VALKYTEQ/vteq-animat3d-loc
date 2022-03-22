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
import * as THREE from '../animat3d_modules/build/three.module.js';
import { GLTFLoader } from '../animat3d_modules/loaders/GLTFLoader.js';
import * as SkeletonUtils from '../animat3d_modules/utils/SkeletonUtils.js';
// import {GUI} from "../animat3d_modules/libs/lil-gui.module.min.js";
import Stats from '../animat3d_modules/libs/stats.module.js';
// import { Water } from '../animat3d_modules/objects/Water2.js';
import { EffectComposer } from '../animat3d_modules/postprocessing/EffectComposer.js';
import { RenderPass } from '../animat3d_modules/postprocessing/RenderPass.js';
import { ShaderPass } from '../animat3d_modules/postprocessing/ShaderPass.js';
import { CopyShader } from '../animat3d_modules/shaders/CopyShader.js';
import { FXAAShader } from '../animat3d_modules/shaders/FXAAShader.js';
import {GammaCorrectionShader} from "../animat3d_modules/shaders/GammaCorrectionShader.js";


console.log(`Animat3D Version       : public@^0.9.7c`);

let itemFlags = {
    "AA":false,
    "MSAA":getItemFlag("SETTING_MSAA"),
    "FXAA":getItemFlag("SETTING_FXAA"),
    "SSAA":getItemFlag("SETTING_SSAA")
};

for (let [key, val] of Object.entries(itemFlags)) {
    if (val === "true") {
        itemFlags['AA'] = true;
        console.log(`Anti Aliasing          : ${key}`)
    }
}
if (!itemFlags['AA']) console.log(`Anti Aliasing          : OFF`)

let camera, scene, renderer;
let stats1, stats2, stats3;
let clock, character, settingsA3D;

let userCoins, userVip, userUnlocks;

let arrHair = [];
let arrFace = [];
let arrHorn = [];
let arrBody = [];
let listHair = {};
let listFace = {};
let listHorn = {};
let listBody = {};

let scale;

let options, optionsCastaFem, optionsCastaKid;
let composer, fxaaPass, container;

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


// get url params
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
const p = 50000;
// // const m = getUrlParameter('m') ? getUrlParameter('m') !== "Develop" : "custom";
// const m = getUrlParameter('m');
// const u = getUrlParameter('u').replaceAll("%20", " ");
// const uid = u.split("-")[0];
// // const n = u.split("-")[1];
// const s = u.split("-")[2].split("x");
// // const t = u.split("-")[3];
// const x = getUrlParameter('s');



const m = getItemFlag("CHAR_NAME");
const u = getItemFlag("USER");
const n = getItemFlag("USER_NAME");
const uid = getItemFlag("USER_ID");
const s = getItemFlag("CHAR_SET").split("x");
const x = getItemFlag("SRV_SIGN");


function lunaUserInfo(type) {

    // user lookup
    function _lunaGet() {
        let jsonData = JSON.stringify({
            "m": m,
            "u": u,
            "s": x
        })
        $.ajax({

            url: "https://valkyteq.com:50000/animat3d/get",
            dataType: "json",
            type: "POST",
            async: true,
            data: jsonData,

            success: _resHandler

        });
    }

    // response handler
    function _resHandler (obj, status, xhr) {
        if (status !== "success") window.open("https://valkyteq.com/","_self");
        else {
            userCoins = obj.coins;
            userVip = obj.vip;
            if (obj.unlocks) {
                userUnlocks = obj.unlocks;
            } else {
                userUnlocks = "empty";
            }
            obj.items.forEach(function (item) {
                switch (item.category) {
                    case "Body":
                        arrBody.push(item)
                        listBody[item.name] = function () {
                            removeEntity(item.category);
                            addEntity(item);
                            setTimeout(function () {
                                setAnimation("idle");
                            }, 100);
                        }
                        break;
                    case "Face":
                        arrFace.push(item)
                        listFace[item.name] = function () {
                            removeEntity(item.category);
                            addEntity(item);
                            setTimeout(function () {
                                setAnimation("idle");
                            }, 100);
                        }
                        break;
                    case "Hair":
                        arrHair.push(item)
                        listHair[item.name] = function () {
                            removeEntity(item.category);
                            addEntity(item);
                            setTimeout(function () {
                                setAnimation("idle");
                            }, 100);
                        }
                        break;
                    case "Horn":
                        arrHorn.push(item)
                        listHorn[item.name] = function () {
                            removeEntity(item.category);
                            addEntity(item);
                            setTimeout(function () {
                                setAnimation("idle");
                            }, 100);
                        }
                        break;
                }
            });
            // console.log(obj, status, xhr);
            init(options);
        }
    }

    if (type === "get") { _lunaGet(); }

}
lunaUserInfo("get")


// ****************************************************************************************************************** //
//                                               v  SERVER EVENTS  v                                                  //
// ****************************************************************************************************************** //


let eventData = JSON.stringify({
    "m": `${m}`,
    "u": `${u}`,
    "s": `${x}`
})
let serverEvents = new EventSource(`https://valkyteq.com:${p}/animat3d/event/${uid}?${eventData}`);

serverEvents.addEventListener('message', function(event){

    // chat command
    function _aiCmd(command) {

        const cmd = (command[0].toString().toLowerCase()).replace("/", "")
        setAnimation(cmd);

    }

    let msg = event.data.split(" ")
    _aiCmd(msg)

});


// ****************************************************************************************************************** //
//                                                 v  SETTINGS  v                                                     //
// ****************************************************************************************************************** //


settingsA3D = {
    'Show Model': true,
    'Show FPS Stats': true,
    'Show Debug Lines': false,
    'Resync Animation': function () {
        setAnimation("idle");
    },
    'Water Color': '#fce1b8',
    'Water Scale': 3,
    'Water Flow X': 0,
    'Water Flow Y': 0
}


// ****************************************************************************************************************** //
//                                                  v  OPTIONS  v                                                     //
// ****************************************************************************************************************** //


optionsCastaKid = {
    "stats":getItemFlag("SETTING_STATS") === "true",
    "debug":true,
    "gizmo":10,
    "cpanel":true,
    "camera":{
        "fov":35,
        "near":1,
        "far":10000,
        "position":[0, 22.5, -123],
        "rotation":[2, 180, 0],
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
    "stats":getItemFlag("SETTING_STATS") === "true",
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
    if (m === "kara" || m === "kara1") {
        // settings = settingsCastaKid;
        options = optionsCastaKid;
        scale = false;
    }
    else if (m === "hiphop" || m === "police" || m === "pubg" || m === "cyba") {
        // settings = settingsCastaFem;
        options = optionsCastaKid;
        scale = false;
    }
    else {
        // settings = settingsCastaFem;
        options = optionsCastaKid;
        scale = true;
    }
// } else {
//     // settings = settingsCastaFem;
//     options = optionsCastaKid;
//     scale = true;
// }


// ****************************************************************************************************************** //
//                                                v  INITIALIZE  v                                                    //
// ****************************************************************************************************************** //


function init(opt) {

    container = document.getElementById( 'container' );

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
    // if (opt.scene.fog) {
    //     scene.fog = new THREE.Fog(opt.scene.fogcolor, opt.scene.fognear, opt.scene.fogfar);
    // }

    // water
    // const waterGeometry = new THREE.PlaneGeometry( 300, 400 );
    // water = new Water( waterGeometry, {
    //     color: settingsA3D['Water Color'],
    //     scale: settingsA3D['Water Scale'],
    //     flowDirection: new THREE.Vector2( settingsA3D['Water Flow X'], settingsA3D['Water Flow Y'] ),
    //     textureWidth: 1024,
    //     textureHeight: 1024
    // } );
    // water.position.x = 0;
    // water.position.y = -3;
    // water.position.z = 100;
    // water.rotation.x = Math.PI * - 0.5;
    // scene.add( water );

    // Load background texture
    // const textureSky = new THREE.TextureLoader();
    // textureSky.load('animat3d_textures/sky/night1.jpg' , function(texture) {
    //     scene.background = texture;
    // });


    // omni light
    const omniLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    omniLight.position.set(0, 100, 0);
    omniLight.intensity = 0.8;
    scene.add(omniLight);

    // ambient light
    const ambientLight = new THREE.AmbientLight(0xb8bbfc, 0.8);
    scene.add(ambientLight);

    // directional light
    const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.position.set( 100, 200, -200 );
    dirLight.castShadow = true;
    // dirLight.shadow.camera.top = 400;
    // dirLight.shadow.camera.bottom = -400;
    // dirLight.shadow.camera.left = -167;
    // dirLight.shadow.camera.right = 233;
    // dirLight.shadow.camera.near = 0.001;
    // dirLight.shadow.camera.far = 400;
    // dirLight.shadow.bias = -0.0065;
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
    // const loader = new GLTFLoader();
    // loader.load( './animat3d_objects/scenes/ruins.a3d', function ( gltf ) {
    //
    //     world = gltf.scene;
    //     scene.add( world );
    //
    //     // allow to cast shadow
    //     world.traverse( function ( object ) {
    //         if ( object.isMesh ) {
    //             object.castShadow = opt.light.shadow;
    //             object.receiveShadow = opt.light.shadow;
    //             object.material.transparency = true;
    //             object.material.opacity = 1;
    //         }
    //     } );
    //
    //     // model.material.transparency = true;
    //     // model.material.opacity = 0.1;
    //
    //     world.position.x = 0;
    //     world.position.y = -16.2;
    //     world.position.z =300;
    //
    //     world.rotation.x = 0;
    //     world.rotation.y = 180 * degree;
    //     world.rotation.z = 0;
    //
    // } );

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
    //         loadGLTF( `./animat3d_objects/chars/${m}.a3d`, clip, speed, [0,0,0], [0,0,0], opt.light.shadow, "Char");
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
            loadGLTF(`./animat3d_objects/body/${bodyName}.a3d`, 19, .5, [0,0,0], [0,0,0], opt.light.shadow, "Body");
            loadGLTF(`./animat3d_objects/face/face${face}.a3d`, 19, .5, [0,0,0], [0,0,0], opt.light.shadow, "Face");
            loadGLTF(`./animat3d_objects/hair/hair${hair}.a3d`, 19, .5, [0,0,0], [0,0,0], opt.light.shadow, "Hair");
            loadGLTF(`./animat3d_objects/horn/horn${horn}.a3d`, 19, .5, [0,0,0], [0,0,0], opt.light.shadow, "Horn");
        }, 5000)

    // }


    // debug
    // if (opt.debug) {
    //     // world gizmo
    //     gizmo = new THREE.AxesHelper(opt.gizmo);
    //     gizmo.position.set(-33, 0.2, 0);
    //     scene.add(gizmo);
    //
    //     // light helper
    //     helper = new THREE.CameraHelper(dirLight.shadow.camera);
    //     scene.add(helper);
    //
    //     // disable
    //     showGizmo( false );
    // }

    // SETTING STATS
    if (getItemFlag("SETTING_STATS") === "true") {
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
    // if (opt.cpanel) {
    //     objectPanel();
    // }

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
//
//
// function showStats( visibility ) {
//     visibility = `#container`;
//     $(visibility).toggle()
// }
//
//
// function showGizmo( visibility ) {
//     gizmo.visible = visibility;
//     helper.visible = visibility;
// }


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
    const pixelRatio = renderer.getPixelRatio();

    fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( container.offsetWidth * pixelRatio );
    fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( container.offsetHeight * pixelRatio );

}


// ****************************************************************************************************************** //
//                                                v  ITEM PANEL  v                                                    //
// ****************************************************************************************************************** //

/**
 *
 * @param { HTMLCanvasElement | HTMLCanvasElement | OffscreenCanvas | CanvasRenderingContext2D | any } element
 * @param { object } item
 * @param { boolean } shop
 */
// function stylePanelBtn( element, item, shop ) {
//
//     const url = `https://valkyteq.com/static/`;
//     // type
//     let size, posi;
//     switch (item.category) {
//         case "Face":
//             size = '112px';
//             posi = '50% 50%';
//             break;
//         case "Hair":
//             size = '96px';
//             posi = '50% 30%';
//             break;
//         case "Horn":
//             size = '96px';
//             posi = '50% 30%';
//             break;
//         case "Body":
//             size = '96px';
//             posi = '50% 40%';
//             break;
//     }
//     // rarity
//     let rarity, rarityColor;
//     switch (item.grade) {
//         case 1:
//             rarity = "Basic";
//             rarityColor = '#1fa717';
//             break;
//         case 2:
//             rarity = "Uncommon";
//             rarityColor = '#03c4be';
//             break;
//         case 3:
//             rarity = "Rare";
//             rarityColor = '#0347c4';
//             break;
//         case 4:
//             rarity = "Heroic";
//             rarityColor = '#ffa414';
//             break;
//         case 5:
//             rarity = "Mythic";
//             rarityColor = '#c63db6';
//             break;
//         case 6:
//             rarity = "Unique";
//             rarityColor = '#b42525';
//             break;
//     }
//
//     //
//     // Controller Box
//     // -----------------
//     // if (shop) element.domElement.disabled = true;
//     element.domElement.style = "";
//     let cssController = element.domElement.style;
//     cssController.display = 'inline';
//     cssController.width = '70px';
//     cssController.height = '70px';
//     cssController.margin = '0 0 0 0';
//     cssController.padding = '0 0 0 0';
//
//     //
//     // Item Icon
//     // ------------
//     // if (shop) element.domElement.children[0].disabled = true;
//     element.domElement.children[0].style = "";
//     let cssWidget = element.domElement.children[0].style;
//     let previewImage  = `${url}${item.icon}`;
//     cssWidget.backgroundImage = `url(${previewImage})`;
//     cssWidget.display = 'inline-block';
//     cssWidget.margin = '3.5px';
//     cssWidget.backgroundRepeat = 'no-repeat';
//     cssWidget.backgroundPosition = posi;
//     cssWidget.backgroundColor = 'transparent';
//     cssWidget.backgroundSize = size;
//     cssWidget.width = '70px';
//     cssWidget.height = '70px';
//
//     //
//     // Item Rarity
//     // --------------
//     // if (shop) element.domElement.children[0].children[0].disabled = true;
//     element.domElement.children[0].children[0].innerText = "";
//     element.domElement.children[0].children[0].style = "";
//     let css = element.domElement.children[0].children[0].style;
//     css.backgroundImage = `url(https://valkyteq.com/static/icons/grade/icon_grade_${item.grade}.png)`;
//     css.borderColor = rarityColor;
//     css.backgroundRepeat = 'no-repeat';
//     css.backgroundPosition = 'left top';
//     css.backgroundColor = 'transparent';
//     css.width = '70px';
//     css.height = '70px';
//     css.margin = '0 0 0 0';
//     css.padding = '0 0 0 0';
//
//
//     //
//     // TOOLTIPS
//     // ------------
//
//     // Create Info for Tooltip
//     let info = `${item.desc_en}`
//     const image = `<div class="icon_grade_${item.grade}"><img src='${previewImage}' alt="${item.name}" width="256px"/></div>`
//     const descRarity = `<div class="item_grade_${item.grade}">${rarity} ${item.category}</div>`
//     let tooltip = `<hr>${item.name_en}<hr>${image}<hr>${descRarity}<br>${info}<hr>`
//
//     // Add Tooltip to Element
//     element.domElement.children[0].setAttribute(`title`, tooltip);
//     element.domElement.children[0].setAttribute(`data-bs-html`, `true`);
//     element.domElement.children[0].setAttribute(`data-bs-trigger`, `hover`);
//     element.domElement.children[0].setAttribute(`data-bs-toggle`, `tooltip`);
//     element.domElement.children[0].setAttribute(`data-bs-placement`, `auto`);
//     element.domElement.children[0].setAttribute(`data-bs-animation`, `true`);
//     element.domElement.children[0].setAttribute(`data-bs-container`, `body`);
//
// }


// function objectPanel() {
//
//     let rar1 = [], rar2 = [], rar3 = [], rar4 = [], rar5 = [], rar6 = [];
//     let rars = [
//         rar1, rar2, rar3, rar4, rar5, rar6
//     ];
//     let trar1 = [], trar2 = [], trar3 = [], trar4 = [], trar5 = [], trar6 = [];
//     let trars = [
//         trar1, trar2, trar3, trar4, trar5, trar6
//     ];
//
//     function _sortRarity(item, tradable) {
//         switch (item.grade) {
//             case 1:
//                 if (tradable) trar1.push(item)
//                 else rar1.push(item)
//                 break;
//             case 2:
//                 if (tradable) trar2.push(item)
//                 else rar2.push(item)
//                 break;
//             case 3:
//                 if (tradable) trar3.push(item)
//                 else rar3.push(item)
//                 break;
//             case 4:
//                 if (tradable) trar4.push(item)
//                 else rar4.push(item)
//                 break;
//             case 5:
//                 if (tradable) trar5.push(item)
//                 else rar5.push(item)
//                 break;
//             case 6:
//                 if (tradable) trar6.push(item)
//                 else rar6.push(item)
//                 break;
//         }
//     }
//
//     const panel = new GUI( { width: 310, title: 'Animat3D - ..a project by VALKYTEQ' } );
//
//     const dirA3D = panel.addFolder( '3D Web Engine Settings' );
//     const dirFace = panel.addFolder( 'Face' );
//     const dirHair = panel.addFolder( 'Hair' );
//     const dirHorn = panel.addFolder( 'Horn' );
//     const dirBody = panel.addFolder( 'Body' );
//     const dirShop = panel.addFolder( 'New Items' );
//
//
//     // 3D Model Visibility
//     // folder0.add( settingsA3D, 'Show Model' ).onChange( showModel );
//     // folder0.add( settingsA3D, 'Show FPS Stats' ).onChange( showStats );
//     // folder0.add( settingsA3D, 'Show Debug Lines' ).onChange( showGizmo );
//     dirA3D.add( settingsA3D, 'Resync Animation' );
//
//
//     let dirs = {
//         'Face':dirFace,
//         'Hair':dirHair,
//         'Horn':dirHorn,
//         'Body':dirBody
//     }
//     let lists = {
//         'Face':listFace,
//         'Hair':listHair,
//         'Horn':listHorn,
//         'Body':listBody
//     }
//     let arrs = [
//         arrFace,
//         arrHair,
//         arrHorn,
//         arrBody
//     ];
//
//
//     arrs.forEach(function (arr) {
//         arr.forEach(function (item) {
//             if (item.tradable === 0) {
//                 _sortRarity(item, false);
//             }
//             else if (item.tradable === 1 && userUnlocks.includes(item.id)) {
//                 _sortRarity(item, false);
//             }
//             else if (item.tradable === 2 && userVip) {
//                 _sortRarity(item, false);
//             }
//             else {
//                 _sortRarity(item, true);
//                 // let button = dirs[item.category].add(lists[item.category], item.name);
//                 // stylePanelBtn(button, item, true)
//             }
//         })
//     })
//
//     rars.forEach(function (rarity) {
//         rarity.forEach(function (rarityItem) {
//             let button = dirs[rarityItem.category].add(lists[rarityItem.category], rarityItem.name);
//             stylePanelBtn(button, rarityItem, false)
//         })
//     })
//
//     trars.forEach(function (trarity) {
//         trarity.forEach(function (trarityItem) {
//             let button = dirShop.add(listShop, trarityItem.name);
//             stylePanelBtn(button, trarityItem, true)
//         })
//     })
//
//
//     // show / hide
//     dirA3D.open();
//     dirFace.close();
//     dirHair.close();
//     dirHorn.close();
//     dirBody.close();
//     dirShop.open();
//
// }


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
                    "angry":0, "dance":9, "worry":1, "greet":2,
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

        if (m === "custom" && type === "Hair") {
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

    if (getItemFlag("SETTING_STATS") === "true") {
        for (let stats of [stats1, stats2, stats3]) {
            stats.update();
        }
    }

    // if (getItemFlag("SETTING_FXAA") === "true") {
        composer.render(scene, camera);
    // }
    // else {
    //     renderer.render(scene, camera);
    // }

}


// ****************************************************************************************************************** //
//                                                v    -R-U-N-    v                                                   //
// ****************************************************************************************************************** //

setTimeout(function (){animate()}, 7000)
