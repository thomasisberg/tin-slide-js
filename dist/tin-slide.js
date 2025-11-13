"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

(function (global, factory) {
  'use strict';

  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.TinSlide = factory();
  }
})(void 0 ? void 0 : window, function () {
  'use strict';

  function TinSlide$(container, options) {
    var tinSlide, logic;
    logic = {
      defaultSettings: {
        debug: false,
        effects: {
          slideHorizontal: {
            on: true,
            offset: 1,
            numVisible: 1,
            centerSelected: false
          },
          scale: {
            on: false,
            min: 0.8,
            max: 1,
            minAt: 1.0,
            maxAt: 0.0
          },
          fade: {
            on: false,
            min: 0,
            max: 1,
            minAt: 1.0,
            maxAt: 0
          },
          motionBlur: {
            on: false,
            maxPixels: 2,
            stepMin: 0.05,
            factor: 500
          }
        },
        useUpdateContainerHeight: false,
        verticallyCenter: false,
        useContainerClickNextPrev: false,
        swipe: {
          on: true,
          touchOnly: false,
          stepFactor: 0.25,
          stepFactorTouch: 0.75,
          pressMoveBeforeInvokeGrabbing: false,
          releaseRequiredSwipeX: 0
        },
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
        ratio: null,
        hasHeight: false,
        autoPlay: {
          on: false,
          time: 5000,
          pauseOnHover: true,
          stopOnNavigation: true
        },
        loop: true,
        useNonLoopingHint: true,
        cropContainer: true,
        zIndex: 0,
        hideItems: true,
        hideUsingVisibility: false,
        moveSelectedItem: false,
        stepSnap: 0.0003,
        stepFactor: 0.2,
        stepMax: 0.20,
        stepMin: 0.0004,
        stepTurnBreakFactor: 0.5,
        chokeReleaseStep: 0.05,
        chokeReleaseFactor: 1.5,
        chokeReturnFactor: 2
      },
      settings: {},
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
      step: 0,
      stepAbs: 0,
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
      dotsItems: null,
      currentDotIndex: null,
      nav: null,
      ratioPercent: null,
      timerAutoPlay: 0,
      autoPlayState: null,
      autoPlayForwards: true,
      timerNonLoopingHint: 0,
      translateXOffsetProgress: 0,
      style: null,
      breakPoints: [],
      currentBreakPoint: {},
      init: function init(container, options) {
        this.onSwipePressMove = this.onSwipePressMove.bind(this);
        this.clearSwipePressMove = this.clearSwipePressMove.bind(this);
        this.container = container;
        var item, i, n, v, element, src;
        this.body = document.getElementsByTagName('body')[0];
        var tinSlideImages = container.getElementsByClassName('tin-slide-img');
        var tinSlideImagesArr = [];

        for (i = 0, n = tinSlideImages.length; i < n; i++) {
          tinSlideImagesArr.push(tinSlideImages[i]);
        }

        while (tinSlideImagesArr.length) {
          element = tinSlideImagesArr.shift();
          var img = document.createElement('img');
          src = element.getAttribute('data-src');

          if (src && src !== undefined && src !== '') {
            img.setAttribute('src', src);
          }

          var srcset = element.getAttribute('data-srcset');

          if (srcset && srcset !== undefined && srcset !== '') {
            img.setAttribute('srcset', srcset);
          }

          var bg = element.getAttribute('data-bg');

          if (bg && bg !== undefined && bg !== '') {
            img.setAttribute('style', 'background: url("' + bg + '") no-repeat center; background-size: cover;');
          }

          element.parentNode.replaceChild(img, element);
        }

        var tinSlideBackgrounds = container.getElementsByClassName('tin-slide-bg');
        var tinSlideBackgroundsArr = [];

        for (i = 0, n = tinSlideBackgrounds.length; i < n; i++) {
          tinSlideBackgroundsArr.push(tinSlideBackgrounds[i]);
        }

        while (tinSlideBackgroundsArr.length) {
          element = tinSlideBackgroundsArr.shift();
          src = element.getAttribute('data-bg');

          if (src && src !== undefined && src !== '') {
            element.setAttribute('style', 'background: url("' + src + '") no-repeat center; background-size: cover;');
          }
        }

        var tinSlideMarkup = container.getElementsByClassName('tin-slide-markup');
        var tinSlideMarkupArr = [];

        for (i = 0, n = tinSlideMarkup.length; i < n; i++) {
          tinSlideMarkupArr.push(tinSlideMarkup[i]);
        }

        while (tinSlideMarkupArr.length) {
          element = tinSlideMarkupArr.shift();
          var template = document.createElement('div');
          template.innerHTML = element.getAttribute('data-markup');
          element.parentNode.replaceChild(template.firstElementChild, element);
        }

        var items = [];

        for (i = 0, n = this.container.childNodes.length; i < n; i++) {
          item = this.container.childNodes[i];

          if (item.nodeType === Node.ELEMENT_NODE) {
            items.push(item);
          }
        }

        this.items = items;
        this.numItems = this.items.length;
        this.numHalfItems = this.numItems / 2;

        for (i = 0; i < this.numItems; i++) {
          item = this.items[i];
          item.tinSlideIndex = i;
          item.style.position = 'absolute';
          this.hideOrShowElement(item, true, options);
        }

        var images = this.container.querySelectorAll('img');

        if (images.length) {
          var head = document.querySelector('head');

          for (var i = 0; i < images.length; i++) {
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

        this._onAnimationTimer = this.onAnimationTimer.bind(this);
        this._onSwipePress = this.onSwipePress.bind(this);
        this._onSwipeRelease = this.onSwipeRelease.bind(this);
        this._onSwipeMove = this.onSwipeMove.bind(this);
        this._onTimerSwipe = this.onTimerSwipe.bind(this);
        this._pauseAuto = this.pauseAuto.bind(this);
        this._resumeAuto = this.resumeAuto.bind(this);
        this._imageLoaded = this.imageLoaded.bind(this);
        this._updateContainerHeight = this.updateContainerHeight.bind(this);

        if (options !== undefined) {
          this.setOptions(this.defaultSettings, options);

          if (options.breakPoints !== undefined) {
            for (v in options.breakPoints) {
              var width = parseInt(v, 10);

              if (!isNaN(width)) {
                this.breakPoints.push({
                  width: width,
                  options: options.breakPoints[v]
                });
              }
            }

            this.breakPoints.sort(function (a, b) {
              return a.width - b.width;
            });
            var breakPointOptions = {};

            for (i = 0; i < this.breakPoints.length; i++) {
              this.mergeObjects(breakPointOptions, this.breakPoints[i].options);
              this.breakPoints[i].options = this.cloneObject(breakPointOptions, {});
            }
          }
        }

        container.style.position = 'relative';
        this.updateBreakPoint();

        for (i = 0; i < this.numItems; i++) {
          item = this.items[i];
          item.removeAttribute('tin-slide-cloak');
        }

        container.removeAttribute('tin-slide-cloak');
        var images = this.container.querySelectorAll('img');

        for (i = 0; i < images.length; i++) {
          images[i].addEventListener('load', this._imageLoaded);
        }

        window.addEventListener('resize', function () {
          this.containerWidth = 0;
          this.updateBreakPoint();
        }.bind(this));
        document.addEventListener('touchmove', function (event) {
          if (this.swipePreventDefault) {
            event.preventDefault();
          }
        }.bind(this), {
          passive: false
        });
      },
      updateBreakPoint: function updateBreakPoint() {
        var breakPoint = this.getBreakPoint();

        if (breakPoint === this.currentBreakPoint) {
          return;
        }

        this.currentBreakPoint = breakPoint;

        if (breakPoint) {
          this.container.setAttribute('tin-slide-break-point', breakPoint.width);
          this.initSettings(breakPoint.options);
        } else {
          this.container.removeAttribute('tin-slide-break-point');
          this.initSettings();
        }
      },
      getBreakPoint: function getBreakPoint() {
        var breakPoint = null;
        var i,
            n,
            w = this.getContainerWidth();

        for (i = 0, n = this.breakPoints.length; i < n; i++) {
          if (w >= this.breakPoints[i].width) {
            breakPoint = this.breakPoints[i];
          } else {
            break;
          }
        }

        return breakPoint;
      },
      initSettings: function initSettings(breakPointOptions) {
        if (breakPointOptions === undefined) {
          this.settings = this.defaultSettings;
        } else {
          var settings = this.cloneObject(this.defaultSettings, {});
          this.setOptions(settings, breakPointOptions);
          this.settings = settings;
        }

        var i, n, item;

        for (i = 0; i < this.numItems; i++) {
          item = this.items[i];
          item.style.top = !this.settings.verticallyCenter ? '0' : '50%';
          item.style.left = '0';
          item.style.width = (this.settings.effects.slideHorizontal.on ? 100 / this.settings.effects.slideHorizontal.numVisible : 100) + '%';
        }

        if (this.settings.cropContainer) {
          this.container.style.overflow = 'hidden';
        } else if (this.container.style.overflow === 'hidden') {
          this.container.style.overflow = '';
        }

        if (this.settings.ratio) {
          this.settings.ratioPercent = 100 * (1 / this.settings.ratio);
          this.container.style.paddingTop = this.settings.ratioPercent + '%';
        } else if (this.container.style.paddingTop !== '') {
          this.container.style.paddingTop = '';
        }

        if (this.settings.zIndex) {
          this.container.style.zIndex = this.settings.zIndex;
        } else if (this.container.style.zIndex !== '') {
          this.container.style.zIndex = '';
        }

        if (this.settings.useContainerClickNextPrev) {
          this.container.addEventListener('mouseup', function (event) {
            var containerWidth = this.getContainerWidth();

            if (containerWidth) {
              if (event.layerX - this.container.offsetLeft < containerWidth / 2) {
                this.previous();
              } else {
                this.next();
              }
            }
          }.bind(this));
        }

        if (this.items.length > 1) {
          this.setSwipeStyles();
          this.container.removeEventListener('touchstart', this._onSwipePress);
          this.container.removeEventListener('mousedown', this._onSwipePress);

          if (this.settings.swipe.on) {
            this.container.addEventListener('touchstart', this._onSwipePress);

            if (!this.settings.swipe.touchOnly) {
              this.container.addEventListener('mousedown', this._onSwipePress);
            }
          }
        }

        window.removeEventListener('resize', this._updateContainerHeight);

        if (this.settings.useUpdateContainerHeight) {
          this.updateContainerHeight();
          window.addEventListener('resize', this._updateContainerHeight);
        } else {
          this.container.style.height = '';
        }

        this.numItemsInside = 1;
        this.translateXOffsetProgress = 0;

        if (this.settings.effects.slideHorizontal.on && this.settings.effects.slideHorizontal.numVisible > 1) {
          this.numItemsInside = this.settings.effects.slideHorizontal.numVisible;

          if (this.settings.effects.slideHorizontal.centerSelected) {
            this.translateXOffsetProgress = 0.5 * (this.settings.effects.slideHorizontal.numVisible - 1);
          }
        }

        if (this.items.length > 1) {
          if (this.settings.generate.dots.on) {
            if (!this.dots) {
              this.dots = this.createDots();
            }

            this.container.parentNode.insertBefore(this.dots, this.settings.generate.dots.afterContainer ? this.container.nextSibling : this.container);
          } else {
            if (this.dots && this.dots.parentNode) {
              this.dots.parentNode.removeChild(this.dots);
            }
          }

          if (this.settings.generate.nav.on) {
            if (!this.nav) {
              this.nav = this.createNav();
            }

            this.container.parentNode.insertBefore(this.nav, this.settings.generate.nav.afterContainer ? this.container.nextSibling : this.container);
          } else {
            if (this.nav && this.nav.parentNode) {
              this.nav.parentNode.removeChild(this.nav);
            }
          }

          if (this.settings.generate.styles.on) {
            if (this.settings.generate.styles.containerParentPosition) {
              this.container.parentNode.style.position = this.settings.generate.styles.containerParentPosition;
            }

            if (!this.style) {
              this.style = this.createStyles();
            }

            var head = document.getElementsByTagName('head')[0];
            head.insertBefore(this.style, head.firstChild);
          } else {
            if (this.style && this.style.parentNode) {
              this.style.parentNode.removeChild(this.style);
            }
          }
        }

        if (this.items.length > 1) {
          var pauseElements = [this.container];

          if (this.dots) {
            pauseElements.push(this.dots);
          }

          if (this.nav) {
            pauseElements.push(this.nav);
          }

          for (i = 0; i < pauseElements.length; i++) {
            pauseElements[i].removeEventListener('mouseenter', this._pauseAuto);
            pauseElements[i].removeEventListener('mouseleave', this._resumeAuto);
          }

          this.pauseAuto();

          if (this.settings.autoPlay.on) {
            this.startAuto();

            if (this.settings.autoPlay.pauseOnHover) {
              for (i = 0; i < pauseElements.length; i++) {
                pauseElements[i].addEventListener('mouseenter', this._pauseAuto);
                pauseElements[i].addEventListener('mouseleave', this._resumeAuto);
              }
            }
          }
        }

        this.selectedItem = null;
        this.setPointer(this.pointerVal);
        this.updateDots();
      },
      setSwipeStyles: function setSwipeStyles() {
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

        for (var v in styles) {
          imageStyles[v] = styles[v];
        }

        imageStyles['pointer-events'] = 'none';

        for (i = 0; i < this.numItems; i++) {
          if (this.settings.swipe.on) {
            this.css(this.items[i], styles);
          } else {
            this.removeCss(this.items[i], styles);
          }

          var imageNodes = this.items[i].getElementsByTagName('img');
          n = imageNodes.length;

          for (j = 0; j < n; j++) {
            if (this.settings.swipe.on) {
              this.css(imageNodes[j], imageStyles);
            } else {
              this.removeCss(imageNodes[j], imageStyles);
            }
          }
        }

        if (this.settings.swipe.on && !this.settings.swipe.touchOnly) {
          this.container.style.cssText += '; cursor: -webkit-grab; cursor: grab;';
        } else {
          this.removeCss(this.container, ['cursor']);
        }
      },
      css: function css(element, styles) {
        for (var style in styles) {
          element.style[style] = styles[style];
        }
      },
      removeCss: function removeCss(element, styles) {
        if (Array.isArray(styles)) {
          for (var i = 0; i < styles.length; i++) {
            element.style[styles[i]] = '';
          }
        } else {
          for (var style in styles) {
            element.style[style] = '';
          }
        }
      },
      addClass: function addClass(element, className) {
        var classes = element.className.split(' ');

        if (classes.indexOf(className) === -1) {
          classes.push(className);
        }

        element.className = classes.join(' ');
      },
      removeClass: function removeClass(element, className) {
        var classes = element.className.split(' ');
        var idx = classes.indexOf(className);

        if (idx !== -1) {
          classes.splice(idx, 1);
          element.className = classes.join(' ');
        }
      },
      hasClass: function hasClass(element, className) {
        var classes = element.className.split(' ');
        return classes.indexOf(className) > -1;
      },
      hideOrShowElement: function hideOrShowElement(element, hide, options) {
        if (!options) {
          options = this.settings;
        }

        if (options.hideUsingVisibility) {
          element.style.visibility = hide ? 'hidden' : 'visible';
        } else {
          element.style.display = hide ? 'none' : 'block';
        }
      },
      setOptions: function setOptions(scope, options) {
        for (var v in options) {
          var type = _typeof(scope[v]);

          if (type === _typeof(options[v]) || scope[v] === null) {
            if (type === 'object' && scope[v] !== null) {
              this.setOptions(scope[v], options[v]);
            } else {
              scope[v] = options[v];
            }
          }
        }
      },
      cloneObject: function cloneObject(original, clone) {
        var v, i;

        if (!Array.isArray(original)) {
          for (v in original) {
            if (_typeof(original[v]) === 'object' && original[v] !== null) {
              clone[v] = Array.isArray(original[v]) ? [] : {};
              this.cloneObject(original[v], clone[v]);
            } else {
              clone[v] = original[v];
            }
          }
        } else {
          for (i = 0; i < original.length; i++) {
            if (_typeof(original[i]) === 'object' && settings[i] !== null) {
              clone.push(Array.isArray(original[v]) ? [] : {});
              this.cloneObject(original[i], clone[i]);
            } else {
              clone.push(original[i]);
            }
          }
        }

        return clone;
      },
      mergeObjects: function mergeObjects(original, add) {
        var v, i;

        for (v in add) {
          if (_typeof(add[v]) === 'object' && add[v] !== null && !Array.isArray(add[v])) {
            if (_typeof(original[v]) !== 'object' || original[v] === null || Array.isArray(original[v])) {
              original[v] = {};
            }

            this.mergeObjects(original[v], add[v]);
          } else {
            original[v] = add[v];
          }
        }

        return original;
      },
      createDots: function createDots() {
        var that = this;
        var container = null;
        var markup = this.settings.generate.dots.markup;

        if (markup && markup.container) {
          container = new DOMParser().parseFromString(markup.container, "text/xml");
        }

        if (!container) {
          container = document.createElement("UL");
          container.setAttribute('class', 'tin-slide-dots');
        }

        var liClickHandler = function liClickHandler(event) {
          that.onDotClick(event);
        };

        this.dotsItems = [];

        for (var i = 0; i < this.numItems; i++) {
          var dot = markup && markup.dot ? new DOMParser().parseFromString(markup.dot, "text/xml") : null;

          if (!dot) {
            dot = document.createElement('LI');
            dot.setAttribute('class', 'tin-slide-dot-' + i);
            dot.setAttribute('tin-slide-index', i);
            dot.style.cursor = 'pointer';
          }

          container.appendChild(dot);
          this.dotsItems.push(dot);
          dot.addEventListener('click', liClickHandler);
        }

        return container;
      },
      createNav: function createNav() {
        var that = this;
        var markup = this.settings.generate.nav.markup;

        if (markup && markup.container) {
          container = new DOMParser().parseFromString(markup.container, "text/xml");
        }

        if (!container) {
          container = document.createElement("NAV");
          container.setAttribute('class', 'tin-slide-next-prev');
        }

        var prev = markup && markup.prev ? new DOMParser().parseFromString(markup.prev, "text/xml") : null;

        if (!prev) {
          prev = document.createElement("DIV");
          prev.setAttribute('class', 'tin-slide-prev');
          prev.style.cursor = 'pointer';
        }

        prev.addEventListener('mousedown', function (event) {
          event.preventDefault();
        });
        prev.addEventListener('click', function (event) {
          this.previous();
        }.bind(this));
        container.appendChild(prev);
        var next = markup && markup.next ? new DOMParser().parseFromString(markup.next, "text/xml") : null;

        if (!next) {
          next = document.createElement("DIV");
          next.setAttribute('class', 'tin-slide-next');
          next.style.cursor = 'pointer';
        }

        next.addEventListener('mousedown', function (event) {
          event.preventDefault();
        });
        next.addEventListener('click', function (event) {
          this.next();
        }.bind(this));
        container.appendChild(next);
        return container;
      },
      createStyles: function createStyles() {
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
      setPointer: function setPointer(val) {
        var i, index;
        this.pointerVal = val;
        var pointer = val % this.numItems;

        if (pointer < 0 && this.settings.loop) {
          pointer += this.numItems;
        }

        this.pointer = pointer;
        var visibleItems = [];

        if (!this.settings.hideItems) {
          for (i = 0; i < this.numItems; i++) {
            visibleItems.push(this.items[i]);
          }
        } else {
          var visiblePointer = pointer - this.translateXOffsetProgress;

          if (visiblePointer < 0 && this.settings.loop) {
            visiblePointer += this.numItems;
          }

          var floorPointer = Math.floor(visiblePointer);

          if (floorPointer >= 0) {
            visibleItems.push(this.items[floorPointer]);
          }

          for (i = 1; i <= this.numItemsInside - (visiblePointer === floorPointer ? 1 : 0); i++) {
            var ceilPointer = floorPointer + i;

            if (this.settings.loop) {
              ceilPointer %= this.numItems;
            }

            if (ceilPointer < this.items.length && visibleItems.indexOf(this.items[ceilPointer]) === -1) {
              visibleItems.push(this.items[ceilPointer]);
            }
          }
        }

        for (index in this.itemsVisible) {
          this.itemsVisible[index] = null;
        }

        var item;
        var len = visibleItems.length;
        var relativeItem = false;

        for (i = 0; i < len; i++) {
          item = visibleItems[i];

          if (this.itemsVisible[item.tinSlideIndex] === undefined) {
            this.hideOrShowElement(item, false);
          }

          var progress = this.pointer - item.tinSlideIndex;

          if (!this.translateXOffsetProgress) {
            if (progress > 1) {
              progress -= this.numItems;
            }
          } else {
            if (progress > this.numHalfItems) {
              progress -= this.numItems;
            } else if (progress < -this.numHalfItems) {
              progress += this.numItems;
            }
          }

          this.itemsVisible[item.tinSlideIndex] = progress;

          if (!(progress > 0.5 || progress < -0.5) && !relativeItem) {
            relativeItem = true;

            if (this.selectedItem !== item) {
              if (this.selectedItem) {
                this.removeClass(this.selectedItem, 'tin-slide-selected');
              }

              this.selectedItem = item;
              this.addClass(item, 'tin-slide-selected');

              if (!(this.settings.useUpdateContainerHeight || this.settings.ratio || this.settings.hasHeight)) {
                item.style.position = 'relative';
              }

              if (this.settings.zIndex) {
                item.style.zIndex = this.settings.zIndex;
              }

              if (this.settings.moveSelectedItem) {
                this.container.removeChild(item);
                this.container.appendChild(item);
              }

              tinSlide.emit('itemSelected', {
                index: item.tinSlideIndex,
                item: item
              });
            }
          } else {
            item.style.position = 'absolute';
            item.style.zIndex = '';
          }
        }

        for (index in this.itemsVisible) {
          if (this.itemsVisible[index] === null) {
            delete this.itemsVisible[index];
            item = this.items[index];
            this.hideOrShowElement(item, true);
            item.style.position = 'absolute';
            item.style.zIndex = '';
          }
        }

        this.applySlideEffect();
      },
      next: function next(isAuto) {
        var status = false;

        if (this.items.length > 1) {
          if (isAuto !== true) {
            if (this.settings.autoPlay.stopOnNavigation) {
              this.stopAuto();
            }
          }

          if (!this.timerSwipe || this.swipeXAbs < this.settings.swipe.releaseRequiredSwipeX) {
            if (this.settings.loop || this.targetIndex < this.numItems - 1) {
              this.targetIndex++;
              this.targetVal = this.targetIndex;
              this.animateToTarget();
              status = true;
            } else if (!isAuto && this.settings.useNonLoopingHint) {
              this.targetVal = this.numItems - 1 + 0.05;
              this.animateToTarget();
              var that = this;
              this.timerNonLoopingHint = setTimeout(function () {
                that.targetVal = that.targetIndex;
                that.animateToTarget();
              }, 200);
            }
          }
        }

        return status;
      },
      previous: function previous(isAuto) {
        var status = false;

        if (this.items.length > 1) {
          if (isAuto !== true) {
            if (this.settings.autoPlay.stopOnNavigation) {
              this.stopAuto();
            }
          }

          if (!this.timerSwipe || this.swipeXAbs < this.settings.swipe.releaseRequiredSwipeX) {
            if (this.settings.loop || this.targetIndex > 0) {
              this.targetIndex--;
              this.targetVal = this.targetIndex;
              this.animateToTarget();
              status = true;
            } else if (!isAuto && this.settings.useNonLoopingHint) {
              this.targetVal = -0.05;
              this.animateToTarget();
              var that = this;
              this.timerNonLoopingHint = setTimeout(function () {
                that.targetVal = that.targetIndex;
                that.animateToTarget();
              }, 200);
            }
          }
        }

        return status;
      },
      onSwipePress: function onSwipePress(event) {
        if (this.items.length > 1) {
          var isTouch = event.type === 'touchstart';

          if (event.target.nodeName === 'A') {
            return;
          }

          var nativeEvent = event;

          if (nativeEvent.button !== undefined && nativeEvent.button === 2 || nativeEvent.which !== undefined && nativeEvent.which === 3) {
            return;
          }

          this.swipePressX = isTouch ? event.touches[0].clientX : event.clientX;
          this.swipeX = 0;
          this.swipeXAbs = 0;

          if (this.settings.swipe.pressMoveBeforeInvokeGrabbing) {
            document.addEventListener('touchmove', this.onSwipePressMove);
            document.addEventListener('mousemove', this.onSwipePressMove);
            document.addEventListener('touchend', this.clearSwipePressMove);
            document.addEventListener('mouseup', this.clearSwipePressMove);
          } else {
            this.onTimerSwipePress();
          }

          if (this.loop || this.targetIndexWithinBounds > 0 && this.targetIndexWithinBounds < this.numItems - 1) {
            event.stopPropagation();
          }
        }
      },
      onSwipePressMove: function onSwipePressMove() {
        this.clearSwipePressMove();
        this.onTimerSwipePress();
      },
      clearSwipePressMove: function clearSwipePressMove() {
        document.removeEventListener('touchmove', this.onSwipePressMove);
        document.removeEventListener('mousemove', this.onSwipePressMove);
        document.removeEventListener('touchend', this.clearSwipePressMove);
        document.removeEventListener('mouseup', this.clearSwipePressMove);
      },
      onTimerSwipePress: function onTimerSwipePress() {
        if (!this.settings.swipe.touchOnly) {
          this.container.style.cssText += '; cursor: -webkit-grabbing; cursor: grabbing;';
        }

        clearTimeout(this.timerNonLoopingHint);

        if (this.settings.autoPlay.stopOnNavigation) {
          this.pauseAuto();
        }

        if (this.timerAnimate) {
          cancelAnimationFrame(this.timerAnimate);
          this.timerAnimate = 0;
        }

        var step = 0;
        var stepAdd = this.step;

        for (var i = 0; i < 25; i++) {
          stepAdd *= this.settings.swipe.stepFactor;
          step += stepAdd;
        }

        this.swipePressPointerVal = this.pointerVal + step;
        this.swipeTargetVal = this.swipePressPointerVal;
        document.addEventListener('touchmove', this._onSwipeMove);
        document.addEventListener('touchend', this._onSwipeRelease);

        if (!this.settings.swipe.touchOnly) {
          document.addEventListener('mousemove', this._onSwipeMove);
          document.addEventListener('mouseup', this._onSwipeRelease);
        }

        this.startSwipeTimer();
      },
      onSwipeMove: function onSwipeMove(event) {
        if (event.tinSlideMoved === undefined) {
          var isTouch = event.type === 'touchmove';
          this.swipeIsTouch = isTouch;
          var containerWidth = this.getContainerWidth();

          if (containerWidth) {
            if (isTouch && event.target !== undefined && event.target !== this.container) {
              var t = event.target;

              if (t.scrollWidth > t.offsetWidth) {
                this.swipeScrollsElementCounter++;

                if (this.swipeScrollsElementCounter < 4 || t.scrollLeft > 0 && t.scrollLeft + t.offsetWidth < t.scrollWidth) {
                  event.tinSlideMoved = this;
                  return;
                }
              }
            }

            var currentX = isTouch ? event.touches[0].clientX : event.clientX;

            if (currentX === undefined) {
              return;
            }

            if (this.swipePressX === undefined) {
              this.swipePressX = currentX;
            }

            this.swipeX = this.swipePressX - currentX;
            this.swipeXAbs = this.swipeX < 0 ? -this.swipeX : this.swipeX;

            if (!this.swipePreventDefault) {
              if (this.swipeXAbs > 10) {
                this.swipePreventDefault = true;
              }
            }

            var swipeTargetVal = this.swipePressPointerVal + this.swipeX / containerWidth;

            if (!this.settings.loop) {
              var offset = this.settings.useNonLoopingHint ? 0.05 : 0;

              if (swipeTargetVal < -offset) {
                swipeTargetVal = -offset;
              } else if (swipeTargetVal > this.numItems - 1 + offset) {
                swipeTargetVal = this.numItems - 1 + offset;
              } else {
                event.tinSlideMoved = this;
              }
            } else {
              event.tinSlideMoved = this;
            }

            this.swipeTargetVal = swipeTargetVal;
            var targetIndexWithinBounds = Math.round(this.swipeTargetVal) % this.numItems;

            if (targetIndexWithinBounds < 0) {
              targetIndexWithinBounds += this.numItems;
            }

            this.targetIndexWithinBounds = targetIndexWithinBounds;
            this.updateDots();
          }
        }
      },
      onSwipeRelease: function onSwipeRelease(event) {
        document.removeEventListener('touchmove', this._onSwipeMove);
        document.removeEventListener('touchend', this._onSwipeRelease);

        if (!this.settings.swipe.touchOnly) {
          document.removeEventListener('mousemove', this._onSwipeMove);
          document.removeEventListener('mouseup', this._onSwipeRelease);
          this.container.style.cssText += '; cursor: -webkit-grab; cursor: grab;';
        }

        this.swipePreventDefault = false;
        this.swipeScrollsElementCounter = 0;

        if (this.swipeXAbs >= this.settings.swipe.releaseRequiredSwipeX) {
          var limit = 0.04;
          var targetIndex;

          if (this.step < -limit) {
            if (this.settings.autoPlay.stopOnNavigation) {
              this.stopAuto();
            }

            targetIndex = Math.floor(this.pointerVal);
          } else if (this.step > limit) {
            if (this.settings.autoPlay.stopOnNavigation) {
              this.stopAuto();
            }

            targetIndex = Math.ceil(this.pointerVal);
          } else {
            var step = this.step * 15;
            var stepAdd = this.step;

            for (var i = 0; i < 80; i++) {
              stepAdd *= this.settings.swipe.stepFactor;
              step += stepAdd;
            }

            if (step > 1) {
              step = 1;
            } else if (step < -1) {
              step = -1;
            }

            var targetVal = this.pointerVal + step;
            targetIndex = Math.round(targetVal);

            if (this.settings.autoPlay.stopOnNavigation) {
              if (targetIndex === this.targetIndex) {
                if (event.type === 'touchend') {
                  this.resumeAuto();
                }
              } else {
                this.stopAuto();
              }
            }
          }

          this.choke = 1;
          setTimeout(function () {
            if (this.timerSwipe) {
              cancelAnimationFrame(this.timerSwipe);
              this.timerSwipe = 0;
            }

            this.targetIndex = targetIndex;
            this.targetVal = this.targetIndex;
            this.animateToTarget();
          }.bind(this), 1);
        } else {
          cancelAnimationFrame(this.timerSwipe);
          this.timerSwipe = 0;

          if (event.type === 'touchend') {
            this.resumeAuto();
          }
        }
      },
      startSwipeTimer: function startSwipeTimer() {
        if (!this.timerSwipe) {
          this.timerSwipe = requestAnimationFrame(this._onTimerSwipe);
        }
      },
      onTimerSwipe: function onTimerSwipe() {
        var pointerVal = this.pointerVal;
        var diff = this.swipeTargetVal - pointerVal;
        var step = diff * (!this.swipeIsTouch ? this.settings.swipe.stepFactor : this.settings.swipe.stepFactorTouch);
        this.step = step;
        this.stepAbs = this.step < 0 ? -this.step : this.step;
        pointerVal += step;
        this.setPointer(pointerVal);
        this.timerSwipe = requestAnimationFrame(this._onTimerSwipe);
      },
      getContainerWidth: function getContainerWidth() {
        if (!this.containerWidth) {
          this.containerWidth = container.offsetWidth;
        }

        return this.containerWidth;
      },
      animateTo: function animateTo(index) {
        this.targetIndex = index % this.numItems;

        if (this.targetIndex < 0) {
          this.targetIndex += this.numItems;
        }

        this.targetIndexWithinBounds = this.targetIndex;
        this.updateDots();
        var pointerVal = this.pointerVal % this.numItems;

        if (this.settings.loop) {
          var diff = pointerVal - this.targetIndex;

          if (diff > this.numHalfItems) {
            pointerVal -= this.numItems;
          } else if (diff < -this.numHalfItems) {
            pointerVal += this.numItems;
          }
        }

        this.pointerVal = pointerVal;
        this.targetVal = this.targetIndex;
        this.animateToTarget();
      },
      animateToTarget: function animateToTarget() {
        clearTimeout(this.timerNonLoopingHint);
        var targetIndexWithinBounds = this.targetIndex % this.numItems;

        if (targetIndexWithinBounds < 0) {
          targetIndexWithinBounds += this.numItems;
        }

        this.targetIndexWithinBounds = targetIndexWithinBounds;
        this.updateDots();

        if (this.settings.useUpdateContainerHeight) {
          this.updateContainerHeight();
        }

        if (!this.timerAnimate) {
          this.timerAnimate = requestAnimationFrame(this._onAnimationTimer);
        }
      },
      onAnimationTimer: function onAnimationTimer() {
        var pointerVal = this.pointerVal;
        var diff = this.targetVal - pointerVal;
        var diffAbs = diff < 0 ? -diff : diff;

        if (diffAbs < this.settings.stepSnap) {
          this.step = this.stepAbs = 0;
          this.setPointer(this.targetVal);
          cancelAnimationFrame(this.timerAnimate);
          this.timerAnimate = 0;
        } else {
          var step = diff * this.settings.stepFactor;

          if (step * this.step >= 0) {
            this.step = diff * this.settings.stepFactor;

            if (this.choke < 1) {
              this.choke = this.choke * this.settings.chokeReleaseFactor + (this.choke || this.settings.chokeReleaseStep ? this.settings.chokeReleaseStep : 0.05);
            }

            if (this.choke > diffAbs) {
              this.choke = diffAbs * (0.5 + this.settings.chokeReturnFactor);
            }

            if (this.choke > 1) {
              this.choke = 1;
            }

            if (this.step > this.settings.stepMin || this.step < -this.settings.stepMin) {
              var stepMax = this.choke * this.settings.stepMax;

              if (this.step > stepMax) {
                this.step = stepMax;
              } else if (this.step < -stepMax) {
                this.step = -stepMax;
              }

              if (!(this.step > this.settings.stepMin || this.step < -this.settings.stepMin)) {
                this.step = this.settings.stepMin * (this.step < 0 ? -1 : 1);
              }
            }

            this.stepAbs = this.step < 0 ? -this.step : this.step;
            pointerVal += this.step;
          } else {
            step = this.step * (1 - this.settings.stepTurnBreakFactor);

            if (!(step > this.settings.stepSnap || step < -this.settings.stepSnap)) {
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
      goTo: function goTo(index) {
        clearTimeout(this.timerNonLoopingHint);

        if (this.settings.autoPlay.stopOnNavigation) {
          this.stopAuto();
        }

        if (this.timerAnimate) {
          cancelAnimationFrame(this.timerAnimate);
          this.timerAnimate = 0;
        }

        this.targetIndex = index % this.numItems;

        if (this.targetIndex < 0) {
          this.targetIndex += this.numItems;
        }

        this.targetIndexWithinBounds = this.targetIndex;
        this.updateDots();

        if (this.settings.useUpdateContainerHeight) {
          this.updateContainerHeight();
        }

        this.setPointer(this.targetIndexWithinBounds);
      },
      updateContainerHeight: function updateContainerHeight(fromSubSlideWithHeight) {
        var parentSlides;

        if (fromSubSlideWithHeight === undefined) {
          parentSlides = this.getParentSlides();

          if (parentSlides.length) {
            parentSlides[0].updateContainerHeight();
          } else {
            var subSlides = this.getSubSlides();

            if (subSlides.length) {
              subSlides[0].updateContainerHeightFromParent();
            } else {
              this.doUpdateContainerHeight();
            }
          }
        } else {
          this.doUpdateContainerHeight(fromSubSlideWithHeight);
          parentSlides = this.getParentSlides().reverse();

          if (parentSlides.length) {
            parentSlides[0].updateContainerHeight(this.containerHeight);
          }
        }
      },
      doUpdateContainerHeight: function doUpdateContainerHeight(minHeight) {
        var id = this.container.getAttribute('id');

        if (minHeight === undefined) {
          minHeight = 0;
        }

        var containerHeight = this.items[this.targetIndexWithinBounds].offsetHeight;

        if (!containerHeight) {
          this.items[this.targetIndexWithinBounds].style.display = 'block';
          containerHeight = this.items[this.targetIndexWithinBounds].offsetHeight;
        }

        if (containerHeight < minHeight) {
          containerHeight = minHeight;
        }

        if (containerHeight > 0 && this.containerHeight !== containerHeight) {
          this.containerHeight = containerHeight;
          this.css(this.container, {
            height: containerHeight + 'px'
          });
        }
      },
      updateContainerHeightFromParent: function updateContainerHeightFromParent() {
        this.updateContainerHeight(0);
      },
      getParentSlides: function getParentSlides() {
        var slides = [];

        function checkParentNode(element) {
          if (element.parentNode && element.parentNode !== undefined) {
            if (element.parentNode.tinSlide !== undefined) {
              slides.push(element.parentNode.tinSlide);
            }

            checkParentNode(element.parentNode);
          }
        }

        checkParentNode(this.container);
        return slides.reverse();
      },
      getSubSlides: function getSubSlides() {
        var slides = [];

        function checkChildNodes(element) {
          for (var i = 0, n = element.childNodes.length; i < n; i++) {
            if (element.childNodes[i].tinSlide !== undefined) {
              slides.push(element.childNodes[i].tinSlide);
              checkChildNodes(element.childNodes[i].tinSlide.getCurrentItem());
            } else {
              checkChildNodes(element.childNodes[i]);
            }
          }
        }

        checkChildNodes(this.items[this.targetIndexWithinBounds]);
        return slides.reverse();
      },
      applySlideEffect: function applySlideEffect() {
        for (var index in this.itemsVisible) {
          var item = this.items[index];
          var progress = this.itemsVisible[index];
          var progressAbs = progress < 0 ? -progress : progress;
          var transforms = [];

          if (this.settings.effects.slideHorizontal.on) {
            var translateXProgress = progress - this.translateXOffsetProgress;
            var translateX = this.settings.effects.slideHorizontal.offset * 100 * -translateXProgress + '%';
            var translateY = !this.settings.verticallyCenter ? 0 : '-50%';
            transforms.push('translate3d(' + translateX + ', ' + translateY + ', 0)');

            if (translateXProgress > 0.75 || translateXProgress < -(this.settings.effects.slideHorizontal.numVisible - 0.25)) {
              if (this.itemsOutside[index] === undefined) {
                this.itemsOutside[index] = item;
                this.addClass(item, 'tin-slide-outside');
              }
            } else {
              if (this.itemsOutside[index] !== undefined) {
                delete this.itemsOutside[index];
                this.removeClass(item, 'tin-slide-outside');
              }
            }
          }

          if (this.settings.effects.scale.on) {
            var scale;

            if (progressAbs < this.settings.effects.scale.maxAt) {
              scale = this.settings.effects.scale.max;
            } else if (progressAbs < this.settings.effects.scale.minAt) {
              var scaleFactor = 1 - (progressAbs - this.settings.effects.scale.maxAt) / (this.settings.effects.scale.minAt - this.settings.effects.scale.maxAt);
              scale = this.settings.effects.scale.min + scaleFactor * (this.settings.effects.scale.max - this.settings.effects.scale.min);
            } else {
              scale = this.settings.effects.scale.min;
            }

            transforms.push('scale(' + scale + ', ' + scale + ')');
          }

          if (transforms.length) {
            item.style.transform = transforms.join(' ');
          } else if (item.style.transform !== '') {
            item.style.transform = '';
          }

          if (this.settings.effects.fade.on) {
            var opacity;

            if (progressAbs < this.settings.effects.fade.maxAt) {
              opacity = this.settings.effects.fade.max;
            } else if (progressAbs < this.settings.effects.fade.minAt) {
              var opacityFactor = 1 - (progressAbs - this.settings.effects.fade.maxAt) / (this.settings.effects.fade.minAt - this.settings.effects.fade.maxAt);
              opacity = this.settings.effects.fade.min + opacityFactor * (this.settings.effects.fade.max - this.settings.effects.fade.min);
            } else {
              opacity = this.settings.effects.fade.min;
            }

            item.style.opacity = opacity;
          } else if (item.style.opacity !== '') {
            item.style.opacity = '';
          }
        }

        if (this.settings.effects.motionBlur.on) {
          this.applyBlur();
        }
      },
      applyBlur: function applyBlur() {
        var blurFactor = this.stepAbs - this.settings.effects.motionBlur.stepMin;

        if (blurFactor < 0) {
          blurFactor = 0;
        }

        var blur = blurFactor * this.settings.effects.motionBlur.factor;

        if (blur > this.settings.effects.motionBlur.maxPixels) {
          blur = this.settings.effects.motionBlur.maxPixels;
        }

        var cssBlur = blur ? 'blur(' + blur + 'px)' : '';

        for (var index in this.itemsVisible) {
          this.items[index].style.filter = cssBlur;
        }
      },
      updateDots: function updateDots() {
        if (this.dots && this.currentDotIndex !== this.targetIndexWithinBounds) {
          var dot;

          if (this.currentDotIndex !== null) {
            dot = this.dotsItems[this.currentDotIndex];

            if (dot) {
              this.removeClass(dot, 'on');
            }
          }

          this.currentDotIndex = this.targetIndexWithinBounds;
          dot = this.dotsItems[this.currentDotIndex];

          if (dot) {
            this.addClass(dot, 'on');
          }
        }
      },
      onDotClick: function onDotClick(event) {
        if (this.settings.autoPlay.stopOnNavigation) {
          this.stopAuto();
        }

        var index = parseInt(event.target.getAttribute('tin-slide-index'), 10);
        this.animateTo(index);
      },
      startAuto: function startAuto() {
        if (this.autoPlayState === 'stopped') {
          return;
        }

        if (this.autoPlayState !== 'started') {
          this.autoPlayState = 'started';
          this.resumeAuto();
        }
      },
      pauseAuto: function pauseAuto() {
        if (this.autoPlayState === 'stopped') {
          return;
        }

        if (this.autoPlayState) {
          this.autoPlayState = 'paused';
          clearInterval(this.timerAutoPlay);
          this.timerAutoPlay = 0;
        }
      },
      resumeAuto: function resumeAuto() {
        if (this.autoPlayState === 'stopped') {
          return;
        }

        if (this.autoPlayState) {
          this.autoPlayState = 'started';
          clearInterval(this.timerAutoPlay);
          this.timerAutoPlay = setInterval(function () {
            if (!this.timerSwipe && this.container.clientHeight && !this.hasClass(this.container, 'window-hidden')) {
              var status = this.autoPlayForwards ? this.next(true) : this.previous(true);

              if (!status) {
                this.autoPlayForwards = !this.autoPlayForwards;
                status = this.autoPlayForwards ? this.next(true) : this.previous(true);
              }
            }
          }.bind(this), this.settings.autoPlay.time);
        }
      },
      stopAuto: function stopAuto() {
        if (this.autoPlayState === 'stopped') {
          return;
        }

        if (this.autoPlayState) {
          this.pauseAuto();
          this.autoPlayState = 'stopped';
        }
      },
      imageLoaded: function imageLoaded(event) {
        if (this.settings.useUpdateContainerHeight) {
          this.updateContainerHeight();
        }
      }
    };
    var events = {};
    tinSlide = {
      next: function next(index) {
        logic.next();
      },
      previous: function previous(index) {
        logic.previous();
      },
      animateTo: function animateTo(index) {
        logic.animateTo(index);
      },
      goTo: function goTo(index) {
        logic.goTo(index);
      },
      getDots: function getDots() {
        return logic.dots ? logic.dots : logic.createDots();
      },
      getNav: function getNav() {
        return logic.nav ? logic.nav : logic.createNav();
      },
      startAuto: function startAuto() {
        logic.startAuto();
      },
      stopAuto: function stopAuto() {
        logic.stopAuto();
      },
      updateContainerHeight: function updateContainerHeight(fromSubSlideWithHeight) {
        logic.updateContainerHeight(fromSubSlideWithHeight);
      },
      updateContainerHeightFromParent: function updateContainerHeightFromParent() {
        logic.updateContainerHeightFromParent();
      },
      getCurrentItem: function getCurrentItem() {
        return logic.items[logic.targetIndexWithinBounds];
      },
      on: function on(eventType, listener) {
        if (_typeof(events[eventType]) !== 'object') {
          events[eventType] = [];
        }

        events[eventType].push(listener);
      },
      removeListener: function removeListener(eventType, listener) {
        var idx;

        if (_typeof(events[eventType]) === 'object') {
          idx = events[eventType].indexOf(listener);

          if (idx > -1) {
            events[eventType].splice(idx, 1);
          }
        }
      },
      emit: function emit(eventType, event) {
        var i,
            listeners,
            len,
            args = [].slice.call(arguments, 1);

        if (_typeof(events[eventType]) === 'object') {
          listeners = events[eventType].slice();
          len = listeners.length;

          for (i = 0; i < len; i++) {
            listeners[i].apply(this, args);
          }
        }
      }
    };
    logic.init(container, options);

    document.ondragstart = function () {
      return false;
    };

    var documentHiddenName = null;

    function onVisibilityChange(event) {
      var v = "visible",
          h = "hidden";
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

      if (event.type in eventMap) {
        isHidden = eventMap[event.type] === 'hidden';
      } else {
        isHidden = document[documentHiddenName] ? true : false;
      }

      if (isHidden) {
        logic.addClass(logic.container, 'window-hidden');
      } else {
        logic.removeClass(logic.container, 'window-hidden');
      }
    }

    if ("hidden" in document) {
      documentHiddenName = "hidden";
      document.addEventListener("visibilitychange", onVisibilityChange);
    } else if ("mozHidden" in document) {
      documentHiddenName = "mozHidden";
      document.addEventListener("mozvisibilitychange", onVisibilityChange);
    } else if ("webkitHidden" in document) {
      documentHiddenName = "webkitHidden";
      document.addEventListener("webkitvisibilitychange", onVisibilityChange);
    } else if ("msHidden" in document) {
      documentHiddenName = "msHidden";
      document.addEventListener("msvisibilitychange", onVisibilityChange);
    } else if ("onfocusin" in document) {
      document.onfocusin = document.onfocusout = onVisibilityChange;
    } else {
      window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onVisibilityChange;
    }

    if (documentHiddenName && document[documentHiddenName] !== undefined) {
      onVisibilityChange({
        type: document[documentHiddenName] ? "blur" : "focus"
      });
    }

    container.tinSlide = tinSlide;
    return tinSlide;
  }

  ;

  (function (constructor) {
    if (constructor && constructor.prototype && constructor.prototype.firstElementChild == null) {
      Object.defineProperty(constructor.prototype, 'firstElementChild', {
        get: function get() {
          var nodes = this.childNodes,
              i = 0;
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

  window.requestAnimFrame = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  }();

  return TinSlide$;
});
//# sourceMappingURL=tin-slide.js.map