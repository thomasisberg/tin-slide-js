/*!
 * TinSlide v0.1.24
 * (c) 2025 Thomas Isberg
 * Released under the MIT License.
 */
(function (global, factory) {
    'use strict';
	if(typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    }
    else if(typeof define === 'function' && define.amd) {
        define(factory);
    }
    else {
        global.TinSlide = factory();
    }
}(this ? this : window, function () {
    'use strict';

    function TinSlide$(container, options) {

        var tinSlide, logic;

        logic = {

            /*--------------------------------------------------
            | Settings – possible to override using options.
            |-------------------------------------------------*/
            defaultSettings: {
                debug: false,
                // Desired slide effects.
                effects: {
                    slideHorizontal: {
                        on: true,
                        offset: 1, // 0 - x
                        numVisible: 1,
                        centerSelected: false
                    },
                    scale: {
                        on: false,
                        min: 0.8,   // 0 - x
                        max: 1,     // 0 - x
                        minAt: 1.0, // 0 - 1
                        maxAt: 0.0  // 0 - 1
                    },
                    fade: {
                        on: false,
                        min: 0,     // 0 - 1
                        max: 1,     // 0 - 1
                        minAt: 1.0, // 0 - 1
                        maxAt: 0    // 0 - 1
                    },
                    motionBlur: {
                        on: false,
                        maxPixels: 2,
                        stepMin: 0.05,
                        factor: 500
                    }
                },
                // If container height should actively match item height.
                useUpdateContainerHeight: false,
                // Vertically center slides.
                verticallyCenter: false,
                // Optional next / prev navigation on container click.
                useContainerClickNextPrev: false,
                // Swipe navigation.
                swipe: {
                    on: true,
                    // Disable swipe using mouse.
                    touchOnly: false,
                    // Step factor every step when swiping. Applied on step to target.
                    stepFactor: 0.25,
                    // Same as above, but for touch swipe. Generally nicer with a faster response.
                    stepFactorTouch: 0.75,
                    // Optionally wait for move before invoke grabbing.
                    // Useful if the entire container is clickable.
                    // Especially if clicking either half navigates to previous / next.
                    pressMoveBeforeInvokeGrabbing: false,
                    releaseRequiredSwipeX: 0,
                },
                // Optionally generate markup.
                generate: {
                    dots: {
                        on: true,
                        afterContainer: true,
                        markup: {
                            container: null,
                            dot: null
                        }
                    },
                    nav: {
                        on: true,
                        afterContainer: true,
                        markup: {
                            container: null,
                            prev: null,
                            next: null
                        }
                    },
                    styles: {
                        on: true,
                        containerParentPosition: "relative"
                    }
                },
                // Optional ratio.
                ratio: null,
                // If slider has height (separate CSS) we can absolute position all slides.
                hasHeight: false,
                // Auto play.
                autoPlay: {
                    on: false,
                    time: 5000,
                    pauseOnHover: true,
                    stopOnNavigation: true
                },
                // Loop
                loop: true,
                // Non looping next / prev animation when end reached.
                useNonLoopingHint: true,
                // Option to crop container (or not).
                cropContainer: true,
                // Base z-index. Slider will get base z, active slide +1.
                // Overlying navigation can be set to higher in separate CSS.
                // Disable zIndex by setting zIndex to 0.
                zIndex: 0,
                hideItems: true,
                // Hide using visibility:hidden instead of display:none.
                // Useful if images aren't loaded as desired.
                hideUsingVisibility: false,
                // Removes selected item from dom, and appends it to the parent as last child.
                moveSelectedItem: false,
                // Minimal amount of step required to reach target.
                stepSnap: 0.0003,
                // Step factor every step. Applied on step to target.
                stepFactor: 0.2,
                // Max step every step.
                stepMax: 0.20,
                // Minimum step.
                stepMin: 0.0004,
                // 0 - 1
                // 0 = No break (will never turn).
                // 1 = Instant break – turns immediately.
                stepTurnBreakFactor: 0.5,
                // Choke is increased by this value every step.
                chokeReleaseStep: 0.05,
                // Choke is multiplied by this value every step.
                chokeReleaseFactor: 1.5,
                // 0 - X
                // 0 = Slow break towards target. Higher values breaks harder.
                // Brings back choke when target is approached.
                // Distance to target multiplied by this value = choke.
                // This is what makes the slider break in on target.
                chokeReturnFactor: 2
                // // Break points allows for completely different settings
                // // at desired sliders widths (break points). Pass object
                // // with break point as key and settings aso bject as value,
                // // for example {400: {}}
                // breakPoints: null,
            },
            // Settings for current break point.
            settings: {},

            /*--------------------------------------------------
            | Local working variables.
            |-------------------------------------------------*/
            container: null,
            containerWidth: 0,
            items: [],
            numItems: 0,
            numHalfItems: 0,
            pointer: 0,
            pointerVal: 0,
            selectedItem: null,
            numItemsInside: 1,
            itemsVisible: {},
            itemsOutside: {},
            targetVal: 0,
            targetIndex: 0,
            targetIndexWithinBounds: 0,
            timerAnimate: 0,
            // Last step.
            step: 0,
            // Last step – absolute value.
            stepAbs: 0,
            // Chokes acceleration.
            // Is always between 0 and 1.
            // Is increased on every step upon acceleration (up to 1).
            // Applied max step every step is stepMax * choke.
            choke: 0,
            containerHeight: 0,
            timerUpdateContainerHeight: 0,
            swipePressX: 0,
            timerSwipePress: 0,
            swipePressPointerVal: 0,
            swipeTargetVal: 0,
            timerSwipe: 0,
            swipeX: 0,
            swipeXAbs: 0,
            swipePreventDefault: false,
            swipeIsTouch: false,
            swipeScrollsElementCounter: 0,
            // Dots.
            dotsItems: null,
            currentDotIndex: null,
            // Next / prev.
            nav: null,
            ratioPercent: null,
            timerAutoPlay: 0,
            autoPlayState: null,
            autoPlayForwards: true,
            timerNonLoopingHint: 0,
            translateXOffsetProgress: 0,
            // Generated styles element.
            style: null,
            breakPoints: [],
            currentBreakPoint: {},

            /**
             *  Methods.
             */
            init: function(container, options) {

                this.onSwipePressMove = this.onSwipePressMove.bind(this);
                this.clearSwipePressMove = this.clearSwipePressMove.bind(this);

                this.container = container;
                var item, i, n, v, element, src;
                this.body = document.getElementsByTagName('body')[0];

                /*--------------------------------------------------
                | Replace all .tin-slide-image elements.
                |-------------------------------------------------*/
                var tinSlideImages = container.getElementsByClassName('tin-slide-img');
                var tinSlideImagesArr = [];
                for(i=0, n=tinSlideImages.length; i<n; i++) {
                    tinSlideImagesArr.push(tinSlideImages[i]);
                }
                while(tinSlideImagesArr.length) {
                    element = tinSlideImagesArr.shift();
                    var img = document.createElement('img');
                    src = element.getAttribute('data-src');
                    if(src && src !== undefined && src !== '') {
                        img.setAttribute('src', src);
                    }
                    var srcset = element.getAttribute('data-srcset');
                    if(srcset && srcset !== undefined && srcset !== '') {
                        img.setAttribute('srcset', srcset);
                    }
                    var bg = element.getAttribute('data-bg');
                    if(bg && bg !== undefined && bg !== '') {
                        img.setAttribute('style', 'background: url("'+bg+'") no-repeat center; background-size: cover;');
                    }
                    element.parentNode.replaceChild(img, element);
                }

                /*--------------------------------------------------
                | Add background image to all
                | .tin-slide-background elements.
                |-------------------------------------------------*/
                var tinSlideBackgrounds = container.getElementsByClassName('tin-slide-bg');
                var tinSlideBackgroundsArr = [];
                for(i=0, n=tinSlideBackgrounds.length; i<n; i++) {
                    tinSlideBackgroundsArr.push(tinSlideBackgrounds[i]);
                }
                while(tinSlideBackgroundsArr.length) {
                    element = tinSlideBackgroundsArr.shift();
                    src = element.getAttribute('data-bg');
                    if(src && src !== undefined && src !== '') {
                        element.setAttribute('style', 'background: url("'+src+'") no-repeat center; background-size: cover;');
                    }
                }

                /*--------------------------------------------------
                | Replace all .tin-slide-markup elements.
                |-------------------------------------------------*/
                var tinSlideMarkup = container.getElementsByClassName('tin-slide-markup');
                var tinSlideMarkupArr = [];
                for(i=0, n=tinSlideMarkup.length; i<n; i++) {
                    tinSlideMarkupArr.push(tinSlideMarkup[i]);
                }
                while(tinSlideMarkupArr.length) {
                    element = tinSlideMarkupArr.shift();
                    var template = document.createElement('div');
                    template.innerHTML = element.getAttribute('data-markup');
                    element.parentNode.replaceChild(template.firstElementChild, element);
                }

                /*--------------------------------------------------
                | Traverse children and create slider items.
                |-------------------------------------------------*/
                var items = [];
                for(i=0, n=this.container.childNodes.length; i<n; i++) {
                    item = this.container.childNodes[i];
                    if(item.nodeType === Node.ELEMENT_NODE) {
                        items.push(item);
                    }
                }
                this.items = items;
                this.numItems = this.items.length;
                this.numHalfItems = this.numItems / 2;

                for(i=0; i<this.numItems; i++) {
                    item = this.items[i];
                    item.tinSlideIndex = i;
                    // Hide all items
                    item.style.position = 'absolute';
                    this.hideOrShowElement(item, true, options);
                }

                /*--------------------------------------------------
                | Preload images.
                |-------------------------------------------------*/
                var images = this.container.querySelectorAll('img');
                if (images.length) {
                    var head = document.querySelector('head');
                    for (var i=0; i<images.length; i++) {
                        var img = images[i];
                        var src = img.getAttribute('src');
                        if (src) {
                            var link = document.createElement('link');
                            link.rel = 'preload';
                            link.as = 'image';
                            link.href = src;
                            head.appendChild(link);
                        }
                    }
                }

                /*--------------------------------------------------
                | Create functions bound to this scope.
                |-------------------------------------------------*/
                this._onAnimationTimer = this.onAnimationTimer.bind(this);
                this._onSwipePress = this.onSwipePress.bind(this);
                this._onSwipeRelease = this.onSwipeRelease.bind(this);
                this._onSwipeMove = this.onSwipeMove.bind(this);
                this._onTimerSwipe = this.onTimerSwipe.bind(this);
                this._pauseAuto = this.pauseAuto.bind(this);
                this._resumeAuto = this.resumeAuto.bind(this);
                this._imageLoaded = this.imageLoaded.bind(this);
                this._updateContainerHeight = this.updateContainerHeight.bind(this);

                /*--------------------------------------------------
                | Store default settings with standard options.
                |-------------------------------------------------*/
                if(options !== undefined) {
                    this.setOptions(this.defaultSettings, options);

                    /*--------------------------------------------------
                    | Create sorted array with break points.
                    |-------------------------------------------------*/
                    if(options.breakPoints !== undefined) {
                        for(v in options.breakPoints) {
                            var width = parseInt(v, 10);
                            if(!isNaN(width)) {
                                this.breakPoints.push({
                                    width: width,
                                    options: options.breakPoints[v]
                                });
                            }
                        }
                        this.breakPoints.sort(function(a, b) {
                            return a.width-b.width;
                        });
                        // Create merged options objects.
                        var breakPointOptions = {};
                        for(i=0; i<this.breakPoints.length; i++) {
                            this.mergeObjects(breakPointOptions, this.breakPoints[i].options);
                            this.breakPoints[i].options = this.cloneObject(breakPointOptions, {});
                        }
                    }
                }

                container.style.position = 'relative';

                /*--------------------------------------------------
                | Settings for current break point
                | (or none / default).
                |-------------------------------------------------*/
                this.updateBreakPoint();

                // for(i=0; i<this.numItems; i++) {
                //     this.hideOrShowElement(item, true);
                // }

                for(i=0; i<this.numItems; i++) {
                    item = this.items[i];
                    item.removeAttribute('tin-slide-cloak');
                }
                container.removeAttribute('tin-slide-cloak');

                /**
                 * Listen for images loaded.
                 */
                var images = this.container.querySelectorAll('img');
                for(i=0; i<images.length; i++) {
                    images[i].addEventListener('load', this._imageLoaded);
                }

                // Force recalculation of container width on window resize.
                // Calculation will occur when width is needed.
                window.addEventListener('resize', function() {
                    this.containerWidth = 0;
                    this.updateBreakPoint();
                }.bind(this));


                document.addEventListener('touchmove', function(event) {
                    if(this.swipePreventDefault) {
                        event.preventDefault();
                    }
                }.bind(this), {
                    passive: false
                });
            },
            /*--------------------------------------------------
            | Set break point.
            |-------------------------------------------------*/
            updateBreakPoint: function() {
                var breakPoint = this.getBreakPoint();
                if(breakPoint === this.currentBreakPoint) {
                    return;
                }
                this.currentBreakPoint = breakPoint;
                if(breakPoint) {
                    this.container.setAttribute('tin-slide-break-point', breakPoint.width);
                    this.initSettings(breakPoint.options);
                }
                else {
                    this.container.removeAttribute('tin-slide-break-point');
                    this.initSettings();
                }
            },
            /*--------------------------------------------------
            | Get break point options.
            |-------------------------------------------------*/
            getBreakPoint: function() {
                var breakPoint = null;
                var i, n, w = this.getContainerWidth();
                for(i=0, n=this.breakPoints.length; i<n; i++) {
                    if(w >= this.breakPoints[i].width) {
                        breakPoint = this.breakPoints[i];
                    }
                    else {
                        break;
                    }
                }
                return breakPoint;
            },
            /*--------------------------------------------------
            | Initialize settings for break point (or default).
            |-------------------------------------------------*/
            initSettings: function(breakPointOptions) {
                if(breakPointOptions === undefined) {
                    this.settings = this.defaultSettings;
                }
                else {
                    var settings = this.cloneObject(this.defaultSettings, {});
                    this.setOptions(settings, breakPointOptions);
                    this.settings = settings;
                }

                var i, n, item;

                for(i=0; i<this.numItems; i++) {
                    item = this.items[i];

                    // Item styles
                    item.style.top = !this.settings.verticallyCenter ? '0' : '50%';
                    item.style.left = '0';
                    item.style.width = (this.settings.effects.slideHorizontal.on ? (100/this.settings.effects.slideHorizontal.numVisible) : 100)+'%';
                }

                /**
                 *  Container styles.
                 */
                if(this.settings.cropContainer) {
                    this.container.style.overflow = 'hidden';
                }
                else if(this.container.style.overflow === 'hidden') {
                    this.container.style.overflow = '';
                }
                if(this.settings.ratio) {
                    this.settings.ratioPercent = 100 * (1/this.settings.ratio);
                    this.container.style.paddingTop = this.settings.ratioPercent+'%';
                }
                else if(this.container.style.paddingTop !== '') {
                    this.container.style.paddingTop = '';
                }
                if(this.settings.zIndex) {
                    this.container.style.zIndex = this.settings.zIndex;
                }
                else if(this.container.style.zIndex !== '') {
                    this.container.style.zIndex = '';
                }

                /*--------------------------------------------------
                | Set container click navigation.
                |-------------------------------------------------*/
                if(this.settings.useContainerClickNextPrev) {
                    this.container.addEventListener('mouseup', function(event) {
                        var containerWidth = this.getContainerWidth();
                        if(containerWidth) {
                            if((event.layerX - this.container.offsetLeft) < containerWidth / 2) {
                                this.previous();
                            }
                            else {
                                this.next();
                            }
                        }
                    }.bind(this));
                }

                /*--------------------------------------------------
                | Set up swipe navigation.
                |-------------------------------------------------*/
                if(this.items.length > 1) {
                    this.setSwipeStyles();

                    this.container.removeEventListener('touchstart', this._onSwipePress);
                    this.container.removeEventListener('mousedown', this._onSwipePress);
                    if(this.settings.swipe.on) {
                        this.container.addEventListener('touchstart', this._onSwipePress);
                        if(!this.settings.swipe.touchOnly) {
                            this.container.addEventListener('mousedown', this._onSwipePress);
                        }
                    }
                }

                /*--------------------------------------------------
                | If container height should always
                | match selected item.
                |-------------------------------------------------*/
                window.removeEventListener('resize', this._updateContainerHeight);
                if(this.settings.useUpdateContainerHeight) {
                    this.updateContainerHeight();
                    window.addEventListener('resize', this._updateContainerHeight);
                }
                else {
                    this.container.style.height = '';
                }

                /*--------------------------------------------------
                | Store working variables for multiple items.
                |-------------------------------------------------*/
                this.numItemsInside = 1;
                this.translateXOffsetProgress = 0;
                if(this.settings.effects.slideHorizontal.on && this.settings.effects.slideHorizontal.numVisible > 1) {
                    this.numItemsInside = this.settings.effects.slideHorizontal.numVisible;
                    if(this.settings.effects.slideHorizontal.centerSelected) {
                        this.translateXOffsetProgress = 0.5*(this.settings.effects.slideHorizontal.numVisible-1);
                    }
                }

                /*--------------------------------------------------
                | Generate markup.
                |-------------------------------------------------*/
                if(this.items.length > 1) {

                    /*--------------------------------------------------
                    | Generate dots.
                    |-------------------------------------------------*/
                    if(this.settings.generate.dots.on) {
                        if(!this.dots) {
                            this.dots = this.createDots();
                        }
                        this.container.parentNode.insertBefore(
                            this.dots,
                            this.settings.generate.dots.afterContainer ? this.container.nextSibling : this.container
                        );
                    }
                    else {
                        if(this.dots && this.dots.parentNode) {
                            this.dots.parentNode.removeChild(this.dots);
                        }
                    }

                    /*--------------------------------------------------
                    | Generate nav.
                    |-------------------------------------------------*/
                    if(this.settings.generate.nav.on) {
                        if(!this.nav) {
                            this.nav = this.createNav();
                        }
                        this.container.parentNode.insertBefore(
                            this.nav,
                            this.settings.generate.nav.afterContainer ? this.container.nextSibling : this.container
                        );
                    }
                    else {
                        if(this.nav && this.nav.parentNode) {
                            this.nav.parentNode.removeChild(this.nav);
                        }
                    }

                    /*--------------------------------------------------
                    | Generate default styles.
                    |-------------------------------------------------*/
                    if(this.settings.generate.styles.on) {
                        if(this.settings.generate.styles.containerParentPosition) {
                            this.container.parentNode.style.position = this.settings.generate.styles.containerParentPosition;
                        }
                        if(!this.style) {
                            this.style = this.createStyles();
                        }
                        var head = document.getElementsByTagName('head')[0];
                        head.insertBefore(this.style, head.firstChild);
                    }
                    else {
                        if(this.style && this.style.parentNode) {
                            this.style.parentNode.removeChild(this.style);
                        }
                    }
                }

                /*--------------------------------------------------
                | Auto play.
                |-------------------------------------------------*/
                if(this.items.length > 1) {
                    var pauseElements = [this.container];
                    if(this.dots) {
                        pauseElements.push(this.dots);
                    }
                    if(this.nav) {
                        pauseElements.push(this.nav);
                    }
                    for(i=0; i<pauseElements.length; i++) {
                        pauseElements[i].removeEventListener('mouseenter', this._pauseAuto);
                        pauseElements[i].removeEventListener('mouseleave', this._resumeAuto);
                    }
                    this.pauseAuto();
                    if(this.settings.autoPlay.on) {
                        this.startAuto();
                        if(this.settings.autoPlay.pauseOnHover) {
                            for(i=0; i<pauseElements.length; i++) {
                                pauseElements[i].addEventListener('mouseenter', this._pauseAuto);
                                pauseElements[i].addEventListener('mouseleave', this._resumeAuto);
                            }
                        }
                    }
                }

                this.selectedItem = null;

                // Set slider to initial position.
                // this.setPointer(this.targetIndex);
                this.setPointer(this.pointerVal);

                // Update dots.
                this.updateDots();
            },
            setSwipeStyles: function() {
                var i, n, j;
                var styles = {
                    'user-drag': 'none',
                    'user-select': 'none',
                    '-moz-user-select': 'none',
                    '-webkit-user-drag': 'none',
                    '-webkit-user-select': 'none',
                    '-ms-user-select': 'none'
                };
                var imageStyles = {};
                for(var v in styles) {
                    imageStyles[v] = styles[v];
                }
                imageStyles['pointer-events'] = 'none';
                for(i=0; i<this.numItems; i++) {
                    if(this.settings.swipe.on) {
                        this.css(this.items[i], styles);
                    }
                    else {
                        this.removeCss(this.items[i], styles);
                    }
                    var imageNodes = this.items[i].getElementsByTagName('img');
                    n = imageNodes.length;
                    for(j=0; j<n; j++) {
                        if(this.settings.swipe.on) {
                            this.css(imageNodes[j], imageStyles);
                        }
                        else {
                            this.removeCss(imageNodes[j], imageStyles);
                        }
                    }
                }

                if(this.settings.swipe.on && !this.settings.swipe.touchOnly) {
                    this.container.style.cssText += '; cursor: -webkit-grab; cursor: grab;';
                }
                else {
                    this.removeCss(this.container, ['cursor']);
                }
            },
            css: function(element, styles) {
                for(var style in styles) {
                    element.style[style] = styles[style];
                }
            },
            removeCss: function(element, styles) {
                if(Array.isArray(styles)) {
                    for(var i=0; i<styles.length; i++) {
                        element.style[styles[i]] = '';
                    }
                }
                else {
                    for(var style in styles) {
                        element.style[style] = '';
                    }
                }
            },
            addClass: function(element, className) {
                var classes = element.className.split(' ');
                if(classes.indexOf(className) === -1) {
                    classes.push(className);
                }
                element.className = classes.join(' ');
            },
            removeClass: function(element, className) {
                var classes = element.className.split(' ');
                var idx = classes.indexOf(className);
                if(idx !== -1) {
                    classes.splice(idx, 1);
                    element.className = classes.join(' ');
                }
            },
            hasClass: function(element, className) {
                var classes = element.className.split(' ');
                return classes.indexOf(className) > -1;
            },
            hideOrShowElement: function(element, hide, options) {
                if (!options) {
                    options = this.settings;
                }
                if(options.hideUsingVisibility) {
                    element.style.visibility = hide ? 'hidden' : 'visible';
                }
                else {
                    element.style.display = hide ? 'none' : 'block';
                }
            },
            /**
             *  Recursively copies options.
             */
            setOptions: function(scope, options) {
                for(var v in options) {
                    var type = typeof scope[v];
                    // Only store option if it is of correct type.
                    if(type === typeof options[v] || scope[v] === null) {
                        // Don't overwrite objects – just copy the primitive values.
                        if(type === 'object' && scope[v] !== null) {
                            this.setOptions(scope[v], options[v]);
                        }
                        else {
                            scope[v] = options[v];
                        }
                    }
                }
            },
            cloneObject: function(original, clone) {
                var v, i;
                if(!Array.isArray(original)) {
                    for(v in original) {
                        if(typeof original[v] === 'object' && original[v] !== null) {
                            clone[v] = Array.isArray(original[v]) ? [] : {};
                            this.cloneObject(original[v], clone[v]);
                        }
                        else {
                            clone[v] = original[v];
                        }
                    }
                }
                else {
                    for(i=0; i<original.length; i++) {
                        if(typeof original[i] === 'object' && settings[i] !== null) {
                            clone.push(Array.isArray(original[v]) ? [] : {});
                            this.cloneObject(original[i], clone[i]);
                        }
                        else {
                            clone.push(original[i]);
                        }
                    }
                }
                return clone;
            },
            mergeObjects: function(original, add) {
                var v, i;
                for(v in add) {
                    if(typeof add[v] === 'object' && add[v] !== null && !Array.isArray(add[v])) {
                        if(typeof original[v] !== 'object' || original[v] === null || Array.isArray(original[v])) {
                            original[v] = {};
                        }
                        this.mergeObjects(original[v], add[v]);
                    }
                    else {
                        original[v] = add[v];
                    }
                }
                return original;
            },
            createDots: function() {
                /**
                 *  Dots.
                 */
                var that = this;
                var container = null;
                var markup = this.settings.generate.dots.markup;
                if (markup && markup.container) {
                    container = new DOMParser().parseFromString(markup.container, "text/html").querySelector('body').firstChild;
                }
                if (!container) {
                    container = document.createElement("UL");
                    container.setAttribute('class', 'tin-slide-dots');
                }
                var liClickHandler = function(event) {
                    that.onDotClick(event);
                };
                this.dotsItems = [];
                for(var i=0; i<this.numItems; i++) {
                    var dot = markup && markup.dot ? new DOMParser().parseFromString(markup.dot, "text/html").querySelector('body').firstChild : null;
                    if (!dot) {
                        dot = document.createElement('LI');
                        dot.setAttribute('class', 'tin-slide-dot-'+i);
                    }
                    dot.setAttribute('tin-slide-index', i);
                    dot.style.cursor = 'pointer';
                    container.appendChild(dot);
                    this.dotsItems.push(dot);
                    dot.addEventListener('click', liClickHandler);
                }
                return container;
            },
            createNav: function() {
                /**
                 *  Next / prev.
                 */
                var that = this;

                var markup = this.settings.generate.nav.markup;
                var container = markup && markup.container ? new DOMParser().parseFromString(markup.container, "text/html").querySelector('body').firstChild : null;
                if (!container) {
                    container = document.createElement("NAV");
                }
                container.setAttribute('class', 'tin-slide-next-prev');

                var prev = markup && markup.prev ? new DOMParser().parseFromString(markup.prev, "text/html").querySelector('body').firstChild : null;
                if (!prev) {
                    prev = document.createElement("DIV");
                }
                prev.setAttribute('class', 'tin-slide-prev');
                prev.style.cursor = 'pointer';
                // Added to prevent text selection from double click.
                prev.addEventListener('mousedown', function(event) {
                    event.preventDefault();
                });
                prev.addEventListener('click', function(event) {
                    this.previous();
                }.bind(this));
                container.appendChild(prev);

                var next = markup && markup.next ? new DOMParser().parseFromString(markup.next, "text/html").querySelector('body').firstChild : null;
                if (!next) {
                    next = document.createElement("DIV");
                }
                next.setAttribute('class', 'tin-slide-next');
                next.style.cursor = 'pointer';
                // Added to prevent text selection from double click.
                next.addEventListener('mousedown', function(event) {
                    event.preventDefault();
                });
                next.addEventListener('click', function(event) {
                    this.next();
                }.bind(this));
                container.appendChild(next);

                return container;
            },

            createStyles: function() {
                var styles = [];
                styles.push(".tin-slide-prev, .tin-slide-next {position: absolute;left: 10px;top: 50%;}");
                styles.push(".tin-slide-prev:before, .tin-slide-prev:after, .tin-slide-next:before, .tin-slide-next:after {content: '';display: block;width: 0;height: 0;position: absolute;top: 0;-webkit-transform: translateY(-50%);-ms-transform: translateY(-50%);-o-transform: translateY(-50%);transform: translateY(-50%);}");
                styles.push(".tin-slide-prev:before, .tin-slide-next:before {opacity: 0.1;-webkit-transition: opacity 200ms cubic-bezier(0.48, 0.01, 0.21, 1);-o-transition: opacity 200ms cubic-bezier(0.48, 0.01, 0.21, 1);transition: opacity 200ms cubic-bezier(0.48, 0.01, 0.21, 1);}");
                styles.push(".tin-slide-prev:hover:before, .tin-slide-next:hover:before {opacity: 0;}");
                styles.push(".tin-slide-prev:before {left: 0;border-top: 23px solid transparent;border-bottom: 23px solid transparent;border-right: 41px solid black;margin-left: -4px;}");
                styles.push(".tin-slide-prev:after {left: 0;border-top: 20px solid transparent;border-bottom: 20px solid transparent;border-right: 35px solid rgba(255, 255, 255, 0.4);-webkit-transition: border-right-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);-o-transition: border-right-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);transition: border-right-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);}");
                styles.push(".tin-slide-prev:hover:after {border-right-color: white;}");
                styles.push(".tin-slide-next {left: inherit;right: 10px;}");
                styles.push(".tin-slide-next:before {right: 0;border-top: 23px solid transparent;border-bottom: 23px solid transparent;border-left: 41px solid black;margin-right: -4px;}");
                styles.push(".tin-slide-next:after {right: 0;border-top: 20px solid transparent;border-bottom: 20px solid transparent;border-left: 35px solid rgba(255, 255, 255, 0.4);-webkit-transition: border-left-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);-o-transition: border-left-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);transition: border-left-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);}");
                styles.push(".tin-slide-next:hover:after {border-left-color: white;}");
                styles.push(".tin-slide-dots {position: absolute;bottom: 10px;left: 50%;-webkit-transform: translateX(-50%);-ms-transform: translateX(-50%);-o-transform: translateX(-50%);transform: translateX(-50%);}");
                styles.push(".tin-slide-dots li {-webkit-box-sizing: border-box;box-sizing: border-box;display: inline-block;width: 16px;height: 16px;border-radius: 8px;background-color: transparent;border: 2px solid white;margin-right: 5px;opacity: 0.9;-webkit-box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);-webkit-transition: background-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);-o-transition: background-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);transition: background-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);}");
                styles.push(".tin-slide-dots li:hover {background-color: rgba(255, 255, 255, 0.5);}");
                styles.push(".tin-slide-dots li.on {background-color: white; }");
                styles.push(".tin-slide-outside {pointer-events: none;}");

                var style = document.createElement('STYLE');
                style.innerHTML = styles.join("\n");
                return style;
            },

            /**
             *  Update the slider.
             */
            setPointer: function(val) {

                var i, index;

                this.pointerVal = val;
                var pointer = val % this.numItems;
                if(pointer < 0 && this.settings.loop) {
                    pointer += this.numItems;
                }
                this.pointer = pointer;

                var visibleItems = [];

                /*--------------------------------------------------
                | If items should not be hidden,
                | slide all items.
                |-------------------------------------------------*/
                if(!this.settings.hideItems) {
                    for(i=0; i<this.numItems; i++) {
                        visibleItems.push(this.items[i]);
                    }
                }
                else {
                    // Visible items – first add the floor index.
                    var visiblePointer = pointer - this.translateXOffsetProgress;
                    // if(this.settings.effects.slideHorizontal.on && this.settings.effects.slideHorizontal.numVisible > 1 && this.settings.effects.slideHorizontal.centerSelected) {
                    //     visiblePointer -= this.translateXOffsetProgress;
                    // }
                    if(visiblePointer < 0 && this.settings.loop) {
                        visiblePointer += this.numItems;
                    }
                    var floorPointer = Math.floor(visiblePointer);
                    if(floorPointer >= 0) {
                        visibleItems.push(this.items[floorPointer]);
                    }

                    // Add ceil index if pointer is not at destination.
                    for(i=1; i<=this.numItemsInside-(visiblePointer === floorPointer ? 1 : 0); i++) {
                        // var ceilPointer = Math.ceil(this.pointer);
                        var ceilPointer = floorPointer+i;
                        if(this.settings.loop) {
                            ceilPointer %= this.numItems;
                        }
                        if(ceilPointer < this.items.length && visibleItems.indexOf(this.items[ceilPointer]) === -1) {
                            visibleItems.push(this.items[ceilPointer]);
                        }
                    }
                }

                // Mark previously visible items for check.
                for(index in this.itemsVisible) {
                    this.itemsVisible[index] = null;
                }
                var item;
                var len=visibleItems.length;
                var relativeItem = false;
                for(i=0; i<len; i++) {
                    item = visibleItems[i];
                    // If previously non visible item becomes visible.
                    if(this.itemsVisible[item.tinSlideIndex] === undefined) {
                        this.hideOrShowElement(item, false);
                    }
                    // Store progress.
                    var progress = this.pointer - item.tinSlideIndex;
                    if(!this.translateXOffsetProgress) {
                        if(progress > 1) {
                            progress -= this.numItems;
                        }
                    }
                    else {
                        if(progress > this.numHalfItems) {
                            progress -= this.numItems;
                        }
                        else if(progress < -this.numHalfItems) {
                            progress += this.numItems;
                        }
                    }
                    this.itemsVisible[item.tinSlideIndex] = progress;

                    // Make the most visible item relatively positioned,
                    // and put it in front of the others.
                    if(!(progress > 0.5 || progress < -0.5) && !relativeItem) {
                        relativeItem = true;

                        // If new item becomes selected.
                        if(this.selectedItem !== item) {
                            // Remove selected class from previously selected.
                            if(this.selectedItem) {
                                this.removeClass(this.selectedItem, 'tin-slide-selected');
                            }
                            this.selectedItem = item;
                            this.addClass(item, 'tin-slide-selected');

                            // All slides absolute positioned if slider has a defined height
                            // (in separate CSS) or ratio.
                            if(!(this.settings.useUpdateContainerHeight || this.settings.ratio || this.settings.hasHeight)) {
                                item.style.position = 'relative';
                            }
                            if(this.settings.zIndex) {
                                item.style.zIndex = this.settings.zIndex;
                            }
                            if(this.settings.moveSelectedItem) {
                                this.container.removeChild(item);
                                this.container.appendChild(item);
                            }

                            /*--------------------------------------------------
                            | Emit event with selected item.
                            |-------------------------------------------------*/
                            tinSlide.emit('itemSelected', {
                                index: item.tinSlideIndex,
                                item: item
                            });
                        }
                    }
                    else {
                        item.style.position = 'absolute';
                        item.style.zIndex = '';
                    }
                }
                // Hide previously visible items no longer visible.
                for(index in this.itemsVisible) {
                    if(this.itemsVisible[index] === null) {
                        delete this.itemsVisible[index];
                        item = this.items[index];
                        this.hideOrShowElement(item, true);
                        item.style.position = 'absolute';
                        item.style.zIndex = '';
                    }
                }
                this.applySlideEffect();
            },

            /**
             *  Next/ previous.
             */
            next: function(isAuto) {
                var status = false;
                if(this.items.length > 1) {
                    // Stop auto play if not an auto play navigation.
                    if(isAuto !== true) {
                        if(this.settings.autoPlay.stopOnNavigation) {
                            this.stopAuto();
                        }
                    }
                    if(!this.timerSwipe || this.swipeXAbs < this.settings.swipe.releaseRequiredSwipeX) {
                        // Navigate if slider is looping, or if there are previous slides.
                        if(this.settings.loop || this.targetIndex < this.numItems - 1) {
                            this.targetIndex++;
                            this.targetVal = this.targetIndex;
                            this.animateToTarget();
                            status = true;
                        }
                        else if(!isAuto && this.settings.useNonLoopingHint) {
                            this.targetVal = this.numItems - 1 + 0.05;
                            this.animateToTarget();
                            var that = this;
                            this.timerNonLoopingHint = setTimeout(function() {
                                that.targetVal = that.targetIndex;
                                that.animateToTarget();
                            }, 200);
                        }
                    }
                }
                return status;
            },
            previous: function(isAuto) {
                var status = false;
                if(this.items.length > 1) {
                    // Stop auto play if not an auto play navigation.
                    if(isAuto !== true) {
                        if(this.settings.autoPlay.stopOnNavigation) {
                            this.stopAuto();
                        }
                    }
                    if(!this.timerSwipe || this.swipeXAbs < this.settings.swipe.releaseRequiredSwipeX) {
                        // Navigate if slider is looping, or if there are previous slides.
                        if(this.settings.loop || this.targetIndex > 0) {
                            this.targetIndex--;
                            this.targetVal = this.targetIndex;
                            this.animateToTarget();
                            status = true;
                        }
                        else if(!isAuto && this.settings.useNonLoopingHint) {
                            this.targetVal = -0.05;
                            this.animateToTarget();
                            var that = this;
                            this.timerNonLoopingHint = setTimeout(function() {
                                that.targetVal = that.targetIndex;
                                that.animateToTarget();
                            }, 200);
                        }
                    }
                }
                return status;
            },
            /**
             *  Swipe.
             */
            // Performs the actual grabbing – stops slider etc.
            onSwipePress: function(event) {

                if(this.items.length > 1) {
                    var isTouch = event.type === 'touchstart';

                    // If link was pressed – do nothing.
                    if(event.target.nodeName === 'A') {
                        return;
                    }

                    /**
                     *  Don't respond to right click.
                     */
                    var nativeEvent = event;
                    if((nativeEvent.button !== undefined && nativeEvent.button === 2) || (nativeEvent.which !== undefined && nativeEvent.which === 3)) {
                        return;
                    }

                    // this.swipePressX = isTouch ? event.layerX : event.clientX;
                    this.swipePressX = isTouch ? event.touches[0].clientX : event.clientX;

                    this.swipeX = 0;
                    this.swipeXAbs = 0;

                    if(this.settings.swipe.pressMoveBeforeInvokeGrabbing) {
                        document.addEventListener('touchmove', this.onSwipePressMove);
                        document.addEventListener('mousemove', this.onSwipePressMove);
                        document.addEventListener('touchend', this.clearSwipePressMove);
                        document.addEventListener('mouseup', this.clearSwipePressMove);
                    }
                    else {
                        this.onTimerSwipePress();
                    }

                    // Stop event – useful if slider is a child slider.
                    if(this.loop || (this.targetIndexWithinBounds>0 && this.targetIndexWithinBounds<this.numItems-1)) {
                        event.stopPropagation();
                    }
                }
            },

            onSwipePressMove: function() {
                this.clearSwipePressMove();
                this.onTimerSwipePress();
            },

            clearSwipePressMove: function() {
                document.removeEventListener('touchmove', this.onSwipePressMove);
                document.removeEventListener('mousemove', this.onSwipePressMove);
                document.removeEventListener('touchend', this.clearSwipePressMove);
                document.removeEventListener('mouseup', this.clearSwipePressMove);
            },

            // Performs the actual grabbing – stops slider etc.
            onTimerSwipePress: function() {

                if(!this.settings.swipe.touchOnly) {
                    this.container.style.cssText += '; cursor: -webkit-grabbing; cursor: grabbing;';
                }

                // Clear timer used for non looping hint.
                clearTimeout(this.timerNonLoopingHint);

                // Stop auto play.
                if(this.settings.autoPlay.stopOnNavigation) {
                    this.pauseAuto();
                }

                if(this.timerAnimate) {
                    // clearInterval(this.timerAnimate);
                    cancelAnimationFrame(this.timerAnimate);
                    this.timerAnimate = 0;
                }

                // Calculate how far the slide will travel upon press.
                var step = 0;
                var stepAdd = this.step;
                for(var i=0; i<25; i++) {
                    stepAdd *= this.settings.swipe.stepFactor;
                    step += stepAdd;
                }

                this.swipePressPointerVal = this.pointerVal + step;
                this.swipeTargetVal = this.swipePressPointerVal;

                document.addEventListener('touchmove', this._onSwipeMove);
                document.addEventListener('touchend', this._onSwipeRelease);
                if(!this.settings.swipe.touchOnly) {
                    document.addEventListener('mousemove', this._onSwipeMove);
                    document.addEventListener('mouseup', this._onSwipeRelease);
                }

                this.startSwipeTimer();
            },
            onSwipeMove: function(event) {

                // Check if child slider is swiping.
                // If so, lock this parent slider until child slider no longer swipes (first / last slide reached).
                // Child sliders should probably have loop=false. Otherwise this parent slider will
                // never slide again once child slider has been grabbed.
                if(event.tinSlideMoved === undefined) {

                    var isTouch = event.type === 'touchmove';
                    this.swipeIsTouch = isTouch;

                    var containerWidth = this.getContainerWidth();
                    if(containerWidth) {

                        /**
                         * Check if touch scrolls an element in the slider.
                         */
                        if(isTouch && event.target !== undefined && event.target !== this.container) {
                            var t = event.target;
                            if(t.scrollWidth > t.offsetWidth) {
                                this.swipeScrollsElementCounter++;
                                if(this.swipeScrollsElementCounter < 4 || (t.scrollLeft > 0 && (t.scrollLeft + t.offsetWidth) < t.scrollWidth)) {
                                    event.tinSlideMoved = this;
                                    return;
                                }
                            }
                        }

                        // var currentX = isTouch ? event.layerX : event.clientX;
                        var currentX = isTouch ? event.touches[0].clientX: event.clientX;
                        if(currentX === undefined) {
                            return;
                        }

                        if(this.swipePressX === undefined) {
                            this.swipePressX = currentX;
                        }

                        this.swipeX = this.swipePressX - currentX;

                        this.swipeXAbs = this.swipeX < 0 ? -this.swipeX : this.swipeX;

                        if(!this.swipePreventDefault) {
                            if(this.swipeXAbs > 10) {
                                this.swipePreventDefault = true;
                            }
                        }

                        var swipeTargetVal = this.swipePressPointerVal + (this.swipeX / containerWidth);
                        if(!this.settings.loop) {
                            var offset = this.settings.useNonLoopingHint ? 0.05 : 0;
                            if(swipeTargetVal < -offset) {
                                swipeTargetVal = -offset;
                            }
                            else if(swipeTargetVal > this.numItems - 1 + offset) {
                                swipeTargetVal = this.numItems - 1 + offset;
                            }
                            else {
                                event.tinSlideMoved = this;
                            }
                        }
                        else {
                            event.tinSlideMoved = this;
                        }

                        this.swipeTargetVal = swipeTargetVal;
                        var targetIndexWithinBounds = Math.round(this.swipeTargetVal) % this.numItems;
                        if(targetIndexWithinBounds < 0) {
                            targetIndexWithinBounds += this.numItems;
                        }
                        this.targetIndexWithinBounds = targetIndexWithinBounds;
                        this.updateDots();
                    }
                }
            },
            onSwipeRelease: function(event) {

                document.removeEventListener('touchmove', this._onSwipeMove);
                document.removeEventListener('touchend', this._onSwipeRelease);
                if(!this.settings.swipe.touchOnly) {
                    document.removeEventListener('mousemove', this._onSwipeMove);
                    document.removeEventListener('mouseup', this._onSwipeRelease);
                    this.container.style.cssText += '; cursor: -webkit-grab; cursor: grab;';
                }

                this.swipePreventDefault = false;
                this.swipeScrollsElementCounter = 0;

                if(this.swipeXAbs >= this.settings.swipe.releaseRequiredSwipeX) {

                    var limit = 0.04;
                    var targetIndex;
                    if(this.step < -limit) {
                        // Stop auto play.
                        if(this.settings.autoPlay.stopOnNavigation) {
                            this.stopAuto();
                        }
                        targetIndex = Math.floor(this.pointerVal);
                    }
                    else if(this.step > limit) {
                        // Stop auto play.
                        if(this.settings.autoPlay.stopOnNavigation) {
                            this.stopAuto();
                        }
                        targetIndex = Math.ceil(this.pointerVal);
                    }
                    else {
                        // Calculate how far the slide will travel upon release.
                        var step = this.step * 15;
                        var stepAdd = this.step;
                        for(var i=0; i<80; i++) {
                            stepAdd *= this.settings.swipe.stepFactor;
                            step += stepAdd;
                        }
                        if(step > 1) {
                            step = 1;
                        }
                        else if(step < -1) {
                            step = -1;
                        }
                        var targetVal = this.pointerVal + step;
                        targetIndex = Math.round(targetVal);

                        if(this.settings.autoPlay.stopOnNavigation) {
                            if(targetIndex === this.targetIndex) {
                                if(event.type === 'touchend') {
                                    this.resumeAuto();
                                }
                            }
                            else {
                                this.stopAuto();
                            }
                        }
                    }

                    this.choke = 1;

                    // Wait a few milliseconds, otherwise prev / next will be invoked.
                    setTimeout(function() {
                        if(this.timerSwipe) {
                            cancelAnimationFrame(this.timerSwipe);
                            this.timerSwipe = 0;
                        }
                        this.targetIndex = targetIndex;
                        this.targetVal = this.targetIndex;
                        this.animateToTarget();
                    }.bind(this), 1);
                }
                else {
                    cancelAnimationFrame(this.timerSwipe);
                    this.timerSwipe = 0;

                    if(event.type === 'touchend') {
                        this.resumeAuto();
                    }
                }

            },
            startSwipeTimer: function() {
                if(!this.timerSwipe) {
                    this.timerSwipe = requestAnimationFrame(this._onTimerSwipe);
                }
            },
            onTimerSwipe: function() {
                var pointerVal = this.pointerVal;
                var diff = this.swipeTargetVal - pointerVal;
                var step = diff * (!this.swipeIsTouch ? this.settings.swipe.stepFactor : this.settings.swipe.stepFactorTouch);
                this.step = step;
                this.stepAbs = this.step < 0 ? -this.step : this.step;
                pointerVal += step;
                this.setPointer(pointerVal);
                this.timerSwipe = requestAnimationFrame(this._onTimerSwipe);
            },
            getContainerWidth: function() {
                if(!this.containerWidth) {
                    this.containerWidth = container.offsetWidth;
                }
                return this.containerWidth;
            },

            /**
             *  Animate to index.
             */
            animateTo: function(index) {
                this.targetIndex = index % this.numItems;
                if(this.targetIndex < 0) {
                    this.targetIndex += this.numItems;
                }
                this.targetIndexWithinBounds = this.targetIndex;
                this.updateDots();
                var pointerVal = this.pointerVal % this.numItems;
                // Adjust pointerVal so slider chooses optimal direction.
                if(this.settings.loop) {
                    var diff = pointerVal - this.targetIndex;
                    if(diff > this.numHalfItems) {
                        pointerVal -= this.numItems;
                    }
                    else if(diff < -this.numHalfItems) {
                        pointerVal += this.numItems;
                    }
                }
                this.pointerVal = pointerVal;
                this.targetVal = this.targetIndex;
                this.animateToTarget();
            },
            animateToTarget: function() {
                // Clear timer used for non looping hint.
                clearTimeout(this.timerNonLoopingHint);
                // Update dots.
                var targetIndexWithinBounds = this.targetIndex % this.numItems;
                if(targetIndexWithinBounds < 0) {
                    targetIndexWithinBounds += this.numItems;
                }
                this.targetIndexWithinBounds = targetIndexWithinBounds;
                this.updateDots();
                if(this.settings.useUpdateContainerHeight) {
                    this.updateContainerHeight();
                }
                if(!this.timerAnimate) {
                    // var that = this;
                    // this.timerAnimate = setInterval(function() {
                    //     that.onAnimationTimer();
                    // }, 25);

                    this.timerAnimate = requestAnimationFrame(this._onAnimationTimer);
                }
            },
            onAnimationTimer: function() {
                var pointerVal = this.pointerVal;
                var diff = this.targetVal - pointerVal;
                var diffAbs = diff < 0 ? -diff : diff;

                if(diffAbs < this.settings.stepSnap) {
                    this.step = this.stepAbs = 0;
                    this.setPointer(this.targetVal);
                    cancelAnimationFrame(this.timerAnimate);
                    this.timerAnimate = 0;
                }
                else {
                    var step = (diff) * this.settings.stepFactor;
                    // If slider continues in the same direction.
                    if(step * this.step >= 0) {
                        this.step = (diff) * this.settings.stepFactor;
                        // Release the choke for acceleration.
                        if(this.choke < 1) {
                            this.choke = (this.choke * this.settings.chokeReleaseFactor) + (this.choke || this.settings.chokeReleaseStep ? this.settings.chokeReleaseStep : 0.05);
                        }
                        // Decrease choke when target is approached.
                        if(this.choke > diffAbs) {
                            this.choke = diffAbs * (0.5 + this.settings.chokeReturnFactor);
                        }
                        if(this.choke > 1) {
                            this.choke = 1;
                        }
                        if(this.step > this.settings.stepMin || this.step < -this.settings.stepMin) {
                            var stepMax = this.choke * this.settings.stepMax;
                            if(this.step > stepMax) {this.step = stepMax;}
                            else if(this.step < -stepMax) {this.step = -stepMax;}
                            if(!(this.step > this.settings.stepMin || this.step < -this.settings.stepMin)) {
                                this.step = this.settings.stepMin * (this.step < 0 ? -1 : 1);
                            }
                        }
                        this.stepAbs = this.step < 0 ? -this.step : this.step;
                        pointerVal += this.step;
                    }
                    // If slider changes direction – break and turn.
                    else {
                        step = this.step * (1-this.settings.stepTurnBreakFactor);
                        // If turning break has completed.
                        if(!(step > this.settings.stepSnap || step < -this.settings.stepSnap)) {
                            this.step = 0;
                        } else {
                            this.step = step;
                        }
                        pointerVal += step;
                    }
                    this.stepAbs = this.step < 0 ? -this.step : this.step;
                    this.setPointer(pointerVal);
                    this.timerAnimate = requestAnimationFrame(this._onAnimationTimer);
                }
            },
            goTo: function(index) {
                // Clear timer used for non looping hint.
                clearTimeout(this.timerNonLoopingHint);
                // Stop auto play.
                if(this.settings.autoPlay.stopOnNavigation) {
                    this.stopAuto();
                }
                // Stop animation.
                if(this.timerAnimate) {
                    // clearInterval(this.timerAnimate);
                    cancelAnimationFrame(this.timerAnimate);
                    this.timerAnimate = 0;
                }
                // Calculate correct target index.
                this.targetIndex = index % this.numItems;
                if(this.targetIndex < 0) {
                    this.targetIndex += this.numItems;
                }
                this.targetIndexWithinBounds = this.targetIndex;
                this.updateDots();
                if(this.settings.useUpdateContainerHeight) {
                    this.updateContainerHeight();
                }
                this.setPointer(this.targetIndexWithinBounds);
            },

            updateContainerHeight: function(fromSubSlideWithHeight) {

                var parentSlides;

                // If this action was initiated by the slider itself.
                if(fromSubSlideWithHeight === undefined) {
                    // Don't do anything if the slider has parent sliders.
                    // Let the top most slider handle the action.
                    parentSlides = this.getParentSlides();
                    if(parentSlides.length) {
                        parentSlides[0].updateContainerHeight();
                    }
                    // If this is the top most slider.
                    else {
                        // Check if slider has sub slides.
                        // Update height on the inner most slider.
                        // Inner most slider will then traverse upwards and update
                        // parent slides all the way up to this one.
                        var subSlides = this.getSubSlides();
                        if(subSlides.length) {
                            subSlides[0].updateContainerHeightFromParent();
                        }
                        else {
                            this.doUpdateContainerHeight();
                        }
                    }
                }

                // If slider was instructed by a sub slider to update height.
                // Also enters here if this is the inner most slider (with fromSubSlideWithHeight = 0).
                else {
                    this.doUpdateContainerHeight(fromSubSlideWithHeight);
                    // Update parent slider.
                    parentSlides = this.getParentSlides().reverse();
                    if(parentSlides.length) {
                        parentSlides[0].updateContainerHeight(this.containerHeight);
                    }
                }

            },

            doUpdateContainerHeight: function(minHeight) {
                var id = this.container.getAttribute('id');
                if(minHeight === undefined) {
                    minHeight = 0;
                }
                var containerHeight = this.items[this.targetIndexWithinBounds].offsetHeight;
                if(!containerHeight) {
                    this.items[this.targetIndexWithinBounds].style.display = 'block';
                    containerHeight = this.items[this.targetIndexWithinBounds].offsetHeight;
                }
                if(containerHeight < minHeight) {
                    containerHeight = minHeight;
                }
                if(containerHeight > 0 && this.containerHeight !== containerHeight) {
                    this.containerHeight = containerHeight;
                    this.css(this.container, {
                        height: containerHeight+'px'
                    });
                }
            },

            // Update this inner most slider.
            updateContainerHeightFromParent: function() {
                this.updateContainerHeight(0);
            },

            getParentSlides: function() {
                var slides = [];
                function checkParentNode(element) {
                    if(element.parentNode && element.parentNode !== undefined) {
                        if(element.parentNode.tinSlide !== undefined) {
                            slides.push(element.parentNode.tinSlide);
                        }
                        checkParentNode(element.parentNode);
                    }
                }
                checkParentNode(this.container);
                return slides.reverse();
            },

            getSubSlides: function() {
                var slides = [];
                function checkChildNodes(element) {
                    for(var i=0, n=element.childNodes.length; i<n; i++) {
                        if(element.childNodes[i].tinSlide !== undefined) {
                            slides.push(element.childNodes[i].tinSlide);
                            checkChildNodes(element.childNodes[i].tinSlide.getCurrentItem());
                        }
                        else {
                            checkChildNodes(element.childNodes[i]);
                        }
                    }
                }
                // checkChildNodes(this.container);
                checkChildNodes(this.items[this.targetIndexWithinBounds]);
                return slides.reverse();
            },

            /**
             *  Apply desired slide effect:
             *   - Horizontal slide
             *   - Fade
             *   - Scale
             *   - Motion blur
             */
            applySlideEffect: function() {
                for(var index in this.itemsVisible) {

                    var item = this.items[index];
                    var progress = this.itemsVisible[index];
                    var progressAbs = progress < 0 ? -progress : progress;
                    var transforms = [];

                    // Horizontal slide.
                    if(this.settings.effects.slideHorizontal.on) {
                        var translateXProgress = progress - this.translateXOffsetProgress;
                        var translateX = ((this.settings.effects.slideHorizontal.offset*100)*-translateXProgress)+'%';
                        var translateY = !this.settings.verticallyCenter ? 0 : '-50%';
                        transforms.push('translate3d('+translateX+', '+translateY+', 0)');

                        /*--------------------------------------------------
                        | Add class to visible items outside of slider.
                        | Mostly usable when hideItems = false.
                        |-------------------------------------------------*/
                        if(translateXProgress > 0.75 || translateXProgress < -(this.settings.effects.slideHorizontal.numVisible-0.25)) {
                            if(this.itemsOutside[index] === undefined) {
                                this.itemsOutside[index] = item;
                                this.addClass(item, 'tin-slide-outside');
                            }
                        }
                        else {
                            if(this.itemsOutside[index] !== undefined) {
                                delete this.itemsOutside[index];
                                this.removeClass(item, 'tin-slide-outside');
                            }
                        }
                    }

                    // Scale
                    if(this.settings.effects.scale.on) {
                        var scale;
                        if(progressAbs < this.settings.effects.scale.maxAt) {
                            scale = this.settings.effects.scale.max;
                        }
                        else if(progressAbs < this.settings.effects.scale.minAt) {
                            var scaleFactor = 1 - ((progressAbs - this.settings.effects.scale.maxAt) / (this.settings.effects.scale.minAt - this.settings.effects.scale.maxAt));
                            scale = this.settings.effects.scale.min + scaleFactor * (this.settings.effects.scale.max - this.settings.effects.scale.min);
                        }
                        else {
                            scale = this.settings.effects.scale.min;
                        }
                        transforms.push('scale('+scale+', '+scale+')');
                    }

                    // Apply accumulated transforms.
                    if(transforms.length) {
                        item.style.transform = transforms.join(' ');
                    }
                    else if(item.style.transform !== '') {
                        item.style.transform = '';
                    }

                    // Fade
                    if(this.settings.effects.fade.on) {
                        var opacity;
                        if(progressAbs < this.settings.effects.fade.maxAt) {
                            opacity = this.settings.effects.fade.max;
                        }
                        else if(progressAbs < this.settings.effects.fade.minAt) {
                            var opacityFactor = 1 - ((progressAbs - this.settings.effects.fade.maxAt) / (this.settings.effects.fade.minAt - this.settings.effects.fade.maxAt));
                            opacity = this.settings.effects.fade.min + opacityFactor * (this.settings.effects.fade.max - this.settings.effects.fade.min);
                        }
                        else {
                            opacity = this.settings.effects.fade.min;
                        }
                        item.style.opacity = opacity;
                    }
                    else if(item.style.opacity !== '') {
                        item.style.opacity = '';
                    }
                }

                // Motion blur.
                if(this.settings.effects.motionBlur.on) {
                    this.applyBlur();
                }
            },
            /**
             *  Speed based blur.
             */
            applyBlur: function() {
                var blurFactor = this.stepAbs - this.settings.effects.motionBlur.stepMin;
                if(blurFactor < 0) {blurFactor = 0;}
                var blur = blurFactor * this.settings.effects.motionBlur.factor;
                if(blur > this.settings.effects.motionBlur.maxPixels) {blur = this.settings.effects.motionBlur.maxPixels;}
                var cssBlur = blur ? 'blur('+blur+'px)' : '';
                for(var index in this.itemsVisible) {
                    this.items[index].style.filter = cssBlur;
                }
            },
            updateDots: function() {
                if(this.dots && this.currentDotIndex !== this.targetIndexWithinBounds) {
                    var dot;
                    if(this.currentDotIndex !== null) {
                        dot = this.dotsItems[this.currentDotIndex];
                        if(dot) {
                            this.removeClass(dot, 'on');
                        }
                    }
                    this.currentDotIndex = this.targetIndexWithinBounds;
                    dot = this.dotsItems[this.currentDotIndex];
                    if(dot) {
                        this.addClass(dot, 'on');
                    }
                }
            },
            onDotClick: function(event) {
                // Stop auto play.
                if(this.settings.autoPlay.stopOnNavigation) {
                    this.stopAuto();
                }
                var index = parseInt(event.target.getAttribute('tin-slide-index'), 10);
                this.animateTo(index);
            },
            startAuto: function() {
                if(this.autoPlayState === 'stopped') {
                    return;
                }
                if(this.autoPlayState !== 'started') {
                    this.autoPlayState = 'started';
                    this.resumeAuto();
                }
            },
            pauseAuto: function() {
                if(this.autoPlayState === 'stopped') {
                    return;
                }
                // Don't do anything if auto play isn't activated.
                if(this.autoPlayState) {
                    this.autoPlayState = 'paused';
                    clearInterval(this.timerAutoPlay);
                    this.timerAutoPlay = 0;
                }
            },
            resumeAuto: function() {
                if(this.autoPlayState === 'stopped') {
                    return;
                }
                // Don't do anything if auto play isn't activated.
                if(this.autoPlayState) {
                    this.autoPlayState = 'started';
                    clearInterval(this.timerAutoPlay);
                    this.timerAutoPlay = setInterval(function() {
                        // Only auto slide if swiping is not active.
                        // Only auto slide if slider is visible.
                        // Also don't slide if window isn't visible.
                        if(!this.timerSwipe && this.container.clientHeight && !this.hasClass(this.container, 'window-hidden')) {
                            var status = this.autoPlayForwards ? this.next(true) : this.previous(true);
                            // Change direction if navigation failed.
                            if(!status) {
                                this.autoPlayForwards = !this.autoPlayForwards;
                                status = this.autoPlayForwards ? this.next(true) : this.previous(true);
                            }
                        }
                    }.bind(this), this.settings.autoPlay.time);
                }
            },
            stopAuto: function() {
                if(this.autoPlayState === 'stopped') {
                    return;
                }
                if(this.autoPlayState) {
                    this.pauseAuto();
                    this.autoPlayState = 'stopped';
                }
            },
            imageLoaded: function(event) {
                if(this.settings.useUpdateContainerHeight) {
                    this.updateContainerHeight();
                }
            }
        };

        /**
         *  Public methods.
         */
        var events = {};

        tinSlide = {
            next: function(index) {
                logic.next();
            },
            previous: function(index) {
                logic.previous();
            },
            animateTo: function(index) {
                logic.animateTo(index);
            },
            goTo: function(index) {
                logic.goTo(index);
            },
            getDots: function() {
                return logic.dots ? logic.dots : logic.createDots();
            },
            getNav: function() {
                return logic.nav ? logic.nav : logic.createNav();
            },
            startAuto: function() {
                logic.startAuto();
            },
            stopAuto: function() {
                logic.stopAuto();
            },
            updateContainerHeight: function(fromSubSlideWithHeight) {
                logic.updateContainerHeight(fromSubSlideWithHeight);
            },
            updateContainerHeightFromParent: function() {
                logic.updateContainerHeightFromParent();
            },
            getCurrentItem: function() {
                return logic.items[logic.targetIndexWithinBounds];
            },
            on: function(eventType, listener) {
                if (typeof events[eventType] !== 'object') {
                    events[eventType] = [];
                }
                events[eventType].push(listener);
            },
            removeListener: function(eventType, listener) {
                var idx;
                if (typeof events[eventType] === 'object') {
                    idx = events[eventType].indexOf(listener);
                    if (idx > -1) {
                        events[eventType].splice(idx, 1);
                    }
                }
            },
            emit: function(eventType, event) {
                var i, listeners, len, args = [].slice.call(arguments, 1);
                if (typeof events[eventType] === 'object') {
                    listeners = events[eventType].slice();
                    len = listeners.length;
                    for(i = 0; i < len; i++) {
                        listeners[i].apply(this, args);
                    }
                }
            }
        };

        // Initialize.
        logic.init(container, options);

        /*--------------------------------------------------
        | Prevent IE image dragging.
        |-------------------------------------------------*/
        document.ondragstart = function () { return false; };

        /**
         *  Experimentally check if window is hidden.
         *  Used to pause autoplay when window is hidden.
         */
        var documentHiddenName = null;
        function onVisibilityChange(event) {
            var v = "visible", h = "hidden";
            var eventMap = {
                focus: v,
                focusin: v,
                pageshow: v,
                blur: h,
                focusout: h,
                pagehide: h
            };
            event = event || window.event;
            var isHidden = false;
            if(event.type in eventMap) {
                isHidden = eventMap[event.type] === 'hidden';
            }
            else {
                isHidden = document[documentHiddenName] ? true : false;
            }
            if(isHidden) {
                logic.addClass(logic.container, 'window-hidden');
            }
            else {
                logic.removeClass(logic.container, 'window-hidden');
            }
        }
        if("hidden" in document) {
            documentHiddenName = "hidden";
            document.addEventListener("visibilitychange", onVisibilityChange);
        }
        else if("mozHidden" in document) {
            documentHiddenName = "mozHidden";
            document.addEventListener("mozvisibilitychange", onVisibilityChange);
        }
        else if("webkitHidden" in document) {
            documentHiddenName = "webkitHidden";
            document.addEventListener("webkitvisibilitychange", onVisibilityChange);
        }
        else if ("msHidden" in document) {
            documentHiddenName = "msHidden";
            document.addEventListener("msvisibilitychange", onVisibilityChange);
        }
        // IE 9 and lower:
        else if ("onfocusin" in document) {
            document.onfocusin = document.onfocusout = onVisibilityChange;
        }
        // All others:
        else {
            window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onVisibilityChange;
        }
        // set the initial state (but only if browser supports the Page Visibility API)
        if(documentHiddenName && document[documentHiddenName] !== undefined) {
            onVisibilityChange({type: document[documentHiddenName] ? "blur" : "focus"});
        }

        container.tinSlide = tinSlide;

        return tinSlide;
    }

    /*--------------------------------------------------
    | Element.firstElementChild polyfill.
    |-------------------------------------------------*/
    ;(function(constructor) {
        if (constructor &&
            constructor.prototype &&
            constructor.prototype.firstElementChild == null) {
            Object.defineProperty(constructor.prototype, 'firstElementChild', {
                get: function() {
                    var nodes = this.childNodes, i = 0;
                    var node = nodes[i++];
                    while (node) {
                        if (node.nodeType === 1) {
                            return node;
                        }
                        node = nodes[i++];
                    }
                    return null;
                }
            });
        }
    })(window.Node || window.Element);

    /*--------------------------------------------------
    | Window.requestAnimationFrame polyfill.
    |-------------------------------------------------*/
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame    ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    return TinSlide$;

}));
