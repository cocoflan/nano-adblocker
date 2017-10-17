/*******************************************************************************

    uBlock Origin - a browser extension to block requests.
    Copyright (C) 2015-2017 Raymond Hill

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/gorhill/uBlock
*/

'use strict';

/******************************************************************************/

(function() {

/******************************************************************************/

if (
    typeof vAPI !== 'object' ||
    vAPI.domFilterer instanceof Object === false ||
    vAPI.domWatcher instanceof Object === false
) {
    return;
}

var reCSSCombinators = /[ >+~]/,
    matchProp = vAPI.matchesProp,
    simple = { dict: new Set(), str: undefined },
    complex = { dict: new Set(), str:  undefined },
    procedural = { dict: new Map() },
    jobQueue = [];

var DeclarativeSimpleJob = function(node) {
    this.node = node;
};
DeclarativeSimpleJob.prototype.lookup = function(out) {
    if ( simple.dict.size === 0 ) { return; }
    if ( simple.str === undefined ) {
        simple.str = Array.from(simple.dict).join(',\n');
    }
    if (
        (this.node === document || this.node[matchProp](simple.str) === false) &&
        (this.node.querySelector(simple.str) === null)
    ) {
        return;
    }
    for ( var selector of simple.dict ) {
        if (
            this.node !== document && this.node[matchProp](selector) ||
            this.node.querySelector(selector) !== null
        ) {
            out.push(selector);
            simple.dict.delete(selector);
            simple.str = undefined;
            if ( simple.dict.size === 0 ) { return; }
        }
    }
};

var DeclarativeComplexJob = function() {
};
DeclarativeComplexJob.prototype.lookup = function(out) {
    if ( complex.dict.size === 0 ) { return; }
    if ( complex.str === undefined ) {
        complex.str = Array.from(complex.dict).join(',\n');
    }
    if ( document.querySelector(complex.str) === null ) { return; }
    for ( var selector of complex.dict ) {
        if ( document.querySelector(selector) !== null ) {
            out.push(selector);
            complex.dict.delete(selector);
            complex.str = undefined;
            if ( complex.dict.size === 0 ) { return; }
        }
    }
};

var ProceduralJob = function() {
};
ProceduralJob.prototype.lookup = function(out) {
    if ( procedural.dict.size === 0 ) { return; }
    for ( var entry of procedural.dict ) {
        if ( entry[1].test() ) {
            procedural.dict.delete(entry[0]);
            out.push(entry[1].raw);
            if ( procedural.dict.size === 0 ) { return; }
        }
    }
};

var processJobQueue = function() {
    jobQueueTimer.clear();

    var toLog = [],
        t0 = Date.now(),
        job;

    while ( (job = jobQueue.shift()) ) {
        job.lookup(toLog);
        if ( (Date.now() - t0) > 10 ) { break; }
    }

    if ( toLog.length ) {
        vAPI.messaging.send(
            'scriptlets',
            {
                what: 'logCosmeticFilteringData',
                frameURL: window.location.href,
                frameHostname: window.location.hostname,
                matchedSelectors: toLog
            }
        );
    }

    if ( simple.dict.size === 0 && complex.dict.size === 0 ) {
        jobQueue = [];
    }

    if ( jobQueue.length !== 0 ) {
        jobQueueTimer.start(100);
    }
};

var jobQueueTimer = new vAPI.SafeAnimationFrame(processJobQueue);

var domWatcherInterface = {
    onDOMCreated: function() {
        var selectors = vAPI.domFilterer.getAllDeclarativeSelectors().split(',\n');
        for ( var selector of selectors ) {
            if ( reCSSCombinators.test(selector) ) {
                complex.dict.add(selector);
            } else {
                simple.dict.add(selector);
            }
        }
        if ( simple.dict.size !== 0 ) {
            jobQueue.push(new DeclarativeSimpleJob(document));
        }
        if ( complex.dict.size !== 0 ) {
            complex.str = Array.from(complex.dict).join(',\n');
            jobQueue.push(new DeclarativeComplexJob());
        }
        procedural.dict = vAPI.domFilterer.getAllProceduralSelectors();
        if ( procedural.dict.size !== 0 ) {
            jobQueue.push(new ProceduralJob());
        }
        if ( jobQueue.length !== 0 ) {
            jobQueueTimer.start(1);
        }
    },
    onDOMChanged: function(addedNodes) {
        if ( simple.dict.size === 0 && complex.dict.size === 0 ) { return; }
        // This is to guard against runaway job queue. I suspect this could
        // occur on slower devices.
        if ( jobQueue.length <= 300 ) {
            if ( simple.dict.size !== 0 ) {
                for ( var node of addedNodes ) {
                    jobQueue.push(new DeclarativeSimpleJob(node));
                }
            }
            if ( complex.dict.size !== 0 ) {
                jobQueue.push(new DeclarativeComplexJob());
            }
            if ( procedural.dict.size !== 0 ) {
                jobQueue.push(new ProceduralJob());
            }
        }
        if ( jobQueue.length !== 0 ) {
            jobQueueTimer.start(100);
        }
    }
};

vAPI.domWatcher.addListener(domWatcherInterface);

// TODO: be notified of filterset changes.

/******************************************************************************/

})();
