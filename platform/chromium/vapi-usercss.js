/*******************************************************************************

    uBlock Origin - a browser extension to block requests.
    Copyright (C) 2017 Raymond Hill

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

// For content pages

// Abort execution if our global vAPI object does not exist.
//   https://github.com/chrisaljoudi/uBlock/issues/456
//   https://github.com/gorhill/uBlock/issues/2029

if ( typeof vAPI !== 'undefined' ) { // >>>>>>>> start of HUGE-IF-BLOCK

/******************************************************************************/
/******************************************************************************/

vAPI.DOMFilterer = function() {
    this.commitTimer = new vAPI.SafeAnimationFrame(this.commitNow.bind(this));
    this.domIsReady = document.readyState !== 'loading';
    this.hideNodeId = vAPI.randomToken();
    this.hideNodeStylesheet = false;
    this.addedNodes = new Set();
    this.removedNodes = false;

    this.specificSimpleHide = new Set();
    this.specificSimpleHideAggregated = undefined;
    this.addedSpecificSimpleHide = [];
    this.specificComplexHide = new Set();
    this.specificComplexHideAggregated = undefined;
    this.addedSpecificComplexHide = [];

    this.genericSimpleHide = new Set();
    this.genericComplexHide = new Set();

    this.exceptions = [];

    this.userStylesheet = {
        style: null,
        css: new Set(),
        disabled: false,
        add: function(cssText) {
            if ( cssText === '' || this.css.has(cssText) ) { return; }
            if ( this.style === null ) {
                this.style = document.createElement('style');
                this.style.disabled = this.disabled;
                var parent = document.head || document.documentElement;
                if ( parent !== null ) {
                    parent.appendChild(this.style);
                }
            }
            this.style.sheet.insertRule(
                cssText,
                this.style.sheet.cssRules.length
            );
        },
        remove: function(cssText) {
            if ( cssText === '' ) { return; }
            if ( this.css.has(cssText) === false ) { return; }
            if ( this.style === null ) { return; }
            this.css.delete(cssText);
            var rules = this.style.sheet.cssRules,
                i = rules.length;
            while ( i-- ) {
                if ( rules[i].cssText === cssText ) {
                    this.style.sheet.deleteRule(i);
                }
            }
            if ( rules.length === 0 ) {
                var parent = this.style.parentNode;
                if ( parent !== null ) {
                    parent.removeChild(this.style);
                }
                this.style = null;
            }
        },
        toggle: function(state) {
            if ( state === undefined ) { state = this.disabled; }
            if ( state !== this.disabled ) { return; }
            this.disabled = !state;
            if ( this.style !== null ) {
                this.style.disabled = this.disabled;
            }
        },
        getAllSelectors: function() {
            var out = [];
            var rules = this.style &&
                        this.style.sheet &&
                        this.style.sheet.cssRules;
            if ( rules instanceof Object === false ) { return out; }
            var i = rules.length;
            while ( i-- ) {
                out.push(rules.item(i).selectorText);
            }
            return out;
        }
    };

    this.hideNodeExpando = undefined;
    this.hideNodeBatchProcessTimer = undefined;
    this.hiddenNodeObserver = undefined;
    this.hiddenNodesetToProcess = new Set();
    this.hiddenNodeset = new Set();

    if ( vAPI.domWatcher instanceof Object ) {
        vAPI.domWatcher.addListener(this);
    }
};

