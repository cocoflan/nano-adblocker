/*******************************************************************************

    uBlock Origin - a browser extension to block requests.
    Copyright (C) 2014-2017 Raymond Hill

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

/*******************************************************************************

              +--> [[domSurveyor] --> domFilterer]
  domWatcher--|
              +--> [domCollapser]

  domWatcher:
    Watches for changes in the DOM, and notify the other components about these
    changes.

  domCollapser:
    Enforces the collapsing of DOM elements for which a corresponding
    resource was blocked through network filtering.

  domFilterer:
    Enforces the filtering of DOM elements, by feeding it cosmetic filters.

  domSurveyor:
    Surveys the DOM to find new cosmetic filters to apply to the current page.

  If page is whitelisted:
    - domWatcher: off
    - domCollapser: off
    - domFilterer: off
    - domSurveyor: off
  I verified that the code in this file is completely flushed out of memory
  when a page is whitelisted.

  If cosmetic filtering is disabled:
    - domWatcher: on
    - domCollapser: on
    - domFilterer: off
    - domSurveyor: off

  If generic cosmetic filtering is disabled:
    - domWatcher: on
    - domCollapser: on
    - domFilterer: on
    - domSurveyor: off

  Additionally, the domSurveyor can turn itself off once it decides that
  it has become pointless (repeatedly not finding new cosmetic filters).

  The domFilterer makes use of platform-dependent user styles[1] code, or
  provide a default generic implementation if none is present.
  At time of writing, only modern Firefox provides a custom implementation,
  which makes for solid, reliable and low overhead cosmetic filtering on
  Firefox.
  The generic implementation[2] performs as best as can be, but won't ever be
  as reliable as real user styles.
  [1] "user styles" refer to local CSS rules which have priority over, and
      can't be overriden by a web page's own CSS rules.
  [2] below, see platformUserCSS / platformHideNode / platformUnhideNode

*/

// Abort execution if our global vAPI object does not exist.
//   https://github.com/chrisaljoudi/uBlock/issues/456
//   https://github.com/gorhill/uBlock/issues/2029

