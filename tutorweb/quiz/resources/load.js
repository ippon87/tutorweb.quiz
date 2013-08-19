/*jslint nomen: true, plusplus: true, browser:true*/
/*global jQuery, Quiz*/

(function (window, $) {
    "use strict";
<<<<<<< HEAD
    var quiz, jqStatus, jqBar;
=======
    var quiz, qs, handleError, jqStatus, jqBar;
>>>>>>> origin/master

    // Wire up quiz object
    quiz = new Quiz($, localStorage, function (message) {
        window.alert("error: " + message);
    });

    jqStatus = $('#load-status');
    jqBar = $('#load-bar');

    function updateState(state, message) {
        jqStatus[0].className = state;
        jqStatus.text(message);
        if (state === 'ready') {
<<<<<<< HEAD
            jqBar.css({"width": "100%"});
=======
>>>>>>> origin/master
            $('#tw-proceed').addClass("ready");
        }
    }

<<<<<<< HEAD
    function handleError(message) {
        updateState('error', message);
    }

    /** Download all questions associated to lecture */
    function downloadQuestions(url) {
        updateState("active", "Downloading lectures...");
        $.ajax({
            type: "GET",
            cache: false,
            url: url,
            error: handleError,
            success: function (data) {
                quiz.insertQuestions(data);
                updateState("ready", "Press the button to start your quiz");
            },
        });
    }

    /** Download a lecture given by URL */
    function downloadLecture(url) {
        updateState("active", "Downloading questions...");
=======
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
>>>>>>> origin/master
        $.ajax({
            type: "GET",
            cache: false,
            url: url,
            error: handleError,
            success: function (data) {
<<<<<<< HEAD
                quiz.insertTutorial('moo:TODO', 'Tutorial Title', [data]);
                $('#tw-proceed').attr('href', quiz.quizUrl('moo:TODO', url));
                if (data.question_uri) {
                    downloadQuestions(data.question_uri);
                } else {
                    updateState("error", "No link to questions");
                }
            },
        });
    }

    window.localStorage.clear(); //TODO: Hack!
    downloadLecture(window.location.search.replace(/^\??/, ""));
=======
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
                            count += 1;
                            updateProgress(count, questionDfds.length);
                            quiz.insertQuestions(data);
                        },
                    });
                });
                $.when.apply(null, questionDfds).done(function () {
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
>>>>>>> origin/master
}(window, jQuery));
