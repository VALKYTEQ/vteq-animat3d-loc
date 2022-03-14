

if (location.pathname.slice(-10) !== "index.html") {
    setTimeout( function() {

        let text = document.getElementById("loading-text")
        text.style.display = "none";

        let bar = document.getElementById("loading-bar")
        bar.style.display = "none";

        let music = document.getElementById("loading-copyright")
        music.style.display = "none";

        let loader = document.getElementById("loading-vid");
        loader.pause()
        loader.style.display = "none";

        let transmission = document.getElementById("loading-trans");
        transmission.play()
        amplifyMedia(transmission, 3);

    }, 7000)
}

function introEnded () {

    let transmission = $("#loading-trans");
    transmission.fadeOut();

    let loader = $("#loading-screen");
    loader.fadeOut();

    try {
        let overlay = document.getElementById("overlay-screen")
        overlay.style.display = "inline-block";
    } catch (e) { }

    try {
        let theme = document.getElementById("theme")
        theme.style.display = "inline-block";
        let audioShadow = document.querySelector('audio-player').shadowRoot;
        let audioPlay = audioShadow.getElementById('play-icon');
        audioPlay.click()
        let audio = audioShadow.querySelector('audio');
        audio.volume = 0.25;
    } catch (e) { }

}

function amplifyMedia(mediaElem, multiplier) {
    var context = new (window.AudioContext || window.webkitAudioContext),
        result = {
            context: context,
            source: context.createMediaElementSource(mediaElem),
            gain: context.createGain(),
            media: mediaElem,
            amplify: function(multiplier) { result.gain.gain.value = multiplier; },
            getAmpLevel: function() { return result.gain.gain.value; }
        };
    result.source.connect(result.gain);
    result.gain.connect(context.destination);
    result.amplify(multiplier);
    return result;
}
