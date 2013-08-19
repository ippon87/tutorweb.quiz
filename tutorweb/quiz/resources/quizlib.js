/*jslint nomen: true, plusplus: true, browser:true*/
<<<<<<< HEAD
=======
/*global item_allocation*/
>>>>>>> origin/master

/**
  * Main quiz object
  *  ajax: function call to jQuery
  *  rawLocalStorage: Browser local storage object
  *  handleError: Function that displays error message to user
  */
function Quiz(ajax, rawLocalStorage, handleError) {
    "use strict";
    this.handleError = handleError;
<<<<<<< HEAD
    this.curTutorial = null;
    this.curLecture = null;
=======
    this.ajax = ajax;
    this.tutorialUri = null;
    this.curTutorial = null;
    this.lecIndex = null;
>>>>>>> origin/master

    // Wrapper to let localstorage take JSON
    function JSONLocalStorage(backing) {
        this.backing = backing;

        this.removeItem = function (key) {
            return backing.removeItem(key);
        };

        this.getItem = function (key) {
            var value = backing.getItem(key);
            if (value === null) {
                return value;
            }
            return JSON.parse(value);
        };

        this.setItem = function (key, value) {
            return backing.setItem(key, JSON.stringify(value));
        };
    }
    this.ls = new JSONLocalStorage(rawLocalStorage);

<<<<<<< HEAD
    // Get/set the main index document
    // Index looks like:-
    // { tut_uri : {"title" : title, "lectures": [{uri, title}, ...]} }
    this._indexDoc = function (value) {
        if (value) {
            this.ls.setItem('_tw_index', value);
        }
        return this.ls.getItem('_tw_index') || {};
    };

    /** Remove tutorial from localStorage, including all lectures */
    this.removeTutorial = function (tutUri) {
        var i, j, lectures, questions, twIndex = this._indexDoc();

        //TODO: What if questions were used elsewhere?
        lectures = twIndex[tutUri].lectures;
=======
    /** Remove tutorial from localStorage, including all lectures */
    this.removeTutorial = function (tutUri) {
        var i, j, lectures, questions, twIndex, self = this;

        // Remove question objects associated with this tutorial
        lectures = self.ls.getItem(tutUri).lectures;
>>>>>>> origin/master
        for (i = 0; i < lectures.length; i++) {
            questions = lectures[i].questions;
            for (j = 0; j < lectures[i].questions.length; j++) {
                this.ls.removeItem(lectures[i].questions[j].uri);
            }
        }

<<<<<<< HEAD
        delete twIndex[tutUri];
        return this._indexDoc(twIndex);
=======
        // Remove tutorial, and reference in index
        this.ls.removeItem(tutUri);
        twIndex = self.ls.getItem('_index');
        delete twIndex[tutUri];
        self.ls.setItem('_index', twIndex);
        return twIndex;
>>>>>>> origin/master
    };

    /** Insert tutorial into localStorage */
    this.insertTutorial = function (tutUri, tutTitle, lectures) {
<<<<<<< HEAD
        var twIndex = this._indexDoc();
        if (twIndex[tutUri]) {
            twIndex = this.removeTutorial(tutUri);
        }
        twIndex[tutUri] = { "title": tutTitle, "lectures": lectures };
        this._indexDoc(twIndex);
=======
        var twIndex, self = this;
        self.ls.setItem(tutUri, { "title": tutTitle, "lectures": lectures });

        // Update index with link to document
        twIndex = self.ls.getItem('_index') || {};
        twIndex[tutUri] = 1;
        self.ls.setItem('_index', twIndex);
        return twIndex;
>>>>>>> origin/master
    };

    /** Insert questions into localStorage */
    this.insertQuestions = function (qns) {
        var i, qnUris = Object.keys(qns);
        for (i = 0; i < qnUris.length; i++) {
            this.ls.setItem(qnUris[i], qns[qnUris[i]]);
        }
    };

    /** Return deep array of lectures and their URIs */
    this.getAvailableLectures = function (onSuccess) {
<<<<<<< HEAD
        var k, i, tutorials = [], lectures, twIndex = this._indexDoc();
        //TODO: Sort tutorials? Or use array instead?
        for (k in twIndex) {
            if (twIndex.hasOwnProperty(k)) {
                tutorials.push([k, twIndex[k].title, twIndex[k].lectures]);
=======
        var k, tutorials = [], t, twIndex, self = this;
        //TODO: Sort tutorials? Or use array instead?
        twIndex = self.ls.getItem('_index');
        for (k in twIndex) {
            if (twIndex.hasOwnProperty(k)) {
                t = self.ls.getItem(k);
                tutorials.push([k, t.title, t.lectures]);
>>>>>>> origin/master
            }
        }
        onSuccess(tutorials);
    };

    /** Set the current tutorial/lecture */
    this.setCurrentLecture = function (params, onSuccess) {
<<<<<<< HEAD
        var i, twIndex = this._indexDoc();
        if (!(params.tutUri && params.lecUri)) {
            this.handleError("Missing lecture parameters: tutUri, params.lecUri");
        }
        this.curTutorial = twIndex[params.tutUri];
        if (!this.curTutorial) {
            this.handleError("Unknown tutorial: " + params.tutUri);
            return;
        }
        for (i = 0; i < this.curTutorial.lectures.length; i++) {
            if (this.curTutorial.lectures[i].uri === params.lecUri) {
                this.curLecture = this.curTutorial.lectures[i];
                if (!this.curLecture.answerQueue) {
                    this.curLecture.answerQueue = [];
                }
                onSuccess(this.curTutorial.title, this.curLecture.title);
                return;
            }
        }
        this.handleError("Lecture " + params.lecUri + "not part of current tutorial");
=======
        var self = this, i, lecture;
        if (!(params.tutUri && params.lecUri)) {
            self.handleError("Missing lecture parameters: tutUri, params.lecUri");
        }

        // Find tutorial
        self.curTutorial = self.ls.getItem(params.tutUri);
        if (!self.curTutorial) {
            self.handleError("Unknown tutorial: " + params.tutUri);
            return;
        }
        self.tutorialUri = params.tutUri;

        // Find lecture within tutorial
        for (i = 0; i < self.curTutorial.lectures.length; i++) {
            lecture = self.curTutorial.lectures[i];
            if (lecture.uri === params.lecUri) {
                self.lecIndex = i;
                return onSuccess(self.curTutorial.title, lecture.title);
            }
        }
        self.handleError("Lecture " + params.lecUri + "not part of current tutorial");
    };

    /** Return the answer queue for the current lecture */
    this.curAnswerQueue = function () {
        var self = this, curLecture = self.curTutorial.lectures[self.lecIndex];
        if (!curLecture.answerQueue) {
            curLecture.answerQueue = [];
        }
        return curLecture.answerQueue;
>>>>>>> origin/master
    };

    /** Choose a new question from the current tutorial/lecture */
    this.getNewQuestion = function (onSuccess) {
<<<<<<< HEAD
        var i, answerQueue = this.curLecture.answerQueue, self = this;
        //TODO: Should be writing back answerQueue

        // Recieve question data, apply random ordering and pass it on
        function gotQuestionData(qn) {
            var ordering, a = Array.last(answerQueue);
=======
        var self = this, a, answerQueue = self.curAnswerQueue();

        function itemAllocation(curTutorial, lecIndex, answerQueue) {
            var i,
                grade = 5, //TODO: Where should this come from?
                questions = curTutorial.lectures[lecIndex].questions;

            i = item_allocation(questions, answerQueue, grade);
            return {
                "uri": questions[i].uri,
                "allotted_time": 5 * 60, //TODO: hardcode to 5mins
            };
        }

        // Assign new question if last has been answered
        if (answerQueue.length === 0 || Array.last(answerQueue).answer_time !== null) {
            answerQueue.push(itemAllocation(self.curTutorial, self.lecIndex, answerQueue));
        }

        // Get question data to go with last question on queue
        a = Array.last(answerQueue);
        self.getQuestionData(a.uri, function (qn) {
            var ordering;
>>>>>>> origin/master
            // Generate ordering, field value -> internal value
            ordering = qn.fixed_order.concat(Array.shuffle(qn.random_order));
            a.ordering = ordering;
            a.quiz_time = Math.round((new Date()).getTime() / 1000);
<<<<<<< HEAD
            onSuccess(qn, ordering);
        }
        function itemAllocation(questions, answerQueue) {
            var grade = 5;  //TODO: Where should this come from?
            return item_allocation(questions, answerQueue, grade);
        }

        if (answerQueue.length > 0 && Array.last(answerQueue).answer_time === null) {
            // Last question wasn't answered, return that
            self.getQuestionData(self.curLecture.questions[answerQueue[i].uri], gotQuestionData);
        } else {
            // Assign a new question
            i = itemAllocation(self.curLecture.questions, answerQueue);
            answerQueue.push({"uri": self.curLecture.questions[i].uri, "synced": false});
            self.getQuestionData(self.curLecture.questions[i].uri, gotQuestionData);
        }
=======
            a.synced = false;
            self.ls.setItem(self.tutorialUri, self.curTutorial);
            onSuccess(qn, a);
        });
>>>>>>> origin/master
    };

    /** Return the full data for a question */
    this.getQuestionData = function (uri, onSuccess) {
        var qn, self = this;
        qn = self.ls.getItem(uri);
        if (!qn) {
            self.handleError("Cannot find question " + uri);
        } else {
            onSuccess(qn);
        }
    };

    /** User has selected an answer */
    this.setQuestionAnswer = function (selectedAnswer, onSuccess) {
        // Fetch question off answer queue, add answer
<<<<<<< HEAD
        var self = this, answerData, a = Array.last(self.curLecture.answerQueue);
        a.answer_time = Math.round((new Date()).getTime() / 1000);
        a.student_answer = a.ordering[selectedAnswer];
=======
        var self = this, answerData, a = Array.last(self.curAnswerQueue());
        a.answer_time = Math.round((new Date()).getTime() / 1000);
        a.student_answer = a.ordering[selectedAnswer];
        a.synced = false;
>>>>>>> origin/master

        // Mark their work
        self.getQuestionData(a.uri, function (qn) {
            var i, answerData = typeof qn.answer === 'string' ? JSON.parse(window.atob(qn.answer)) : qn.answer;
            // Generate array showing which answers were correct
            a.ordering_correct = a.ordering.map(function (v) {
                return answerData.correct.indexOf(v) > -1;
            });
            // Student correct iff their answer is in list
            a.correct = answerData.correct.indexOf(a.student_answer) > -1;
<<<<<<< HEAD
=======
            self.ls.setItem(self.tutorialUri, self.curTutorial);
>>>>>>> origin/master
            onSuccess(a, answerData, selectedAnswer);
        });
    };

    /** Send current answer queue back to TW */
<<<<<<< HEAD
    this.syncAnswers = function () {
        //TODO:
=======
    this.syncAnswers = function (onSuccess) {
        var self = this, curLecture = self.curTutorial.lectures[self.lecIndex];
        // Return true iff every answerQueue item has been synced
        function isSynced(lecture) {
            var i;
            for (i = 0; i < lecture.answerQueue.length; i++) {
                if (!lecture.answerQueue[i].synced) {
                    return false;
                }
            }
            return true;
        }
        if (isSynced(curLecture)) {
            // Nothing to do, stop.
            return onSuccess('synced');
        }

        // Send lecture back to tutorweb
        self.ajax({
            contentType: 'application/json',
            data: JSON.stringify(curLecture),
            url: curLecture.uri,
            type: 'POST',
            success: function (data) {
                var i;
                //NB: answerQueue could have grown in the mean time, don't process
                // entire thing.

                // Mark items the server has now synced
                for (i = 0; i < data.answerQueue.length; i++) {
                    curLecture.answerQueue[i].synced = data.answerQueue[i].synced;
                }

                // If answerQueue is beyond maximum, remove synced items
                i = 0;
                while ((curLecture.answerQueue.length - i) > 8 && curLecture.answerQueue[i].synced) {
                    i++;
                }
                curLecture.answerQueue.splice(0, i);
                self.ls.setItem(self.tutorialUri, self.curTutorial);

                onSuccess('online');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 401 || jqXHR.status === 403) {
                    onSuccess('unauth');
                    return;
                }
                onSuccess('error');
            },
        });
>>>>>>> origin/master
    };

    /** Helper to form a URL to a selected quiz */
    this.quizUrl = function (tutUri, lecUri) {
        return 'quiz.html?tutUri=' + encodeURIComponent(tutUri) + ';lecUri=' + encodeURIComponent(lecUri);
    };
<<<<<<< HEAD
=======

    /**
      * Given URL object, chop querystring up into a key/value object
      * e.g. quiz.parseQS(window.location)
      */
    this.parseQS = function (url) {
        var i, part,
            out = {},
            qs = url.search.replace(/^\?/, '').split(/;|&/);
        for (i = 0; i < qs.length; i++) {
            part = qs[i].split('=');
            out[part[0]] = decodeURIComponent(part[1]);
        }
        return out;
    };
>>>>>>> origin/master
}
