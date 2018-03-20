/*!
 * TinSlide v0.1.5
 * (c) 2018 Thomas Isberg
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
}(this, function () {
    'use strict';

    function TinSlide$(container, options) {
        
        var logic = {

            /*--------------------------------------------------
            | Settings – possible to override using options.
            |-------------------------------------------------*/
            settings: {
                debug: false,
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
                chokeReturnFactor: 2,
                // Option to crop container (or not).
                cropContainer: true,
                // Desired slide effects.
                effects: {
                    slideHorizontal: {
                        on: true,
                        offset: 1, // 0 - x
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
                // Optional swipe navigation.
                useSwipeNavigation: true,
                swipeTouchOnly: false,
                swipeStepFactor: 0.25,
                swipeStepFactorTouch: 0.75,
                // Optionally wait before invoke grabbing.
                // Useful if the entire container is clickable.
                // Especially if clicking either half navigates to previous / next.
                swipePressWaitBeforeInvokeGrabbing: false,
                swipeReleaseRequiredSwipeX: 0,
                // Optionally generate markup.
                generate: {
                    dots: {
                        on: true,
                        afterContainer: true
                    },
                    nav: {
                        on: true,
                        afterContainer: true
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
                autoPlay: false,
                autoPlayTime: 5000,
                autoPlayPauseOnHover: true,
                autoPlayStopOnNavigation: true,
                // Loop
                loop: true,
                // Non looping next / prev animation when end reached.
                useNonLoopingHint: true,
                // Base z-index. Slider will get base z, active slide +1.
                // Overlying navigation can be set to higher in separate CSS.
                // Disable zIndex by setting zIndex to 0.
                zIndex: 0,
                // Hide using visibility:hidden instead of display:none.
                // Useful if images aren't loaded as desired.
                hideUsingVisibility: false,
            },

            /**
             *  Properties – all possible to override with options argument.
             */
            container: null,
            containerWidth: 0,
            items: [],
            numItems: 0,
            numHalfItems: 0,
            pointer: 0,
            pointerVal: 0,
            itemsVisible: {},
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
    
            /**
             *  Methods.
             */
            init: function(container, options) {
    
                this.container = container;
                var item, i, n, element, src;
                this.body = document.getElementsByTagName('body')[0];
    
                if(options !== undefined) {
                    this.setOptions(this.settings, options);
                }

                /**
                 *  Replace all tin-slide-image sources with images.
                 */
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

                /**
                 *  Replace all tin-slide-background sources with images.
                 */
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
    
                /**
                 *  Replace all tin-slide-markup with desired markup.
                 */
                var tinSlideMarkup = container.getElementsByClassName('tin-slide-markup');
                var tinSlideMarkupArr = [];
                for(i=0, n=tinSlideMarkup.length; i<n; i++) {
                    tinSlideMarkupArr.push(tinSlideMarkup[i]);
                }
                while(tinSlideMarkupArr.length) {
                    element = tinSlideMarkupArr.shift();
                    var template = document.createElement('template');
                    template.innerHTML = element.getAttribute('data-markup');
                    element.parentNode.replaceChild(template.content.firstChild, element);
                }

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
    
                if(this.settings.ratio) {
                    this.settings.ratioPercent = 100 * (1/this.settings.ratio);
                }

                var containerHeight = 0;
                for(i=0; i<this.numItems; i++) {
                    item = this.items[i];
                    item.tinSlideIndex = i;
    
                    // Item styles
                    item.style.top = !this.settings.verticallyCenter ? '0' : '50%';
                    item.style.left = '0';
                    item.style.width = '100%';
    
                    // Hide all items
                    item.style.position = 'absolute';
                    this.hideOrShowElement(item, true);
                }
    
                /**
                 *  Container styles.
                 */
                this.container.style.position = 'relative';
                if(this.settings.cropContainer) {
                    this.container.style.overflow = 'hidden';
                }
                if(this.settings.ratio) {
                    this.container.style.paddingTop = this.settings.ratioPercent+'%';
                }
                if(this.settings.zIndex) {
                    this.container.style.zIndex = this.settings.zIndex;
                }
                
                /**
                 * Create callback functions bound to this scope.
                 */
                this._onAnimationTimer = this.onAnimationTimer.bind(this);
                this._onSwipePress = this.onSwipePress.bind(this);
                this._onSwipeRelease = this.onSwipeRelease.bind(this);
                this._onSwipeMove = this.onSwipeMove.bind(this);
                this._onTimerSwipe = this.onTimerSwipe.bind(this);
                this._pauseAuto = this.pauseAuto.bind(this);
                this._resumeAuto = this.resumeAuto.bind(this);

                var that = this;
    
                /**
                 *  Set up prev / next navigation.
                 */
                if(this.settings.useContainerClickNextPrev) {
                    this.container.addEventListener('click', function(event) {
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
    
                /**
                 *  Set up swipe navigation.
                 */
                if(this.items.length > 1) {

                    var styles = {
                        'user-drag': 'none',
                        'user-select': 'none',
                        '-moz-user-select': 'none',
                        '-webkit-user-drag': 'none',
                        '-webkit-user-select': 'none',
                        '-ms-user-select': 'none'
                    };
                    for(i=0; i<this.numItems; i++) {
                        this.css(this.items[i], styles);
                        var images = this.items[i].getElementsByTagName('img');
                        n = images.length;
                        for(var j=0; j<n; j++) {
                            this.css(images[j], styles);
                        }
                    }

                    if(this.settings.useSwipeNavigation) {
                        this.container.addEventListener('touchstart', this._onSwipePress);

                        // Swipe styles.
                        if(!this.settings.swipeTouchOnly) {
                            this.container.style.cssText += '; cursor: -webkit-grab; cursor: grab;';
                            this.container.addEventListener('mousedown', this._onSwipePress);
                        }
                    }
                }
    
                /**
                 *  If container height should always match selected item.
                 */
                if(this.settings.useUpdateContainerHeight) {
                    this.updateContainerHeight();
                    window.addEventListener('resize', function() {
                        this.updateContainerHeight();
                    }.bind(this));
                    // Update height every second.
                    // this.timerUpdateContainerHeight = setInterval(function() {
                    //     that.updateContainerHeight();
                    // }, 1000);
                }
    
                // Force recalculation of container width on window resize.
                // Calculation will occur when width is needed.
                window.addEventListener('resize', function() {
                    this.containerWidth = 0;
                }.bind(this));
    
                if(this.items.length > 1) {

                    /**
                     *  Generate dots.
                     */
                    if(this.settings.generate.dots.on) {
                        this.dots = this.createDots();
                        this.container.parentNode.insertBefore(
                            this.dots,
                            this.settings.generate.dots.afterContainer ? this.container.nextSibling : this.container
                        );
                    }
    
                    /**
                     *  Generate nav.
                     */
                    if(this.settings.generate.nav.on) {
                        this.nav = this.createNav();
                        this.container.parentNode.insertBefore(
                            this.nav,
                            this.settings.generate.nav.afterContainer ? this.container.nextSibling : this.container
                        );
                    }

                    /**
                     * Generate default styles.
                     */
                    if(this.settings.generate.styles.on) {
                        if(this.settings.generate.styles.containerParentPosition) {
                            this.container.parentNode.style.position = this.settings.generate.styles.containerParentPosition;
                        }
                        var style = this.createStyles();
                        // document.getElementsByTagName('head')[0].appendChild(style);
                        var head = document.getElementsByTagName('head')[0];
                        head.insertBefore(style, head.firstChild);
                    }
                }
    
                // Set slider to initial position.
                this.setPointer(this.targetIndex);
                // Update dots.
                this.updateDots();
                // Start auto play if desired.
                if(this.items.length > 1) {
                    if(this.settings.autoPlay) {
                        this.startAuto();
                    }
                    if(this.settings.autoPlayPauseOnHover) {
                        var pauseElements = [this.container];
                        if(this.dots) {
                            pauseElements.push(this.dots);
                        }
                        if(this.nav) {
                            pauseElements.push(this.nav);
                        }
                        for(i=0; i<pauseElements.length; i++) {
                            pauseElements[i].addEventListener('mouseenter', this._pauseAuto);
                            pauseElements[i].addEventListener('mouseleave', this._resumeAuto);
                        }
                    }
                }

                document.addEventListener('touchmove', function(event) {
                    if(that.swipePreventDefault) {
                        event.preventDefault();
                    }
                });
            },
            css: function(element, styles) {
                for(var style in styles) {
                    element.style[style] = styles[style];
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
                }
                element.className = classes.join(' ');
            },
            hasClass: function(element, className) {
                var classes = element.className.split(' ');
                return classes.indexOf(className) > -1;
            },
            hideOrShowElement: function(element, hide) {
                if(this.settings.hideUsingVisibility) {
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
            createDots: function() {
    
                /**
                 *  Dots.
                 */
                var that = this;
                var ul = document.createElement("UL");
                ul.setAttribute('class', 'tin-slide-dots');
                var liClickHandler = function(event) {
                    that.onDotClick(event);
                };
                this.dotsItems = [];
                for(var i=0; i<this.numItems; i++) {
                    var li = document.createElement('LI');
                    li.setAttribute('class', 'tin-slide-dot-'+i);
                    li.setAttribute('tin-slide-index', i);
                    li.style.cursor = 'pointer';
                    ul.appendChild(li);
                    this.dotsItems.push(li);
                    li.addEventListener('click', liClickHandler);
                }
                return ul;
    
            },
            createNav: function() {
    
                /**
                 *  Next / prev.
                 */
                var that = this;
                var nav = document.createElement("NAV");
                nav.setAttribute('class', 'tin-slide-next-prev');

                var prev = document.createElement("DIV");
                prev.setAttribute('class', 'tin-slide-prev');
                prev.style.cursor = 'pointer';
                // Added to prevent text selection from double click.
                prev.addEventListener('mousedown', function(event) {
                    event.preventDefault();
                });
                prev.addEventListener('click', function(event) {
                    this.previous();
                }.bind(this));
                nav.appendChild(prev);
    
                var next = document.createElement("DIV");
                next.setAttribute('class', 'tin-slide-next');
                next.style.cursor = 'pointer';
                // Added to prevent text selection from double click.
                next.addEventListener('mousedown', function(event) {
                    event.preventDefault();
                });
                next.addEventListener('click', function(event) {
                    this.next();
                }.bind(this));
                nav.appendChild(next);

                return nav;
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
                
                var style = document.createElement('STYLE');
                style.innerHTML = styles.join("\n");
                return style;
            },
    
            /**
             *  Update the slider.
             */
            setPointer: function(val) {
    
                this.pointerVal = val;
                var pointer = val % this.numItems;
                if(pointer < 0 && this.settings.loop) {
                    pointer += this.numItems;
                }
                this.pointer = pointer;
    
                // Visible items – first add the floor index.
                var visibleItems = [];
                var floorPointer = Math.floor(this.pointer);
                if(floorPointer >= 0) {
                    visibleItems.push(this.items[floorPointer]);
                }
                // Add ceil index if pointer is not at destination.
                if(this.pointer !== floorPointer) {
                    var ceilPointer = Math.ceil(this.pointer);
                    if(this.settings.loop) {
                        ceilPointer %= this.numItems;
                    }
                    if(ceilPointer < this.items.length) {
                        visibleItems.push(this.items[ceilPointer]);
                    }
                }
                var index;
                // Mark previously visible items for check.
                for(index in this.itemsVisible) {
                    this.itemsVisible[index] = null;
                }
                var item;
                var len=visibleItems.length;
                var relativeItem = false;
                for(var i=0; i<len; i++) {
                    item = visibleItems[i];
                    // If previously non visible item becomes visible.
                    if(this.itemsVisible[item.tinSlideIndex] === undefined) {
                        this.hideOrShowElement(item, false);
                    }
                    // Store progress.
                    var progress = this.pointer - item.tinSlideIndex;
                    if(progress > 1) {progress -= this.numItems;}
                    this.itemsVisible[item.tinSlideIndex] = progress;
    
                    // Make the most visible item relatively positioned,
                    // and put it in front of the others.
                    if(!(progress > 0.5 || progress < -0.5) && !relativeItem) {
                        relativeItem = true;
                        // All slides absolute positioned if slider has a defined height
                        // (in separate CSS) or ratio.
                        if(!(this.settings.useUpdateContainerHeight || this.settings.ratio || this.settings.hasHeight)) {
                            item.style.position = 'relative';
                        }
                        if(this.settings.zIndex) {
                            visibleItems[i].style.zIndex = this.settings.zIndex + 1;
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
                        if(this.settings.autoPlayStopOnNavigation) {
                            this.stopAuto();
                        }
                    }
                    if(!this.timerSwipe) {
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
                        if(this.settings.autoPlayStopOnNavigation) {
                            this.stopAuto();
                        }
                    }
                    if(!this.timerSwipe) {
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
    
                    this.swipePressX = isTouch ? event.layerX : event.clientX;
                    this.swipeX = 0;
                    this.swipeXAbs = 0;
    
                    if(this.settings.swipePressWaitBeforeInvokeGrabbing) {
                        var that = this;
                        // Wait before invoke grabbing.
                        clearTimeout(this.timerSwipePress);
                        this.timerSwipePress = setTimeout(function() {
                            that.onTimerSwipePress();
                        }, 25 * 3);
                        var handlers = {
                            onRelease: function() {
                                clearTimeout(that.timerSwipePress);
                                document.removeEventListener('touchend', this.onRelease);
                                document.removeEventListener('mouseup', this.onRelease);
                            }
                        };
                        document.addEventListener('touchend', handlers.onRelease);
                        document.addEventListener('mouseup', handlers.onRelease);
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
            // Performs the actual grabbing – stops slider etc.
            onTimerSwipePress: function() {

                if(!this.settings.swipeTouchOnly) {
                    this.container.style.cssText += '; cursor: -webkit-grabbing; cursor: grabbing;';
                }

                // Clear timer used for non looping hint.
                clearTimeout(this.timerNonLoopingHint);
    
                // Stop auto play.
                if(this.settings.autoPlayStopOnNavigation) {
                    this.stopAuto();
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
                    stepAdd *= this.settings.swipeStepFactor;
                    step += stepAdd;
                }
    
                this.swipePressPointerVal = this.pointerVal + step;
                this.swipeTargetVal = this.swipePressPointerVal;
    
                // var that = this;
                // var handlers = {
                //     onSwipeMove: function(event) {
                //         that.onSwipeMove(event);
                //     },
                //     onSwipeRelease: function() {
                //         document.removeEventListener('touchmove', handlers.onSwipeMove);
                //         document.removeEventListener('mousemove', handlers.onSwipeMove);
                //         document.removeEventListener('touchend', handlers.onSwipeRelease);
                //         document.removeEventListener('mouseup', handlers.onSwipeRelease);
                //         that.onSwipeRelease();
                //     }
                // };
                // document.addEventListener('touchmove', handlers.onSwipeMove);
                // document.addEventListener('mousemove', handlers.onSwipeMove);
                // document.addEventListener('touchend', handlers.onSwipeRelease);
                // document.addEventListener('mouseup', handlers.onSwipeRelease);

                document.addEventListener('touchmove', this._onSwipeMove);
                document.addEventListener('touchend', this._onSwipeRelease);
                if(!this.settings.swipeTouchOnly) {
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

                        this.swipeX = this.swipePressX - (isTouch ? event.layerX : event.clientX);
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
            onSwipeRelease: function() {

                document.removeEventListener('touchmove', this._onSwipeMove);
                document.removeEventListener('touchend', this._onSwipeRelease);
                if(!this.settings.swipeTouchOnly) {
                    document.removeEventListener('mousemove', this._onSwipeMove);
                    document.removeEventListener('mouseup', this._onSwipeRelease);
                    this.container.style.cssText += '; cursor: -webkit-grab; cursor: grab;';
                }

                this.swipePreventDefault = false;
                this.swipeScrollsElementCounter = 0;

                if(this.swipeXAbs >= this.settings.swipeReleaseRequiredSwipeX) {
                    var limit = 0.04;
                    var targetIndex;
                    if(this.step < -limit) {
                        targetIndex = Math.floor(this.pointerVal);
                    }
                    else if(this.step > limit) {
                        targetIndex = Math.ceil(this.pointerVal);
                    }
                    else {
                        // Calculate how far the slide will travel upon release.
                        var step = this.step * 15;
                        var stepAdd = this.step;
                        for(var i=0; i<80; i++) {
                            stepAdd *= this.settings.swipeStepFactor;
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
                var step = diff * (!this.swipeIsTouch ? this.settings.swipeStepFactor : this.settings.swipeStepFactorTouch);
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
                    // clearInterval(this.timerAnimate);
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
                }
                this.timerAnimate = requestAnimationFrame(this._onAnimationTimer);
            },
            goTo: function(index) {
                // Clear timer used for non looping hint.
                clearTimeout(this.timerNonLoopingHint);
                // Stop auto play.
                if(this.settings.autoPlayStopOnNavigation) {
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
                if(this.containerHeight !== containerHeight) {
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
                        var translateY = !this.settings.verticallyCenter ? 0 : '-50%';
                        transforms.push('translate3d('+((this.settings.effects.slideHorizontal.offset*100)*-progress)+'%, '+translateY+', 0)');
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
                        // var scale = this.settings.effects.scale.min + (1 - (progress < 0 ? -progress : progress)) * (this.settings.effects.scale.max - this.settings.effects.scale.min);
                        transforms.push('scale('+scale+', '+scale+')');
                    }
    
                    // Apply accumulated transforms.
                    if(transforms.length) {
                        item.style.transform = transforms.join(' ');
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
                        /**
                         *  Hide elements completely faded out.
                         */
                        // if(opacity) {
                        //     if(item.style.display === 'none') {
                        //         item.style.display = 'block';
                        //     }
                        // }
                        // else {
                        //     // Don't hide the relatively positioned element,
                        //     // as the container will loose its height.
                        //     if(item.style.position != 'relative' && item.style.display !== 'none') {
                        //         item.style.display = 'none';
                        //     }
                        // }
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
                        this.removeClass(dot, 'on');
                    }
                    this.currentDotIndex = this.targetIndexWithinBounds;
                    dot = this.dotsItems[this.currentDotIndex];
                    this.addClass(dot, 'on');
                }
            },
            onDotClick: function(event) {
                // Stop auto play.
                if(this.settings.autoPlayStopOnNavigation) {
                    this.stopAuto();
                }
                var index = parseInt(event.target.getAttribute('tin-slide-index'), 10);
                this.animateTo(index);
            },
            startAuto: function() {
                if(this.autoPlayState !== 'started') {
                    this.autoPlayState = 'started';
                    this.resumeAuto();
                }
            },
            pauseAuto: function() {
                // Don't do anything if auto play isn't activated.
                if(this.autoPlayState) {
                    this.autoPlayState = 'paused';
                    clearInterval(this.timerAutoPlay);
                    this.timerAutoPlay = 0;
                }
            },
            resumeAuto: function() {
                // Don't do anything if auto play isn't activated.
                if(this.autoPlayState) {
                    this.autoPlayState = 'started';
                    clearInterval(this.timerAutoPlay);
                    this.timerAutoPlay = setInterval(function() {
                        // Only auto slide if slider is visible.
                        // Also don't slide if window isn't visible.
                        if(this.container.clientHeight && !this.hasClass(this.container, 'window-hidden')) {
                            var status = this.autoPlayForwards ? this.next(true) : this.previous(true);
                            // Change direction if navigation failed.
                            if(!status) {
                                this.autoPlayForwards = !this.autoPlayForwards;
                                status = this.autoPlayForwards ? this.next(true) : this.previous(true);
                            }
                        }
                    }.bind(this), this.settings.autoPlayTime);
                }
            },
            stopAuto: function() {
                if(this.autoPlayState) {
                    this.pauseAuto();
                    this.autoPlayState = null;
                }
            }
        };
    
        // Initialize.
        logic.init(container, options);

        /**
         *  Public methods.
         */
        var tinSlide = {
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
            }
        };

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

        return this;

    }

    return TinSlide$;

}));