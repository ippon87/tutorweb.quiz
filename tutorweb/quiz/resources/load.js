/*jslint nomen: true, plusplus: true, browser:true*/
/*global jQuery, Quiz*/

(function (window, $) {
    "use strict";
    var quiz, qs, handleError,
        jqQuiz = $('#tw-quiz'),
        jqStatus = $('#load-status'),
        jqBar = $('#load-bar');

    /** Put an alert div at the top of the page */
    function renderAlert(type, message) {
        jqQuiz.children('div.alert').remove();
        jqQuiz.prepend($('<div class="alert">')
            .addClass("alert-" + type)
            .text(message));
    }

    // Wire up quiz object
    quiz = new Quiz(localStorage, function (message) {
        renderAlert('error', message);
    });

    function updateState(state, message) {
        jqStatus[0].className = state;
        jqStatus.text(message);
        if (state === 'ready') {
            $('#tw-proceed').addClass("ready");
        }
    }

    function updateProgress(cur, max) {
        if (max === 0) {
            jqBar.css({"width": '0%'});
        } else if (cur < max) {
            jqBar.css({"width": (cur / max) * 100 + '%'});
        } else {
            jqBar.css({"width": '100%'});
        }
    }

    handleError = function (jqXHR, textStatus, errorThrown) {
        if (arguments.length === 3) {
            updateState('error', errorThrown + " (whilst requesting " + this.url + ")");
        } else {
            // Just a string
            updateState('error', jqXHR);
        }
    };

    /** Download a tutorial given by URL */
    function downloadTutorial(url) {
        $.ajax({
            type: "GET",
            cache: false,
            url: url,
            error: handleError,
            success: function (data) {
                var questionDfds, count = 0;
                quiz.insertTutorial(data.uri, data.title, data.lectures);

                // Download all lecture questions in parallel
                updateState("active", "Downloading lecture questions...");
                questionDfds = data.lectures.map(function (l) {
                    return $.ajax({
                        type: "GET",
                        cache: false,
                        url: l.question_uri,
                        error: handleError,
                        success: function (data) {
                            quiz.insertQuestions(data, function () {
                                count += 1;
                                updateProgress(count, questionDfds.length);
                            });
                        },
                    });
                });
                $.when.apply(null, questionDfds).done(function () {
                    if (count < data.lectures.length) { return; }
                    updateProgress(1, 1);
                    updateState("ready", "Press the button to start your quiz");
                });
            },
        });
        updateState("active", "Downloading questions...");
    }

    qs = quiz.parseQS(window.location);
    if (!qs.tutUri || !qs.lecUri) {
        handleError("Missing tutorial or lecture URI!");
        return;
    }
    if (qs.clear) {
        // Empty localStorage first
        window.localStorage.clear();
    }
    $('#tw-proceed').attr('href', quiz.quizUrl(qs.tutUri, qs.lecUri));
    downloadTutorial(qs.tutUri);
}(window, jQuery));
