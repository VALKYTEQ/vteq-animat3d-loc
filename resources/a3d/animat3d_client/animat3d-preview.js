/*!
  Script: animat3d-preview.js
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
import {GLTFLoader} from '../animat3d_modules/loaders/GLTFLoader.js';
import Stats from '../animat3d_modules/libs/stats.module.js';
import {GUI} from '../animat3d_modules/libs/lil-gui.module.min.js';
import { Water } from '../animat3d_modules/objects/Water2.js';
import { EffectComposer } from '../animat3d_modules/postprocessing/EffectComposer.js';
import { RenderPass } from '../animat3d_modules/postprocessing/RenderPass.js';
import { ShaderPass } from '../animat3d_modules/postprocessing/ShaderPass.js';
import { CopyShader } from '../animat3d_modules/shaders/CopyShader.js';
import { FXAAShader } from '../animat3d_modules/shaders/FXAAShader.js';
import { SSAARenderPass } from '../animat3d_modules/postprocessing/SSAARenderPass.js';
import {GammaCorrectionShader} from "../animat3d_modules/shaders/GammaCorrectionShader.js";


let scene, renderer, camera, stats;
let stats1, stats2, stats3, samples;
let model, skeleton, mixer, clock;
let water, world, gizmo, helper;
let composer, fxaaPass, ssaaPass, container;

const crossFadeControls = [];

let idleAction, walkAction, runAction, angryAction, fearAction, greetAction, laughAction, sadAction, shyAction, talkAction, proposeAction, danceAction;
let idleWeight, walkWeight, runWeight, angryWeight, fearWeight, greetWeight, laughWeight, sadWeight, shyWeight, talkWeight, proposeWeight, danceWeight;

let actions, settings;
let singleStepMode = false;
let sizeOfNextStep = 0;

let degree = Math.PI / 180;

settings = {
    'show model': true,
    'show scenery': true,
    'show skeleton': false,
    'show world gizmo': true,
    'deactivate all': deactivateAllActions,
    'activate all': activateAllActions,
    'pause/continue': pauseContinue,
    'make single step': toSingleStepMode,
    'modify step size': 0.05,
    'from walk to idle': function () {
        prepareCrossFade( walkAction, idleAction, 1.0 );
    },
    'from idle to walk': function () {
        prepareCrossFade( idleAction, walkAction, 0.5 );
    },
    'from walk to run': function () {
        prepareCrossFade( walkAction, runAction, 2.5 );
    },
    'from run to walk': function () {
        prepareCrossFade( runAction, walkAction, 5.0 );
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
    'modify talk weight': 0.0,
    'modify propose weight': 0.0,
    'modify dance weight': 0.0,
    'modify time scale': 1.0,
    'water color': '#b8bbfc',
    'water scale': 3,
    'water flowX': 0,
    'water flowY': 0
};

let options = {
    "debug":true,
    "camera":{
        "fov":35,
        "near":1,
        "far":10000,
        "position":[-77, 22.5, -123],
        "rotation":[0, 200, 0]
    },
    "scene":{
        "background":false,
        "bgcolor":0xa0a0a0,
        "fog":false,
        "fogcolor":0xa0a0a0,
        "fognear":30,
        "fogfar":300
    },
    "light":{
        "shadow":true,
        "color":0xffffff,
        "skycolor":0xffffff,
        "groundcolor":0x444444
    }
};

function init(opt) {

    const container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        10000
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
    )

    clock = new THREE.Clock();
    scene = new THREE.Scene();

    // background
    // if (opt.scene.background) {
    //     scene.background = new THREE.Color(opt.scene.bgcolor);
    // } else {
    //     // skybox
    //     const cubeTextureLoader = new THREE.CubeTextureLoader();
    //     cubeTextureLoader.setPath( 'animat3d_textures/cube/MilkyWay/' );
    //     scene.background = cubeTextureLoader.load([
    //         "px.jpg", "nx.jpg",
    //         "py.jpg", "ny.jpg",
    //         "pz.jpg", "nz.jpg"
    //     ]);
    // }

    // water
    const waterGeometry = new THREE.PlaneGeometry( 300, 400 );
    water = new Water( waterGeometry, {
        color: settings['water color'],
        scale: settings['water scale'],
        flowDirection: new THREE.Vector2( settings['water flowX'], settings['water flowY'] ),
        textureWidth: 1024,
        textureHeight: 1024
    } );
    water.position.x = 0;
    water.position.y = -3;
    water.position.z = 100;
    water.rotation.x = Math.PI * - 0.5;
    scene.add( water );

    //Load background texture
    const textureSky = new THREE.TextureLoader();
    textureSky.load('animat3d_textures/sky/night.png' , function(texture) {
        scene.background = texture;
    });

    // fog / bg transmission
    // if (opt.scene.fog) {
    //     scene.fog = new THREE.Fog(opt.scene.fogcolor, opt.scene.fognear, opt.scene.fogfar);
    // }

    // omni light
    const omniLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    omniLight.position.set(0, 100, 0);
    omniLight.intensity = 0.3;
    scene.add(omniLight);

    // ambient light
    const ambientLight = new THREE.AmbientLight(0xb8bbfc, 0.5);
    scene.add(ambientLight);

    // directional light
    const dirLight = new THREE.DirectionalLight( 0xffffff, 1.2 );
    dirLight.position.set( 100, 200, -200 );
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
    // const mesh = new THREE.Mesh(
    //     new THREE.PlaneGeometry(500, 500),
    //     new THREE.MeshPhongMaterial( {color: 0x999999, depthWrite: false })
    // );
    // mesh.rotation.x = - Math.PI / 2;
    // mesh.receiveShadow = true;
    // scene.add( mesh );

    // character loading
    const loader = new GLTFLoader();
    loader.load( './animat3d_objects/chars/kara.a3d', function ( gltf ) {

        model = gltf.scene;
        scene.add( model );

        // allow to cast shadow
        model.traverse( function ( object ) {
            if ( object.isMesh ) object.castShadow = true;
        } );

        // face camera
        model.position.x = -33;
        model.rotation.y = 22 * degree;

        // load the skeleton rig
        skeleton = new THREE.SkeletonHelper( model );
        skeleton.visible = false;
        scene.add( skeleton );

        // create the user menu
        createPanel();

        // load embedded animations
        const animations = gltf.animations;
        mixer = new THREE.AnimationMixer( model );

        angryAction = mixer.clipAction( animations[ 0 ] );
        fearAction = mixer.clipAction( animations[ 1 ] );
        greetAction = mixer.clipAction( animations[ 2 ] );
        laughAction = mixer.clipAction( animations[ 3 ] );
        sadAction = mixer.clipAction( animations[ 4 ] );
        shyAction = mixer.clipAction( animations[ 5 ] );
        talkAction = mixer.clipAction( animations[ 6 ] );
        proposeAction = mixer.clipAction( animations[ 7 ] );
        walkAction = mixer.clipAction( animations[ 8 ] );
        danceAction = mixer.clipAction( animations[ 9 ] );
        runAction = mixer.clipAction( animations[ 10 ] );
        idleAction = mixer.clipAction( animations[ 11 ] );

        actions = [
            idleAction, walkAction, runAction, angryAction, fearAction, greetAction,
            laughAction, sadAction, shyAction, talkAction, proposeAction, danceAction
        ];

        // load all and start animation based on weight
        activateAllActions();
        animate();

    } );
    loader.load( './animat3d_objects/scenes/ruins.a3d', function ( gltf ) {

        world = gltf.scene;
        scene.add( world );

        // allow to cast shadow
        world.traverse( function ( object ) {
            if ( object.isMesh ) {
                object.castShadow = true;
                object.receiveShadow = true;
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


    // debug
    if (opt.debug) {
        // world gizmo
        gizmo = new THREE.AxesHelper(10);
        gizmo.position.set(-33, 0.2, 0);
        scene.add(gizmo);

        // light helper
        helper = new THREE.CameraHelper(dirLight.shadow.camera)
        scene.add(helper);
    }

    // load stats
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


    window.addEventListener( 'resize', onWindowResize );

}

function createPanel() {

    const panel = new GUI( { width: 310, title: 'Animat3D - ..a project by VALKYTEQ' } );

    panel.domElement.style.cssText = 'position:absolute;top:85px;right:2%;';

    const folder0 = panel.addFolder( '3D Web Engine Settings' );
    const folder1 = panel.addFolder( 'Dynamic Water Control' );
    const folder2 = panel.addFolder( 'Animation Activation' );
    const folder3 = panel.addFolder( 'Animation Stepping' );
    const folder4 = panel.addFolder( 'Animation Fading' );
    const folder5 = panel.addFolder( 'Animation Weight' );
    const folder6 = panel.addFolder( 'Animation Speed' );

    // 3D Model Visibility
    folder0.add( settings, 'show model' ).onChange( showModel );
    folder0.add( settings, 'show scenery' ).onChange( showScenery );
    folder0.add( settings, 'show skeleton' ).onChange( showSkeleton );
    folder0.add( settings, 'show world gizmo' ).onChange( showGizmo );

    // Dynamic Water Setting
    folder1.addColor( settings, 'water color' ).onChange( function ( value ) {
        water.material.uniforms[ 'color' ].value.set( value );
    } );
    folder1.add( settings, 'water scale', 1, 10 ).onChange( function ( value ) {
        water.material.uniforms[ 'config' ].value.w = value;
    } );
    // folder1.add( settings, 'water flowX', - 1, 1 ).step( 0.01 ).onChange( function ( value ) {
    //     water.material.uniforms[ 'flowDirection' ].value.x = value;
    //     water.material.uniforms[ 'flowDirection' ].value.normalize();
    // } );
    // folder1.add( settings, 'water flowY', - 1, 1 ).step( 0.01 ).onChange( function ( value ) {
    //     water.material.uniforms[ 'flowDirection' ].value.y = value;
    //     water.material.uniforms[ 'flowDirection' ].value.normalize();
    // } );

    // Animation Activation
    folder2.add( settings, 'deactivate all' );
    folder2.add( settings, 'activate all' );

    // Animation Stepping
    folder3.add( settings, 'pause/continue' );
    folder3.add( settings, 'make single step' );
    folder3.add( settings, 'modify step size', 0.01, 0.1, 0.001 );

    // Animation Fading
    crossFadeControls.push( folder4.add( settings, 'from walk to idle' ) );
    crossFadeControls.push( folder4.add( settings, 'from idle to walk' ) );
    crossFadeControls.push( folder4.add( settings, 'from walk to run' ) );
    crossFadeControls.push( folder4.add( settings, 'from run to walk' ) );
    folder4.add( settings, 'use default duration' );
    folder4.add( settings, 'set custom duration', 0, 10, 0.01 );

    // Animation Weight
    folder5.add( settings, 'modify angry weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
        setWeight( angryAction, weight );
    } );
    folder5.add( settings, 'modify dance weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
        setWeight( danceAction, weight );
    } );
    folder5.add( settings, 'modify fear weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
        setWeight( fearAction, weight );
    } );
    folder5.add( settings, 'modify greet weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
        setWeight( greetAction, weight );
    } );
    folder5.add( settings, 'modify idle weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
        setWeight( idleAction, weight );
    } );
    folder5.add( settings, 'modify laugh weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
        setWeight( laughAction, weight );
    } );
    folder5.add( settings, 'modify propose weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
        setWeight( proposeAction, weight );
    } );
    folder5.add( settings, 'modify run weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
        setWeight( runAction, weight );
    } );
    folder5.add( settings, 'modify sad weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
        setWeight( sadAction, weight );
    } );
    folder5.add( settings, 'modify shy weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
        setWeight( shyAction, weight );
    } );
    folder5.add( settings, 'modify talk weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
        setWeight( talkAction, weight );
    } );
    folder5.add( settings, 'modify walk weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
        setWeight( walkAction, weight );
    } );

    // Animation Speed
    folder6.add( settings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );

    // show / hide
    folder0.open();
    folder1.close();
    folder2.close();
    folder3.close();
    folder4.open();
    folder5.close();
    folder6.close();

}


function showModel( visibility ) {
    model.visible = visibility;
}

function showScenery( visibility ) {
    world.visible = visibility;
    water.visible = visibility;
}

function showSkeleton( visibility ) {
    skeleton.visible = visibility;
}

function showGizmo( visibility ) {
    gizmo.visible = visibility;
    helper.visible = visibility;
}

function modifyTimeScale( speed ) {
    mixer.timeScale = speed;
}

function deactivateAllActions() {
    actions.forEach( function ( action ) {
        action.stop();
    } );
}

function activateAllActions() {

    setWeight( idleAction, settings[ 'modify idle weight' ] );
    setWeight( walkAction, settings[ 'modify walk weight' ] );
    setWeight( runAction, settings[ 'modify run weight' ] );
    setWeight( angryAction, settings[ 'modify angry weight' ] );
    setWeight( fearAction, settings[ 'modify fear weight' ] );
    setWeight( greetAction, settings[ 'modify greet weight' ] );
    setWeight( laughAction, settings[ 'modify laugh weight' ] );
    setWeight( sadAction, settings[ 'modify sad weight' ] );
    setWeight( shyAction, settings[ 'modify shy weight' ] );
    setWeight( talkAction, settings[ 'modify talk weight' ] );
    setWeight( proposeAction, settings[ 'modify propose weight' ] );
    setWeight( danceAction, settings[ 'modify dance weight' ] );

    actions.forEach( function ( action ) {
        action.play();
    } );

}

function pauseContinue() {
    if ( singleStepMode ) {
        singleStepMode = false;
        unPauseAllActions();
    } else {
        if ( idleAction.paused ) {
            unPauseAllActions();
        } else {
            pauseAllActions();
        }
    }
}

function pauseAllActions() {
    actions.forEach( function ( action ) {
        action.paused = true;
    } );
}

function unPauseAllActions() {
    actions.forEach( function ( action ) {
        action.paused = false;
    } );
}

function toSingleStepMode() {
    unPauseAllActions();
    singleStepMode = true;
    sizeOfNextStep = settings[ 'modify step size' ];
}

function prepareCrossFade( startAction, endAction, defaultDuration ) {

    // Switch default / custom crossfade duration (according to the user's choice)
    const duration = setCrossFadeDuration( defaultDuration );

    // Make sure that we don't go on in singleStepMode, and that all actions are unpaused
    singleStepMode = false;
    unPauseAllActions();

    // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately...
    if ( startAction === idleAction ) {
        executeCrossFade( startAction, endAction, duration );
    }
    // ...else wait until the current action has finished its current loop and set back to idle
    else {
        synchronizeCrossFade( startAction, endAction, duration );
    }

}

function setCrossFadeDuration( defaultDuration ) {

    // Switch default crossfade duration <-> custom crossfade duration
    if ( settings[ 'use default duration' ] ) {
        return defaultDuration;
    } else {
        return settings[ 'set custom duration' ];
    }

}

function synchronizeCrossFade( startAction, endAction, duration ) {

    mixer.addEventListener( 'loop', onLoopFinished );

    function onLoopFinished( event ) {
        if ( event.action === startAction ) {
            mixer.removeEventListener( 'loop', onLoopFinished );
            executeCrossFade( startAction, endAction, duration );
        }
    }

}

function executeCrossFade( startAction, endAction, duration ) {

    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)
    setWeight( endAction, 1 );
    endAction.time = 0;

    // Crossfade with warping - you can also try without warping by setting the third parameter to false
    startAction.crossFadeTo( endAction, duration, true );

}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))
function setWeight( action, weight ) {

    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );

}

// Called by the render loop
function updateWeightSliders() {

    settings[ 'modify idle weight' ] = idleWeight;
    settings[ 'modify walk weight' ] = walkWeight;
    settings[ 'modify run weight' ] = runWeight;
    settings[ 'modify angry weight' ] = angryWeight;
    settings[ 'modify fear weight' ] = fearWeight;
    settings[ 'modify greet weight' ] = greetWeight;
    settings[ 'modify laugh weight' ] = laughWeight;
    settings[ 'modify sad weight' ] = sadWeight;
    settings[ 'modify shy weight' ] = shyWeight;
    settings[ 'modify talk weight' ] = talkWeight;
    settings[ 'modify propose weight' ] = proposeWeight;
    settings[ 'modify dance weight' ] = danceWeight;

}

// Called by the render loop
function updateCrossFadeControls() {

    if ( idleWeight === 1 && walkWeight === 0 && runWeight === 0 ) {
        crossFadeControls[ 0 ].disable();
        crossFadeControls[ 1 ].enable();
        crossFadeControls[ 2 ].disable();
        crossFadeControls[ 3 ].disable();
    }

    if ( idleWeight === 0 && walkWeight === 1 && runWeight === 0 ) {
        crossFadeControls[ 0 ].enable();
        crossFadeControls[ 1 ].disable();
        crossFadeControls[ 2 ].enable();
        crossFadeControls[ 3 ].disable();
    }

    if ( idleWeight === 0 && walkWeight === 0 && runWeight === 1 ) {
        crossFadeControls[ 0 ].disable();
        crossFadeControls[ 1 ].disable();
        crossFadeControls[ 2 ].disable();
        crossFadeControls[ 3 ].enable();
    }

}

// keep center of the world on screen change
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

// Main animation function
function animate() {

    // Render loop

    requestAnimationFrame( animate );

    idleWeight = idleAction.getEffectiveWeight();
    walkWeight = walkAction.getEffectiveWeight();
    runWeight = runAction.getEffectiveWeight();
    angryWeight = angryAction.getEffectiveWeight();
    fearWeight = fearAction.getEffectiveWeight();
    greetWeight = greetAction.getEffectiveWeight();
    laughWeight = laughAction.getEffectiveWeight();
    sadWeight = sadAction.getEffectiveWeight();
    shyWeight = shyAction.getEffectiveWeight();
    talkWeight = talkAction.getEffectiveWeight();
    proposeWeight = proposeAction.getEffectiveWeight();
    danceWeight = danceAction.getEffectiveWeight();

    // Update the panel values if weights are modified from "outside" (by crossfadings)
    updateWeightSliders();

    // Enable/disable crossfade controls according to current weight values
    updateCrossFadeControls();

    // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)
    let mixerUpdateDelta = clock.getDelta();

    // If in single step mode, make one step and then do nothing (until the user clicks again)
    if ( singleStepMode ) {
        mixerUpdateDelta = sizeOfNextStep;
        sizeOfNextStep = 0;
    }

    // Update the animation mixer, the stats panel, and render this frame
    mixer.update( mixerUpdateDelta );

    if (getItemFlag("SETTING_STATS") === "true") {
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



console.log(`Animat3D Loader        : Preview`);

let itemFlags = {
    "AA":false,
    "MSAA":getItemFlag("SETTING_MSAA"),
    "FXAA":getItemFlag("SETTING_FXAA"),
    "SSAA":getItemFlag("SETTING_SSAA")
};


if (getItemFlag("SETTING_SSAA") === "true") {
    // TODO: - Fix this workaround
    //       - If SSAA Sample > 2 the FPS drop to 10
    //       - Its caused by scene.water and scene.world
    setItemFlag("SETTING_SSAA_SAMPLE", "0");
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

for (let [key, val] of Object.entries(itemFlags)) {
    if (val === "true") {
        itemFlags['AA'] = true;
        if (key !== "SSAA") {
            samples = '';
        }
        console.log(`Anti Aliasing          : ${key} ${samples}`)
    }
}
if (!itemFlags['AA']) console.log(`Anti Aliasing          : OFF`);

init(options);