vAPI.DOMFilterer.prototype = {
    reHideStyle: /^display: none !important;$/,

    // https://www.w3.org/community/webed/wiki/CSS/Selectors#Combinators
    reCSSCombinators: /[ >+~]/,

    commitNow: function() {
        this.commitTimer.clear();

        if ( this.domIsReady !== true || this.userStylesheet.disabled ) {
            return;
        }

        var nodes, node;

        // Filterset changed.

        if ( this.addedSpecificSimpleHide.length !== 0 ) {
            console.time('specific simple filterset changed');
            console.log('added %d specific simple selectors', this.addedSpecificSimpleHide.length);
            nodes = document.querySelectorAll(this.addedSpecificSimpleHide.join(','));
            for ( node of nodes ) {
                this.hideNode(node);
            }
            this.addedSpecificSimpleHide = [];
            this.specificSimpleHideAggregated = undefined;
            console.timeEnd('specific simple filterset changed');
        }

        if ( this.addedSpecificComplexHide.length !== 0 ) {
            console.time('specific complex filterset changed');
            console.log('added %d specific complex selectors', this.addedSpecificComplexHide.length);
            nodes = document.querySelectorAll(this.addedSpecificComplexHide.join(','));
            for ( node of nodes ) {
                this.hideNode(node);
            }
            this.addedSpecificComplexHide = [];
            this.specificComplexHideAggregated = undefined;
            console.timeEnd('specific complex filterset changed');
        }

        // DOM layout changed.

        var domNodesAdded = this.addedNodes.size !== 0,
            domLayoutChanged = domNodesAdded || this.removedNodes;

        if ( domNodesAdded === false || domLayoutChanged === false ) {
            return;
        }

        console.log('%d nodes added', this.addedNodes.size);

        if ( this.specificSimpleHide.size !== 0 && domNodesAdded ) {
            console.time('dom layout changed/specific simple selectors');
            if ( this.specificSimpleHideAggregated === undefined ) {
                this.specificSimpleHideAggregated =
                    Array.from(this.specificSimpleHide).join(',\n');
            }
            for ( node of this.addedNodes ) {
                if ( node[vAPI.matchesProp](this.specificSimpleHideAggregated) ) {
                    this.hideNode(node);
                }
                nodes = node.querySelectorAll(this.specificSimpleHideAggregated);
                for ( node of nodes ) {
                    this.hideNode(node);
                }
            }
            console.timeEnd('dom layout changed/specific simple selectors');
        }

        if ( this.specificComplexHide.size !== 0 && domLayoutChanged ) {
            console.time('dom layout changed/specific complex selectors');
            if ( this.specificComplexHideAggregated === undefined ) {
                this.specificComplexHideAggregated =
                    Array.from(this.specificComplexHide).join(',\n');
            }
            nodes = document.querySelectorAll(this.specificComplexHideAggregated);
            for ( node of nodes ) {
                this.hideNode(node);
            }
            console.timeEnd('dom layout changed/specific complex selectors');
        }

        this.addedNodes.clear();
        this.removedNodes = false;
    },

    commit: function(now) {
        if ( now ) {
            this.commitTimer.clear();
            this.commitNow();
        } else {
            this.commitTimer.start();
        }
    },

    addCSSRule: function(selectors, declarations, options) {
        if ( selectors === undefined ) { return; }

        if ( options === undefined ) { options = {}; }

        var isSpecific = options.lazy !== true,
            isHide = this.reHideStyle.test(declarations),
            isSimple = options.type === 'simple',
            isComplex = options.type === 'complex',
            selectorsArr, selectorsStr, selector;

        if ( isSpecific && isHide ) {
            selectorsArr = Array.isArray(selectors) ?
                selectors :
                selectors.split(',\n');
            var newSelectors = [];
            for ( selector of selectorsArr ) {
                if (
                    isComplex ||
                    isSimple === false && this.reCSSCombinators.test(selector)
                ) {
                    if ( this.specificComplexHide.has(selector) === false ) {
                        this.specificComplexHide.add(selector);
                        this.addedSpecificComplexHide.push(selector);
                        newSelectors.push(selector);
                    }
                } else if ( this.specificSimpleHide.has(selector) === false ) {
                    this.specificSimpleHide.add(selector);
                    this.addedSpecificSimpleHide.push(selector);
                    newSelectors.push(selector);
                }
            }
            if ( newSelectors.length !== 0 ) {
                this.userStylesheet.add(
                    newSelectors.join(',\n') +
                    '\n{ display: none !important; }'
                );
            }
            return;
        }

        selectorsStr = Array.isArray(selectors) ?
            selectors.join(',\n') :
            selectors;
        if ( selectorsStr.length === 0 ) { return; }

        if ( isHide === false ) {
            this.userStylesheet.add(
                selectorsStr +
                '\n{ ' + declarations + ' }'
            );
            return;
        }

        // At this point, it should always been hiding filters -- because only
        // these can be generic.

        if ( isSimple ) {
            if ( this.genericSimpleHide.has(selectorsStr) === false ) {
                this.genericSimpleHide.add(selectorsStr);
                this.userStylesheet.add(
                    selectorsStr +
                    '\n{ display: none !important; }'
                );
            }
            return;
        }

        if ( isComplex ) {
            if ( this.genericComplexHide.has(selectorsStr) === false ) {
                this.genericComplexHide.add(selectorsStr);
                this.userStylesheet.add(
                    selectorsStr +
                    '\n{ display: none !important; }'
                );
            }
            return;
        }

        selectorsArr = Array.isArray(selectors) ?
            selectors :
            selectors.split(',\n');
        var i = selectorsArr.length;
        while ( i-- ) {
            selector = selectorsArr[i];
            if ( this.reCSSCombinators.test(selector) ) {
                if ( this.genericComplexHide.has(selector) === false ) {
                    this.genericComplexHide.add(selector);
                }
            } else if ( this.genericSimpleHide.has(selector) === false ) {
                this.genericSimpleHide.add(selector);
            }
        }
    },

    onDOMCreated: function() {
        this.domIsReady = true;
        this.addedNodes.clear();
        this.removedNodes = false;
        this.commit();
    },

    onDOMChanged: function(addedNodes, removedNodes) {
        for ( var node of addedNodes ) {
            this.addedNodes.add(node);
        }
        this.removedNodes = this.removedNodes || removedNodes;
        this.commit();
    },

    // https://jsperf.com/clientheight-and-clientwidth-vs-getcomputedstyle
    //   Avoid getComputedStyle(), detecting whether a node is visible can be
    //   achieved with clientWidth/clientHeight.
    // https://gist.github.com/paulirish/5d52fb081b3570c81e3a
    //   Do not interleave read-from/write-to the DOM. Write-to DOM
    //   operations would cause the first read-from to be expensive, and
    //   interleaving means that potentially all single read-from operation
    //   would be expensive rather than just the 1st one.
    //   Benchmarking toggling off/on cosmetic filtering confirms quite an
    //   improvement when:
    //   - batching as much as possible handling of all nodes;
    //   - avoiding to interleave read-from/write-to operations.
    //   However, toggling off/on cosmetic filtering repeatedly is not
    //   a real use case, but this shows this will help performance
    //   on sites which try to use inline styles to bypass blockers.
    hideNodeBatchProcess: function() {
        this.hideNodeBatchProcessTimer.clear();
        var expando = this.hideNodeExpando;
        for ( var node of this.hiddenNodesetToProcess ) {
            if (
                node[expando] === undefined ||
                node.clientHeight === 0 || node.clientWidth === 0
            ) {
                continue;
            }
            var attr = node.getAttribute('style');
            if ( attr === null ) {
                attr = '';
            } else if (
                attr.length !== 0 &&
                attr.charCodeAt(attr.length - 1) !== 0x3B /* ';' */
            ) {
                attr += '; ';
            }
            node.setAttribute('style', attr + 'display: none !important;');
        }
        this.hiddenNodesetToProcess.clear();
    },

    hideNodeObserverHandler: function(mutations) {
        if ( this.userStylesheet.disabled ) { return; }
        var i = mutations.length,
            stagedNodes = this.hiddenNodesetToProcess;
        while ( i-- ) {
            stagedNodes.add(mutations[i].target);
        }
        this.hideNodeBatchProcessTimer.start();
    },

    hiddenNodeObserverOptions: {
        attributes: true,
        attributeFilter: [ 'style' ]
    },

    hideNodeInit: function() {
        this.hideNodeExpando = vAPI.randomToken();
        this.hideNodeBatchProcessTimer =
            new vAPI.SafeAnimationFrame(this.hideNodeBatchProcess.bind(this));
        this.hiddenNodeObserver =
            new MutationObserver(this.hideNodeObserverHandler.bind(this));
        if ( this.hideNodeStylesheet === false ) {
            this.hideNodeStylesheet = true;
            this.userStylesheet.add(
                '[' + this.hideNodeId + ']\n{ display: none !important; }'
            );
        }
    },

    hideNode: function(node) {
        if ( this.hiddenNodeset.has(node) ) { return; }
        this.hiddenNodeset.add(node);
        if ( this.hideNodeExpando === undefined ) { this.hideNodeInit(); }
        node.setAttribute(this.hideNodeId, '');
        if ( node[this.hideNodeExpando] === undefined ) {
            node[this.hideNodeExpando] =
                node.hasAttribute('style') &&
               (node.getAttribute('style') || '');
        }
        this.hiddenNodesetToProcess.add(node);
        this.hideNodeBatchProcessTimer.start();
        this.hiddenNodeObserver.observe(node, this.hiddenNodeObserverOptions);
    },

    unhideNode: function(node) {
        if ( this.hiddenNodeset.has(node) === false ) { return; }
        node.removeAttribute(this.hideNodeId);
        this.hiddenNodesetToProcess.delete(node);
        if ( this.hideNodeExpando === undefined ) { return; }
        var attr = node[this.hideNodeExpando];
        if ( attr === false ) {
            node.removeAttribute('style');
        } else if ( typeof attr === 'string' ) {
            node.setAttribute('style', attr);
        }
        node[this.hideNodeExpando] = undefined;
        this.hiddenNodeset.delete(node);
    },

    showNode: function(node) {
        var attr = node[this.hideNodeExpando];
        if ( attr === false ) {
            node.removeAttribute('style');
        } else if ( typeof attr === 'string' ) {
            node.setAttribute('style', attr);
        }
    },

    unshowNode: function(node) {
        this.hiddenNodesetToProcess.add(node);
    },

    toggle: function(state) {
        this.userStylesheet.toggle(state);
        var disabled = this.userStylesheet.disabled,
            nodes = document.querySelectorAll('[' + this.hideNodeId + ']');
        for ( var node of nodes ) {
            if ( disabled ) {
                this.showNode(node);
            } else {
                this.unshowNode(node);
            }
        }
        if ( disabled === false && this.hideNodeExpando !== undefined ) {
            this.hideNodeBatchProcessTimer.start();
        }
    },

    getFilteredElementCount: function() {
        let resultset = new Set();
        for ( var selector of this.userStylesheet.getAllSelectors() ) {
            var nodes = document.querySelectorAll(selector);
            var i = nodes.length;
            while ( i-- ) {
                resultset.add(nodes[i]);
            }
        }
        return resultset.size;
    },
};

/******************************************************************************/
/******************************************************************************/

} // <<<<<<<< end of HUGE-IF-BLOCK