if ( typeof vAPI !== 'undefined' ) { // >>>>>>>> start of HUGE-IF-BLOCK

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

// https://github.com/gorhill/uBlock/issues/2147

vAPI.SafeAnimationFrame = function(callback) {
    this.fid = this.tid = null;
    this.callback = callback;
};

vAPI.SafeAnimationFrame.prototype = {
    start: function() {
        if ( this.fid !== null ) { return; }
        this.fid = requestAnimationFrame(this.callback);
        this.tid = vAPI.setTimeout(this.callback, 1200000);
    },
    clear: function() {
        if ( this.fid === null ) { return; }
        cancelAnimationFrame(this.fid);
        clearTimeout(this.tid);
        this.fid = this.tid = null;
    }
};

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

vAPI.domWatcher = (function() {

    var domIsReady = false,
        domLayoutObserver,
        ignoreTags = new Set([ 'br', 'head', 'link', 'meta', 'script', 'style' ]),
        addedNodeLists = [],
        addedNodes = [],
        removedNodes = false,
        listeners = [],
        safeObserverHandlerTimer;

    var safeObserverHandler = function() {
        safeObserverHandlerTimer.clear();
        var i = addedNodeLists.length,
            j = addedNodes.length,
            nodeList, iNode, node;
        while ( i-- ) {
            nodeList = addedNodeLists[i];
            iNode = nodeList.length;
            while ( iNode-- ) {
                node = nodeList[iNode];
                if (
                    node.nodeType === 1 &&
                    ignoreTags.has(node.localName) === false &&
                    node.parentElement !== null
                ) {
                    addedNodes[j++] = node;
                }
            }
        }
        addedNodeLists.length = 0;
        if ( j === 0 && removedNodes === false ) { return; }
        processListeners();
    };

    // https://github.com/chrisaljoudi/uBlock/issues/205
    // Do not handle added node directly from within mutation observer.
    var observerHandler = function(mutations) {
        var nodeList, mutation,
            i = mutations.length;
        while ( i-- ) {
            mutation = mutations[i];
            nodeList = mutation.addedNodes;
            if ( nodeList.length !== 0 ) {
                addedNodeLists.push(nodeList);
            }
            if ( mutation.removedNodes.length !== 0 ) {
                removedNodes = true;
            }
        }
        if ( addedNodeLists.length !== 0 || removedNodes ) {
            safeObserverHandlerTimer.start();
        }
    };

    var startMutationObserver = function() {
        if ( domLayoutObserver !== undefined || !domIsReady ) { return; }
        domLayoutObserver = new MutationObserver(observerHandler);
        domLayoutObserver.observe(document.documentElement, {
            //attributeFilter: [ 'class', 'id' ],
            //attributes: true,
            childList: true,
            subtree: true
        });
        safeObserverHandlerTimer = new vAPI.SafeAnimationFrame(safeObserverHandler);
        vAPI.shutdown.add(cleanup);
    };

    var stopMutationObserver = function() {
        if ( domLayoutObserver === undefined ) { return; }
        cleanup();
        vAPI.shutdown.remove(cleanup);
    };

    var addListener = function(listener) {
        if ( listeners.indexOf(listener) !== -1 ) { return; }
        listeners.push(listener);
        if ( domIsReady ) {
            listener([], false);
        } else {
            startMutationObserver();
        }
    };

    var removeListener = function(listener) {
        var pos = listeners.indexOf(listener);
        if ( pos === -1 ) { return; }
        listeners.splice(pos, 1);
        if ( listeners.length === 0 ) {
            stopMutationObserver();
        }
    };

    var processListeners = function() {
        var ll = listeners.slice();
        for ( var i = 0, n = ll.length; i < n; i++ ) {
            ll[i](addedNodes, removedNodes);
        }
        addedNodes.length = 0;
        removedNodes = false;
    };

    var cleanup = function() {
        if ( domLayoutObserver !== undefined ) {
            domLayoutObserver.disconnect();
            domLayoutObserver = null;
        }
        if ( safeObserverHandlerTimer !== undefined ) {
            safeObserverHandlerTimer.clear();
            safeObserverHandlerTimer = undefined;
        }
    };

    var start = function() {
        domIsReady = true;
        processListeners();
        startMutationObserver();
    };

    return {
        start: start,
        addListener: addListener,
        removeListener: removeListener
    };
})();

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

vAPI.matchesProp = (function() {
    var docElem = document.documentElement;
    if ( typeof docElem.matches !== 'function' ) {
        if ( typeof docElem.mozMatchesSelector === 'function' ) {
            return 'mozMatchesSelector';
        } else if ( typeof docElem.webkitMatchesSelector === 'function' ) {
            return 'webkitMatchesSelector';
        } else if ( typeof docElem.msMatchesSelector === 'function' ) {
            return 'msMatchesSelector';
        }
    }
    return 'matches';
})();

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

vAPI.injectScriptlet = function(doc, text) {
    if ( !doc ) { return; }
    try {
        var script = doc.createElement('script');
        script.appendChild(doc.createTextNode(text));
        (doc.head || doc.documentElement).appendChild(script);
    } catch (ex) {
    }
};

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

// The DOM filterer is the heart of uBO's cosmetic filtering.

vAPI.DOMFilterer = (function() {

    // 'P' stands for 'Procedural'

    var PSelectorHasTask = function(task) {
        this.selector = task[1];
    };
    PSelectorHasTask.prototype.exec = function(input) {
        var output = [];
        for ( var i = 0, n = input.length; i < n; i++ ) {
            if ( input[i].querySelector(this.selector) !== null ) {
                output.push(input[i]);
            }
        }
        return output;
    };

    var PSelectorHasTextTask = function(task) {
        this.needle = new RegExp(task[1]);
    };
    PSelectorHasTextTask.prototype.exec = function(input) {
        var output = [];
        for ( var i = 0, n = input.length; i < n; i++ ) {
            if ( this.needle.test(input[i].textContent) ) {
                output.push(input[i]);
            }
        }
        return output;
    };

    var PSelectorIfTask = function(task) {
        this.pselector = new PSelector(task[1]);
    };
    PSelectorIfTask.prototype.target = true;
    PSelectorIfTask.prototype.exec = function(input) {
        var output = [];
        for ( var i = 0, n = input.length; i < n; i++ ) {
            if ( this.pselector.test(input[i]) === this.target ) {
                output.push(input[i]);
            }
        }
        return output;
    };

    var PSelectorIfNotTask = function(task) {
        PSelectorIfTask.call(this, task);
        this.target = false;
    };
    PSelectorIfNotTask.prototype = Object.create(PSelectorIfTask.prototype);
    PSelectorIfNotTask.prototype.constructor = PSelectorIfNotTask;

    var PSelectorMatchesCSSTask = function(task) {
        this.name = task[1].name;
        this.value = new RegExp(task[1].value);
    };
    PSelectorMatchesCSSTask.prototype.pseudo = null;
    PSelectorMatchesCSSTask.prototype.exec = function(input) {
        var output = [], style;
        for ( var i = 0, n = input.length; i < n; i++ ) {
            style = window.getComputedStyle(input[i], this.pseudo);
            if ( style === null ) { return null; } /* FF */
            if ( this.value.test(style[this.name]) ) {
                output.push(input[i]);
            }
        }
        return output;
    };

    var PSelectorMatchesCSSAfterTask = function(task) {
        PSelectorMatchesCSSTask.call(this, task);
        this.pseudo = ':after';
    };
    PSelectorMatchesCSSAfterTask.prototype = Object.create(PSelectorMatchesCSSTask.prototype);
    PSelectorMatchesCSSAfterTask.prototype.constructor = PSelectorMatchesCSSAfterTask;

    var PSelectorMatchesCSSBeforeTask = function(task) {
        PSelectorMatchesCSSTask.call(this, task);
        this.pseudo = ':before';
    };
    PSelectorMatchesCSSBeforeTask.prototype = Object.create(PSelectorMatchesCSSTask.prototype);
    PSelectorMatchesCSSBeforeTask.prototype.constructor = PSelectorMatchesCSSBeforeTask;

    var PSelectorXpathTask = function(task) {
        this.xpe = document.createExpression(task[1], null);
        this.xpr = null;
    };
    PSelectorXpathTask.prototype.exec = function(input) {
        var output = [], j, node;
        for ( var i = 0, n = input.length; i < n; i++ ) {
            this.xpr = this.xpe.evaluate(
                input[i],
                XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
                this.xpr
            );
            j = this.xpr.snapshotLength;
            while ( j-- ) {
                node = this.xpr.snapshotItem(j);
                if ( node.nodeType === 1 ) {
                    output.push(node);
                }
            }
        }
        return output;
    };

    var PSelector = function(o) {
        if ( PSelector.prototype.operatorToTaskMap === undefined ) {
            PSelector.prototype.operatorToTaskMap = new Map([
                [ ':has', PSelectorHasTask ],
                [ ':has-text', PSelectorHasTextTask ],
                [ ':if', PSelectorIfTask ],
                [ ':if-not', PSelectorIfNotTask ],
                [ ':matches-css', PSelectorMatchesCSSTask ],
                [ ':matches-css-after', PSelectorMatchesCSSAfterTask ],
                [ ':matches-css-before', PSelectorMatchesCSSBeforeTask ],
                [ ':xpath', PSelectorXpathTask ]
            ]);
        }
        this.raw = o.raw;
        this.selector = o.selector;
        this.tasks = [];
        var tasks = o.tasks;
        if ( !tasks ) { return; }
        for ( var i = 0, task, ctor; i < tasks.length; i++ ) {
            task = tasks[i];
            ctor = this.operatorToTaskMap.get(task[0]);
            this.tasks.push(new ctor(task));
        }
    };
    PSelector.prototype.operatorToTaskMap = undefined;
    PSelector.prototype.prime = function(input) {
        var root = input || document;
        if ( this.selector !== '' ) {
            return root.querySelectorAll(this.selector);
        }
        return [ root ];
    };
    PSelector.prototype.exec = function(input) {
        //var t0 = window.performance.now();
        var tasks = this.tasks, nodes = this.prime(input);
        for ( var i = 0, n = tasks.length; i < n && nodes.length !== 0; i++ ) {
            nodes = tasks[i].exec(nodes);
        }
        //console.log('%s: %s ms', this.raw, (window.performance.now() - t0).toFixed(2));
        return nodes;
    };
    PSelector.prototype.test = function(input) {
        //var t0 = window.performance.now();
        var tasks = this.tasks, nodes = this.prime(input), AA = [ null ], aa;
        for ( var i = 0, ni = nodes.length; i < ni; i++ ) {
            AA[0] = nodes[i]; aa = AA;
            for ( var j = 0, nj = tasks.length; j < nj && aa.length !== 0; j++ ) {
                aa = tasks[j].exec(aa);
            }
            if ( aa.length !== 0 ) { return true; }
        }
        //console.log('%s: %s ms', this.raw, (window.performance.now() - t0).toFixed(2));
        return false;
    };

    var DOMProceduralFilterer = function(domFilterer) {
        this.domFilterer = domFilterer;
        this.domIsReady = false;
        this.addedSelectors = new Map();
        this.addedNodes = false;
        this.removedNodes = false;
        this.addedNodesHandlerMissCount = 0;
        this.currentResultset = new Set();
        this.selectors = new Map();
    };

    DOMProceduralFilterer.prototype = {

        addProceduralSelectors: function(aa) {
            var raw, o, pselector,
                mustCommit = this.domChangedHandlerBound !== null;
            for ( var i = 0, n = aa.length; i < n; i++ ) {
                raw = aa[i];
                o = JSON.parse(raw);
                if ( o.style ) {
                    this.domFilterer.addCSSRule(o.style[0], o.style[1]);
                    mustCommit = true;
                    continue;
                }
                if ( o.pseudoclass ) {
                    this.domFilterer.addCSSRule(
                        o.raw,
                        'display: none !important;'
                    );
                    mustCommit = true;
                    continue;
                }
                if ( o.tasks ) {
                    if ( this.selectors.has(raw) === false ) {
                        pselector = new PSelector(o);
                        this.selectors.set(raw, pselector);
                        this.addedSelectors.set(raw, pselector);
                        mustCommit = true;
                    }
                    continue;
                }
            }
            if ( mustCommit ) {
                this.domFilterer.commit();
            }
            if ( this.domChangedHandlerBound === null ) {
                this.domChangedHandlerInit();
            }
        },

        commitNow: function() {
            if ( this.domIsReady === false ) { return; }

            if ( this.addedNodes || this.removedNodes ) {
                this.addedSelectors.clear();
            }

            var currentResultset = this.currentResultset,
                entry, nodes, i, node;

            if ( this.addedSelectors.size !== 0 ) {
                console.time('procedural filterset changed');
                for ( entry of this.addedSelectors ) {
                    nodes = entry[1].exec();
                    i = nodes.length;
                    while ( i-- ) {
                        node = nodes[i];
                        this.domFilterer.hideNode(node);
                        currentResultset.add(node);
                    }
                }
                this.addedSelectors.clear();
                console.timeEnd('procedural filterset changed');
                return;
            }

            this.addedNodes = this.removedNodes = false;

            if ( this.selectors.size === 0 ) { return; }

            console.time('dom layout changed/procedural selectors');

            var afterResultset = new Set();

            for ( entry of this.selectors ) {
                nodes = entry[1].exec();
                i = nodes.length;
                while ( i-- ) {
                    node = nodes[i];
                    this.domFilterer.hideNode(node);
                    afterResultset.add(node);
                }
            }
            if ( afterResultset.size !== currentResultset.size ) {
                this.addedNodesHandlerMissCount = 0;
            } else {
                this.addedNodesHandlerMissCount += 1;
            }
            for ( node of currentResultset ) {
                if ( afterResultset.has(node) === false ) {
                    this.domFilterer.unhideNode(node);
                }
            }

            this.currentResultset = afterResultset;

            console.timeEnd('dom layout changed/procedural selectors');
        },

        createProceduralFilter: function(o) {
            return new PSelector(o);
        },

        domCreatedHandler: function() {
            this.domIsReady = true;
        },

        domChangedHandler: function(addedNodes, removedNodes) {
            if ( addedNodes.length === 0 && removedNodes === false ) {
                this.domCreatedHandler();
            }
            this.addedNodes = this.addedNodes || addedNodes.length !== 0;
            this.removedNodes = this.removedNodes || removedNodes;
            this.domFilterer.commit();
        },

        domChangedHandlerBound: null,

        domChangedHandlerInit: function() {
            if ( this.domChangedHandlerBound !== null ) { return; }
            if ( this.selectors.length === 0 ) { return; }
            if ( vAPI.domWatcher instanceof Object ) {
                this.domChangedHandlerBound = this.domChangedHandler.bind(this);
                vAPI.domWatcher.addListener(this.domChangedHandlerBound);
            }
        }
    };

    var DOMFiltererBase = vAPI.DOMFilterer;

    var domFilterer = function() {
        DOMFiltererBase.call(this);
        this.proceduralFilterer = new DOMProceduralFilterer(this);
    };
    domFilterer.prototype = Object.create(DOMFiltererBase.prototype);
    domFilterer.prototype.constructor = domFilterer;

    domFilterer.prototype.commitNow = function() {
        DOMFiltererBase.prototype.commitNow.call(this);
        this.proceduralFilterer.commitNow();
    };

    domFilterer.prototype.addProceduralSelectors = function(aa) {
        this.proceduralFilterer.addProceduralSelectors(aa);
    };

    domFilterer.prototype.createProceduralFilter = function(o) {
        this.proceduralFilterer.createProceduralFilter(o);
    };

    domFilterer.prototype.toggleLogging = function() {
    };

    return domFilterer;
})();

vAPI.domFilterer = new vAPI.DOMFilterer();

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

vAPI.domCollapser = (function() {
    var resquestIdGenerator = 1,
        processTimer,
        toProcess = [],
        toFilter = [],
        toCollapse = new Map(),
        cachedBlockedSet,
        cachedBlockedSetHash,
        cachedBlockedSetTimer;
    var src1stProps = {
        'embed': 'src',
        'iframe': 'src',
        'img': 'src',
        'object': 'data'
    };
    var src2ndProps = {
        'img': 'srcset'
    };
    var tagToTypeMap = {
        embed: 'object',
        iframe: 'sub_frame',
        img: 'image',
        object: 'object'
    };
    var netSelectorCacheCount = 0,
        messaging = vAPI.messaging;

    var cachedBlockedSetClear = function() {
        cachedBlockedSet =
        cachedBlockedSetHash =
        cachedBlockedSetTimer = undefined;
    };

    // https://github.com/chrisaljoudi/uBlock/issues/174
    //   Do not remove fragment from src URL
    var onProcessed = function(response) {
        if ( !response ) { // This happens if uBO is disabled or restarted.
            toCollapse.clear();
            return;
        }

        var targets = toCollapse.get(response.id);
        if ( targets === undefined ) { return; }
        toCollapse.delete(response.id);
        if ( cachedBlockedSetHash !== response.hash ) {
            cachedBlockedSet = new Set(response.blockedResources);
            cachedBlockedSetHash = response.hash;
            if ( cachedBlockedSetTimer !== undefined ) {
                clearTimeout(cachedBlockedSetTimer);
            }
            cachedBlockedSetTimer = vAPI.setTimeout(cachedBlockedSetClear, 30000);
        }
        if ( cachedBlockedSet === undefined || cachedBlockedSet.size === 0 ) {
            return;
        }
        var selectors = [],
            iframeLoadEventPatch = vAPI.iframeLoadEventPatch,
            netSelectorCacheCountMax = response.netSelectorCacheCountMax,
            tag, prop, src, value;

        for ( var target of targets ) {
            tag = target.localName;
            prop = src1stProps[tag];
            if ( prop === undefined ) { continue; }
            src = target[prop];
            if ( typeof src !== 'string' || src.length === 0 ) {
                prop = src2ndProps[tag];
                if ( prop === undefined ) { continue; }
                src = target[prop];
                if ( typeof src !== 'string' || src.length === 0 ) { continue; }
            }
            if ( cachedBlockedSet.has(tagToTypeMap[tag] + ' ' + src) === false ) {
                continue;
            }
            // https://github.com/chrisaljoudi/uBlock/issues/399
            // Never remove elements from the DOM, just hide them
            target.style.setProperty('display', 'none', 'important');
            target.hidden = true;
            // https://github.com/chrisaljoudi/uBlock/issues/1048
            // Use attribute to construct CSS rule
            if (
                netSelectorCacheCount <= netSelectorCacheCountMax &&
                (value = target.getAttribute(prop))
            ) {
                selectors.push(tag + '[' + prop + '="' + value + '"]');
                netSelectorCacheCount += 1;
            }
            if ( iframeLoadEventPatch !== undefined ) {
                iframeLoadEventPatch(target);
            }
        }
        if ( selectors.length !== 0 ) {
            messaging.send(
                'contentscript',
                {
                    what: 'cosmeticFiltersInjected',
                    type: 'net',
                    hostname: window.location.hostname,
                    selectors: selectors
                }
            );
        }
    };

    var send = function() {
        processTimer = undefined;
        toCollapse.set(resquestIdGenerator, toProcess);
        var msg = {
            what: 'getCollapsibleBlockedRequests',
            id: resquestIdGenerator,
            frameURL: window.location.href,
            resources: toFilter,
            hash: cachedBlockedSetHash
        };
        messaging.send('contentscript', msg, onProcessed);
        toProcess = [];
        toFilter = [];
        resquestIdGenerator += 1;
    };

    var process = function(delay) {
        if ( toProcess.length === 0 ) { return; }
        if ( delay === 0 ) {
            if ( processTimer !== undefined ) {
                clearTimeout(processTimer);
            }
            send();
        } else if ( processTimer === undefined ) {
            processTimer = vAPI.setTimeout(send, delay || 20);
        }
    };

    var add = function(target) {
        toProcess[toProcess.length] = target;
    };

    var addMany = function(targets) {
        var i = targets.length;
        while ( i-- ) {
            add(targets[i]);
        }
    };

    var iframeSourceModified = function(mutations) {
        var i = mutations.length;
        while ( i-- ) {
            addIFrame(mutations[i].target, true);
        }
        process();
    };
    var iframeSourceObserver = new MutationObserver(iframeSourceModified);
    var iframeSourceObserverOptions = {
        attributes: true,
        attributeFilter: [ 'src' ]
    };

    var primeLocalIFrame = function(iframe) {
        // Should probably also copy injected styles.
        // The injected scripts are those which were injected in the current
        // document, from within the `contentscript-start.js / injectScripts`,
        // and which scripts are selectively looked-up from:
        // https://github.com/gorhill/uBlock/blob/master/assets/ublock/resources.txt
        if ( vAPI.injectedScripts ) {
            vAPI.injectScriptlet(iframe.contentDocument, vAPI.injectedScripts);
        }
    };

    var addIFrame = function(iframe, dontObserve) {
        // https://github.com/gorhill/uBlock/issues/162
        // Be prepared to deal with possible change of src attribute.
        if ( dontObserve !== true ) {
            iframeSourceObserver.observe(iframe, iframeSourceObserverOptions);
        }

        var src = iframe.src;
        if ( src === '' || typeof src !== 'string' ) {
            primeLocalIFrame(iframe);
            return;
        }
        if ( src.lastIndexOf('http', 0) !== 0 ) { return; }
        toFilter[toFilter.length] = {
            type: 'sub_frame',
            url: iframe.src
        };
        add(iframe);
    };

    var addIFrames = function(iframes) {
        var i = iframes.length;
        while ( i-- ) {
            addIFrame(iframes[i]);
        }
    };

    var onResourceFailed = function(ev) {
        if ( tagToTypeMap[ev.target.localName] !== undefined ) {
            add(ev.target);
            process();
        }
    };

    var domCreatedHandler = function() {
        if ( vAPI instanceof Object === false ) { return; }
        if ( vAPI.domCollapser instanceof Object === false ) {
            if ( vAPI.domWatcher instanceof Object ) {
                vAPI.domWatcher.removeListener(domChangedHandler);
            }
            return;
        }
        // Listener to collapse blocked resources.
        // - Future requests not blocked yet
        // - Elements dynamically added to the page
        // - Elements which resource URL changes
        // https://github.com/chrisaljoudi/uBlock/issues/7
        // Preferring getElementsByTagName over querySelectorAll:
        //   http://jsperf.com/queryselectorall-vs-getelementsbytagname/145
        var elems = document.images || document.getElementsByTagName('img'),
            i = elems.length, elem;
        while ( i-- ) {
            elem = elems[i];
            if ( elem.complete ) {
                add(elem);
            }
        }
        addMany(document.embeds || document.getElementsByTagName('embed'));
        addMany(document.getElementsByTagName('object'));
        addIFrames(document.getElementsByTagName('iframe'));
        process(0);

        document.addEventListener('error', onResourceFailed, true);

        vAPI.shutdown.add(function() {
            document.removeEventListener('error', onResourceFailed, true);
            if ( processTimer !== undefined ) {
                clearTimeout(processTimer);
            }
        });
    };

    var domChangedHandler = function(addedNodes, removedNodes) {
        var ni = addedNodes.length;
        if ( ni === 0 && removedNodes === false ) { return domCreatedHandler(); }
        for ( var i = 0, node; i < ni; i++ ) {
            node = addedNodes[i];
            if ( node.localName === 'iframe' ) {
                addIFrame(node);
            }
            if ( node.childElementCount === 0 ) { continue; }
            var iframes = node.getElementsByTagName('iframe');
            if ( iframes.length !== 0 ) {
                addIFrames(iframes);
            }
        }
        process();
    };

    if ( vAPI.domWatcher instanceof Object ) {
        vAPI.domWatcher.addListener(domChangedHandler);
    }

    return {
        add: add,
        addMany: addMany,
        addIFrame: addIFrame,
        addIFrames: addIFrames,
        process: process
    };
})();

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

vAPI.domSurveyor = (function() {
    var messaging = vAPI.messaging,
        cosmeticSurveyingMissCount = 0,
        queriedIds = new Set(),
        queriedClasses = new Set(),
        surveyCost = 0;

    // Handle main process' response.

    var surveyPhase3 = function(response) {
        var result = response && response.result,
            simpleSelectors,
            complexSelectors,
            mustCommit = false;

        if ( result ) {
            simpleSelectors = result.simple || [];
            if ( simpleSelectors.length ) {
                vAPI.domFilterer.addCSSRule(
                    simpleSelectors,
                    'display: none !important;',
                    { type: 'simple' }
                );
                mustCommit = true;
            }
            complexSelectors = result.complex || [];
            if ( complexSelectors.length ) {
                vAPI.domFilterer.addCSSRule(
                    complexSelectors,
                    'display: none !important;',
                    { type: 'complex' }
                );
                mustCommit = true;
            }
            if ( mustCommit ) {
                vAPI.domFilterer.commit();
            }
        }

/*
        if ( selectors.length !== 0 ) {
            messaging.send(
                'contentscript',
                {
                    what: 'cosmeticFiltersInjected',
                    type: 'cosmetic',
                    hostname: window.location.hostname,
                    selectors: selectors,
                    cost: surveyCost
                }
            );
        }

        // Shutdown surveyor if too many consecutive empty resultsets.
        if ( selectors.length === 0 ) {
            cosmeticSurveyingMissCount += 1;
        } else {
            cosmeticSurveyingMissCount = 0;
        }
*/
    };

    // Extract all classes/ids: these will be passed to the cosmetic
    // filtering engine, and in return we will obtain only the relevant
    // CSS selectors.

    // https://github.com/gorhill/uBlock/issues/672
    // http://www.w3.org/TR/2014/REC-html5-20141028/infrastructure.html#space-separated-tokens
    // http://jsperf.com/enumerate-classes/6

    var surveyPhase1 = function(idNodes, classNodes) {
        var t0 = window.performance.now(),
            rews = reWhitespace,
            qq, iout, nodes, i, node, v, vv, j;
        var ids = [];
        iout = 0;
        qq = queriedIds;
        nodes = idNodes;
        i = nodes.length;
        while ( i-- ) {
            node = nodes[i];
            v = node.id;
            if ( typeof v !== 'string' ) { continue; }
            v = v.trim();
            if ( qq.has(v) === false && v.length !== 0 ) {
                ids[iout++] = v; qq.add(v);
            }
        }
        var classes = [];
        iout = 0;
        qq = queriedClasses;
        nodes = classNodes;
        i = nodes.length;
        while ( i-- ) {
            node = nodes[i];
            vv = node.className;
            if ( typeof vv !== 'string' ) { continue; }
            if ( rews.test(vv) === false ) {
                if ( qq.has(vv) === false && vv.length !== 0 ) {
                    classes[iout++] = vv; qq.add(vv);
                }
            } else {
                vv = node.classList;
                j = vv.length;
                while ( j-- ) {
                    v = vv[j];
                    if ( qq.has(v) === false ) {
                        classes[iout++] = v; qq.add(v);
                    }
                }
            }
        }
        surveyCost += window.performance.now() - t0;
        // Phase 2: Ask main process to lookup relevant cosmetic filters.
        if ( ids.length !== 0 || classes.length !== 0 ) {
            messaging.send(
                'contentscript',
                {
                    what: 'retrieveGenericCosmeticSelectors',
                    frameURL: window.location.href,
                    ids: ids.join('\n'),
                    classes: classes.join('\n'),
                    cost: surveyCost
                },
                surveyPhase3
            );
        } else {
            surveyPhase3(null);
        }
    };
    var reWhitespace = /\s/;

    var domCreatedHandler = function() {
        if ( vAPI instanceof Object === false ) { return; }
        if (
            vAPI.domSurveyor instanceof Object === false ||
            vAPI.domFilterer instanceof Object === false
        ) {
            if ( vAPI.domWatcher instanceof Object ) {
                vAPI.domWatcher.removeListener(domChangedHandler);
            }
            return;
        }
        console.time('dom layout created/dom surveyor');
        surveyPhase1(
            document.querySelectorAll('[id]'),
            document.querySelectorAll('[class]')
        );
        console.timeEnd('dom layout created/dom surveyor');
    };

    var domChangedHandler = function(addedNodes, removedNodes) {
        if ( addedNodes.length === 0 && removedNodes === false ) {
            return domCreatedHandler();
        }
        if ( cosmeticSurveyingMissCount > 255 ) {
            vAPI.domWatcher.removeListener(domChangedHandler);
            vAPI.domSurveyor = null;
            return;
        }
        console.time('dom layout changed/dom surveyor');
        var idNodes = [], iid = 0,
            classNodes = [], iclass = 0;
        var i = addedNodes.length,
            node, nodeList, j;
        while ( i-- ) {
            node = addedNodes[i];
            idNodes[iid++] = node;
            classNodes[iclass++] = node;
            if ( node.childElementCount === 0 ) { continue; }
            nodeList = node.querySelectorAll('[id]');
            j = nodeList.length;
            while ( j-- ) {
                idNodes[iid++] = nodeList[j];
            }
            nodeList = node.querySelectorAll('[class]');
            j = nodeList.length;
            while ( j-- ) {
                classNodes[iclass++] = nodeList[j];
            }
        }
        surveyPhase1(idNodes, classNodes);
        console.timeEnd('dom layout changed/dom surveyor');
    };

    if ( vAPI.domWatcher instanceof Object ) {
        vAPI.domWatcher.addListener(domChangedHandler);
    }

    return {};
})();

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

// This is executed once, and since no hooks are left behind once the response
// is received, I expect this code to be garbage collected by the browser.

(function domIsLoading() {

    var domLoadedHandler = function(ev) {
        // This can happen on Firefox. For instance:
        // https://github.com/gorhill/uBlock/issues/1893
        if ( window.location === null ) { return; }

        if ( ev ) {
            document.removeEventListener('DOMContentLoaded', domLoadedHandler);
        }

        if ( vAPI instanceof Object && vAPI.domWatcher instanceof Object ) {
            vAPI.domWatcher.start();
        }

        // To send mouse coordinates to main process, as the chrome API fails
        // to provide the mouse position to context menu listeners.
        // https://github.com/chrisaljoudi/uBlock/issues/1143
        // Also, find a link under the mouse, to try to avoid confusing new tabs
        // as nuisance popups.
        // Ref.: https://developer.mozilla.org/en-US/docs/Web/Events/contextmenu

        var onMouseClick = function(ev) {
            var elem = ev.target;
            while ( elem !== null && elem.localName !== 'a' ) {
                elem = elem.parentElement;
            }
            vAPI.messaging.send(
                'contentscript',
                {
                    what: 'mouseClick',
                    x: ev.clientX,
                    y: ev.clientY,
                    url: elem !== null && ev.isTrusted !== false ? elem.href : ''
                }
            );
        };

        (function() {
            if ( window !== window.top || !vAPI.domFilterer ) {
                return;
            }
            document.addEventListener('mousedown', onMouseClick, true);

            // https://github.com/gorhill/uMatrix/issues/144
            vAPI.shutdown.add(function() {
                document.removeEventListener('mousedown', onMouseClick, true);
            });
        })();
    };

    var responseHandler = function(response) {
        // cosmetic filtering engine aka 'cfe'
        var cfeDetails = response && response.specificCosmeticFilters;
        if ( !cfeDetails || !cfeDetails.ready ) {
            vAPI.domWatcher = vAPI.domCollapser = vAPI.domFilterer =
            vAPI.domSurveyor = vAPI.domIsLoaded = null;
            return;
        }

        if ( response.noCosmeticFiltering ) {
            vAPI.domFilterer = null;
            vAPI.domSurveyor = null;
        } else {
            var domFilterer = vAPI.domFilterer;
            domFilterer.toggleLogging(response.loggerEnabled);
            if ( response.noGenericCosmeticFiltering || cfeDetails.noDOMSurveying ) {
                vAPI.domSurveyor = null;
            }
            //domFilterer.addExceptionSelectors(cfeDetails.exceptionFilters);
            domFilterer.addCSSRule(
                cfeDetails.declarativeFilters,
                'display: none !important;'
            );
            domFilterer.addCSSRule(
                cfeDetails.highGenericHideSimple,
                'display: none !important;',
                { type: 'simple', lazy: true }
            );
            domFilterer.addCSSRule(
                cfeDetails.highGenericHideComplex,
                'display: none !important;',
                { type: 'complex', lazy: true }
            );
            domFilterer.addProceduralSelectors(cfeDetails.proceduralFilters);
            domFilterer.commit();
        }

        var parent = document.head || document.documentElement;
        if ( parent ) {
            var elem, text;
            if ( cfeDetails.netHide.length !== 0 ) {
                elem = document.createElement('style');
                elem.setAttribute('type', 'text/css');
                text = cfeDetails.netHide.join(',\n');
                text += response.collapseBlocked ?
                    '\n{ display:none !important; }' :
                    '\n{ visibility:hidden !important; }';
                elem.appendChild(document.createTextNode(text));
                parent.appendChild(elem);
            }
            // Library of resources is located at:
            // https://github.com/gorhill/uBlock/blob/master/assets/ublock/resources.txt
            if ( cfeDetails.scripts ) {
                // Have the injected script tag remove itself when execution completes:
                // to keep DOM as clean as possible.
                text = cfeDetails.scripts +
                    "\n" +
                    "(function() {\n" +
                    "    var c = document.currentScript,\n" +
                    "        p = c && c.parentNode;\n" +
                    "    if ( p ) {\n" +
                    "        p.removeChild(c);\n" +
                    "    }\n" +
                    "})();";
                vAPI.injectScriptlet(document, text);
                vAPI.injectedScripts = text;
            }
        }

        // https://github.com/chrisaljoudi/uBlock/issues/587
        // If no filters were found, maybe the script was injected before
        // uBlock's process was fully initialized. When this happens, pages
        // won't be cleaned right after browser launch.
        if (
            typeof document.readyState === 'string' &&
            document.readyState !== 'loading'
        ) {
            domLoadedHandler();
        } else {
            document.addEventListener('DOMContentLoaded', domLoadedHandler);
        }
    };

    var url = window.location.href;
    vAPI.messaging.send(
        'contentscript',
        {
            what: 'retrieveContentScriptParameters',
            pageURL: url,
            locationURL: url
        },
        responseHandler
    );

})();

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

} // <<<<<<<< end of HUGE-IF-BLOCK
