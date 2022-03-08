$(document).ready(function() {
    var $resend = $('#resend').click(function() {
        var $form = $('form');
        $form.find('input[name=otp_challenge]').val('1');
        $form.submit();
    });

    var sec = parseInt($resend.attr('data-seconds'));
    var _finish = function() {
        $("#processing-timer-text").hide();
        $("#finished-timer-text").show();
    };
    if (sec > 0) {
        var timer = setInterval(function() {
            $("#timer-value").text(--sec);

            if (sec == 0) {
                _finish();
                clearInterval(timer);
            }
        }, 1000);
    } else {
        _finish();
    }
});