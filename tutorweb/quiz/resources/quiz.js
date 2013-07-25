/*jslint nomen: true, plusplus: true, browser:true*/
/*global $, jQuery*/

function QuizView($, jqQuiz, jqProceed) {
    "use strict";
    this.jqQuiz = jqQuiz;
    this.twProceed = jqProceed;

    /** Switch quiz state, optionally showing message */
    this.updateState = function (curState, message) {
        var alertClass, self = this;
        $(document).data('tw-state', curState);

        // Add message to page if we need to
        if (message) {
            alertClass = (curState === 'error' ? ' alert-error' : '');
            $('<div class="alert' + alertClass + '">' + message + '</div>').insertBefore(self.jqQuiz);
        }

        // Set button to match state
        self.twProceed.removeAttr("disabled");
        if (curState === 'nextqn') {
            self.twProceed.html("New question >>>");
        } else if (curState === 'interrogate') {
            self.twProceed.html("Submit answer >>>");
        } else if (curState === 'processing') {
            self.twProceed.attr("disabled", true);
        } else {
            self.twProceed.html("Restart quiz >>>");
        }
    };

    /** Render next question */
    this.renderNewQuestion = function (qn, ordering) {
        var i, html;
        //TODO: Do some proper DOM manipluation?
        html = '<p>' + qn.text + '</p>';
        html += '<ol type="a">';
        for (i = 0; i < ordering.length; i++) {
            html += '<li id="answer_' + i + '">';
            html += '<label class="radio">';
            html += '<input type="radio" name="answer" value="' + i + '"/>';
            html += qn.choices[ordering[i]];
            html += '</label></li>';
        }
        html += '</ol>';
        this.jqQuiz.html(html);
    };

    /** Decrypt answer and display */
    this.renderAnswer = function (selectedAnswer, onSuccess) {
        var answer, correctIds, correct, qn, i;
        qn = quiz._curQuestion;
        // Note answer in queue
        i = quiz._state.answerQueue.length - 1;
        if (i < 0 || quiz._state.answerQueue[i].answer_time != null) {
            quiz.handleError("Answer queue empty / out of sync");
            return;
        }
        quiz._state.answerQueue[i].answer_time = Math.round((new Date()).getTime() / 1000);
        quiz._state.answerQueue[i].student_answer =  qn.ordering[selectedAnswer];
        if (quiz.inOfflineMode) {
            // Write back to localStorage
            localStorage.setItem(quiz.lectureUrl, JSON.stringify(quiz._state));
        }

        answer = JSON.parse(window.atob(qn.answer));
        correctIds = [];
        correct = false;
        for (i = 0; i < qn.ordering.length; i++) {
            if ($.inArray(qn.ordering[i], answer.correct) >= 0) {
                // Correct, so add it to list
                correctIds.push('#answer_' + i);
                // If student ticked this one, they got it right.
                if (i === selectedAnswer) { correct = true; }
            }
        }
        onSuccess({
            correct: correct,
            selectedId: '#answer_' + selectedAnswer,
            correctId: correctIds.join(', '),
            explanation: answer.explanation,
        });
    };

    this.renderChooseLecture = function (quiz, items, onSelect) {
        var jqSelect, self = this;

        // [[href, title, items], [href, title, items], ...] => markup
        // items can also be {uri: '', title: ''}
        function listToMarkup(items) {
            var i, item, jqUl = $('<ul/>');
            if (typeof items === 'undefined') {
                return null;
            }
            for (i=0; i < items.length; i++) {
                item = items[i]
                jqUl.append($('<li/>')
                        .append($('<a/>')
                            .attr('href', item[0] || item.uri)
                            .text(item[1] || item.title))
                        .append(listToMarkup(item[2]))
                        );
            }
            return jqUl;
        }
    
        // Create initial ul
        jqSelect = listToMarkup(items);
        jqSelect.addClass("select-list");
    
        // Bind click event to open items / select item.
        jqSelect.bind('click', function (e) {
            var jqTarget = $(e.target);
            e.preventDefault();
            $(this).find(".selected").removeClass("selected");
            self.twProceed.addClass("disabled");
            if(jqTarget.parent().parent()[0] === this ) {
                // A 1st level tutorial, Just open/close item
                jqTarget.parent().toggleClass("expanded");
            } else if (e.target.tagName === 'A') {
                // A quiz link, select it
                jqTarget.addClass("selected");
                self.twProceed.removeClass("disabled");
                onSelect(
                    jqTarget.parent().parent().prev('a').attr('href'),
                    e.target.href);
            }
        });

        self.jqQuiz.empty().append(jqSelect);
    };
};

(function (window, $, undefined) {
    "use strict";
    var quiz, quizView;

    // Wire up quiz object
    quizView = new QuizView($, $('#tw-quiz'), $('#tw-proceed'));
    quiz = new Quiz($, localStorage, function (message) {
        quizView.updateState("error", message);
    });

    // Complain if there's no localstorage
    if (!('localStorage' in window) || window['localStorage'] === null) {
        quizView.updateState("error", "Sorry, we do not support your browser");
        return false;
    }

    // Trigger reload if needed
    window.applicationCache.addEventListener('updateready', function(e) {
        if (window.applicationCache.status !== window.applicationCache.UPDATEREADY) {
            return;
        }
        quizView.updateState("reload", 'A new version is avaiable, click "Restart quiz"');
    });

    // Initial state, show menu of lectures
    quiz.getAvailableLectures(function (lectures) {
        quizView.renderChooseLecture(quiz, lectures, function(tutUri, lecUri) {
            quiz.setCurrentLecture(tutUri, lecUri);
        });
        quizView.updateState('nextqn');
    });

    // Hitting the button moves on to the next state in the state machine
    $('#tw-proceed').bind('click', function (event) {
        event.preventDefault();
        if ($(this).hasClass("disabled")) {
            return;
        }
        switch ($(document).data('tw-state')) {
        case 'processing':
            break;
        case 'error':
        case 'reload':
            window.location.reload(false);
            break;
        case 'nextqn':
            // User ready for next question
            quizView.updateState("processing");
            quiz.getNewQuestion(function (qn, ordering) {
                quizView.renderNewQuestion(qn, ordering);
                quizView.updateState('interrogate');
            });
            break;
        case 'interrogate':
            // Disable all controls and mark answer
            quizView.updateState("processing");
            quiz.chooseAnswer(parseInt($('input:radio[name=answer]:checked').val(), 10), function (qn, ans) {
                quizView.renderAnswer(qn, ans);
                var jqQuiz = $('#tw-quiz');
                // Add answer to page
                jqQuiz.find('input').attr('disabled', 'disabled');
                jqQuiz.find(ans.selectedId).addClass('tw-selected');
                jqQuiz.find(ans.correctId).addClass('tw-correct');
                jqQuiz.addClass(ans.correct ? 'correct' : 'incorrect');
                jqQuiz.append($('<div class="alert tw-explanation">' + ans.explanation + '</div>'));

                quizView.updateState('nextqn');
            });
            break;
        default:
            quizView.updateState('error', "Error: Quiz in unkown state");
        }
    });
}(window, jQuery));