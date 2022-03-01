!function(t,e){"use strict";"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.TinSlide=e()}(this,(function(){"use strict";var t;return(t=window.Node||window.Element)&&t.prototype&&null==t.prototype.firstElementChild&&Object.defineProperty(t.prototype,"firstElementChild",{get:function(){for(var t=this.childNodes,e=0,i=t[e++];i;){if(1===i.nodeType)return i;i=t[e++]}return null}}),window.requestAnimFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(t){window.setTimeout(t,1e3/60)},function(t,e){var i,s;s={defaultSettings:{debug:!1,effects:{slideHorizontal:{on:!0,offset:1,numVisible:1,centerSelected:!1},scale:{on:!1,min:.8,max:1,minAt:1,maxAt:0},fade:{on:!1,min:0,max:1,minAt:1,maxAt:0},motionBlur:{on:!1,maxPixels:2,stepMin:.05,factor:500}},useUpdateContainerHeight:!1,verticallyCenter:!1,useContainerClickNextPrev:!1,swipe:{on:!0,touchOnly:!1,stepFactor:.25,stepFactorTouch:.75,pressMoveBeforeInvokeGrabbing:!1,releaseRequiredSwipeX:0},generate:{dots:{on:!0,afterContainer:!0},nav:{on:!0,afterContainer:!0},styles:{on:!0,containerParentPosition:"relative"}},ratio:null,hasHeight:!1,autoPlay:{on:!1,time:5e3,pauseOnHover:!0,stopOnNavigation:!0},loop:!0,useNonLoopingHint:!0,cropContainer:!0,zIndex:0,hideItems:!0,hideUsingVisibility:!1,moveSelectedItem:!1,stepSnap:3e-4,stepFactor:.2,stepMax:.2,stepMin:4e-4,stepTurnBreakFactor:.5,chokeReleaseStep:.05,chokeReleaseFactor:1.5,chokeReturnFactor:2},settings:{},container:null,containerWidth:0,items:[],numItems:0,numHalfItems:0,pointer:0,pointerVal:0,selectedItem:null,numItemsInside:1,itemsVisible:{},itemsOutside:{},targetVal:0,targetIndex:0,targetIndexWithinBounds:0,timerAnimate:0,step:0,stepAbs:0,choke:0,containerHeight:0,timerUpdateContainerHeight:0,swipePressX:0,timerSwipePress:0,swipePressPointerVal:0,swipeTargetVal:0,timerSwipe:0,swipeX:0,swipeXAbs:0,swipePreventDefault:!1,swipeIsTouch:!1,swipeScrollsElementCounter:0,dotsItems:null,currentDotIndex:null,nav:null,ratioPercent:null,timerAutoPlay:0,autoPlayState:null,autoPlayForwards:!0,timerNonLoopingHint:0,translateXOffsetProgress:0,style:null,breakPoints:[],currentBreakPoint:{},init:function(t,e){var i,s,n,o,r,a;this.onSwipePressMove=this.onSwipePressMove.bind(this),this.clearSwipePressMove=this.clearSwipePressMove.bind(this),this.container=t,this.body=document.getElementsByTagName("body")[0];var h=t.getElementsByClassName("tin-slide-img"),l=[];for(s=0,n=h.length;s<n;s++)l.push(h[s]);for(;l.length;){r=l.shift();var d=document.createElement("img");(a=r.getAttribute("data-src"))&&void 0!==a&&""!==a&&d.setAttribute("src",a);var u=r.getAttribute("data-srcset");u&&void 0!==u&&""!==u&&d.setAttribute("srcset",u);var c=r.getAttribute("data-bg");c&&void 0!==c&&""!==c&&d.setAttribute("style",'background: url("'+c+'") no-repeat center; background-size: cover;'),r.parentNode.replaceChild(d,r)}var p=t.getElementsByClassName("tin-slide-bg"),m=[];for(s=0,n=p.length;s<n;s++)m.push(p[s]);for(;m.length;)(a=(r=m.shift()).getAttribute("data-bg"))&&void 0!==a&&""!==a&&r.setAttribute("style",'background: url("'+a+'") no-repeat center; background-size: cover;');var g=t.getElementsByClassName("tin-slide-markup"),f=[];for(s=0,n=g.length;s<n;s++)f.push(g[s]);for(;f.length;){r=f.shift();var v=document.createElement("div");v.innerHTML=r.getAttribute("data-markup"),r.parentNode.replaceChild(v.firstElementChild,r)}var b=[];for(s=0,n=this.container.childNodes.length;s<n;s++)(i=this.container.childNodes[s]).nodeType===Node.ELEMENT_NODE&&b.push(i);for(this.items=b,this.numItems=this.items.length,this.numHalfItems=this.numItems/2,s=0;s<this.numItems;s++)(i=this.items[s]).tinSlideIndex=s,i.style.position="absolute",this.hideOrShowElement(i,!0);if(this._onAnimationTimer=this.onAnimationTimer.bind(this),this._onSwipePress=this.onSwipePress.bind(this),this._onSwipeRelease=this.onSwipeRelease.bind(this),this._onSwipeMove=this.onSwipeMove.bind(this),this._onTimerSwipe=this.onTimerSwipe.bind(this),this._pauseAuto=this.pauseAuto.bind(this),this._resumeAuto=this.resumeAuto.bind(this),this._imageLoaded=this.imageLoaded.bind(this),this._updateContainerHeight=this.updateContainerHeight.bind(this),void 0!==e&&(this.setOptions(this.defaultSettings,e),void 0!==e.breakPoints)){for(o in e.breakPoints){var w=parseInt(o,10);isNaN(w)||this.breakPoints.push({width:w,options:e.breakPoints[o]})}this.breakPoints.sort((function(t,e){return t.width-e.width}));var y={};for(s=0;s<this.breakPoints.length;s++)this.mergeObjects(y,this.breakPoints[s].options),this.breakPoints[s].options=this.cloneObject(y,{})}for(t.style.position="relative",this.updateBreakPoint(),s=0;s<this.numItems;s++)(i=this.items[s]).removeAttribute("tin-slide-cloak");t.removeAttribute("tin-slide-cloak");var x=this.container.querySelectorAll("img");for(s=0;s<x.length;s++)x[s].addEventListener("load",this._imageLoaded);window.addEventListener("resize",function(){this.containerWidth=0,this.updateBreakPoint()}.bind(this)),document.addEventListener("touchmove",function(t){this.swipePreventDefault&&t.preventDefault()}.bind(this),{passive:!1})},updateBreakPoint:function(){var t=this.getBreakPoint();t!==this.currentBreakPoint&&(this.currentBreakPoint=t,t?(this.container.setAttribute("tin-slide-break-point",t.width),this.initSettings(t.options)):(this.container.removeAttribute("tin-slide-break-point"),this.initSettings()))},getBreakPoint:function(){var t,e,i=null,s=this.getContainerWidth();for(t=0,e=this.breakPoints.length;t<e&&s>=this.breakPoints[t].width;t++)i=this.breakPoints[t];return i},initSettings:function(t){if(void 0===t)this.settings=this.defaultSettings;else{var e=this.cloneObject(this.defaultSettings,{});this.setOptions(e,t),this.settings=e}var i,s;for(i=0;i<this.numItems;i++)(s=this.items[i]).style.top=this.settings.verticallyCenter?"50%":"0",s.style.left="0",s.style.width=(this.settings.effects.slideHorizontal.on?100/this.settings.effects.slideHorizontal.numVisible:100)+"%";if(this.settings.cropContainer?this.container.style.overflow="hidden":"hidden"===this.container.style.overflow&&(this.container.style.overflow=""),this.settings.ratio?(this.settings.ratioPercent=1/this.settings.ratio*100,this.container.style.paddingTop=this.settings.ratioPercent+"%"):""!==this.container.style.paddingTop&&(this.container.style.paddingTop=""),this.settings.zIndex?this.container.style.zIndex=this.settings.zIndex:""!==this.container.style.zIndex&&(this.container.style.zIndex=""),this.settings.useContainerClickNextPrev&&this.container.addEventListener("mouseup",function(t){var e=this.getContainerWidth();e&&(t.layerX-this.container.offsetLeft<e/2?this.previous():this.next())}.bind(this)),this.items.length>1&&(this.setSwipeStyles(),this.container.removeEventListener("touchstart",this._onSwipePress),this.container.removeEventListener("mousedown",this._onSwipePress),this.settings.swipe.on&&(this.container.addEventListener("touchstart",this._onSwipePress),this.settings.swipe.touchOnly||this.container.addEventListener("mousedown",this._onSwipePress))),window.removeEventListener("resize",this._updateContainerHeight),this.settings.useUpdateContainerHeight?(this.updateContainerHeight(),window.addEventListener("resize",this._updateContainerHeight)):this.container.style.height="",this.numItemsInside=1,this.translateXOffsetProgress=0,this.settings.effects.slideHorizontal.on&&this.settings.effects.slideHorizontal.numVisible>1&&(this.numItemsInside=this.settings.effects.slideHorizontal.numVisible,this.settings.effects.slideHorizontal.centerSelected&&(this.translateXOffsetProgress=.5*(this.settings.effects.slideHorizontal.numVisible-1))),this.items.length>1)if(this.settings.generate.dots.on?(this.dots||(this.dots=this.createDots()),this.container.parentNode.insertBefore(this.dots,this.settings.generate.dots.afterContainer?this.container.nextSibling:this.container)):this.dots&&this.dots.parentNode&&this.dots.parentNode.removeChild(this.dots),this.settings.generate.nav.on?(this.nav||(this.nav=this.createNav()),this.container.parentNode.insertBefore(this.nav,this.settings.generate.nav.afterContainer?this.container.nextSibling:this.container)):this.nav&&this.nav.parentNode&&this.nav.parentNode.removeChild(this.nav),this.settings.generate.styles.on){this.settings.generate.styles.containerParentPosition&&(this.container.parentNode.style.position=this.settings.generate.styles.containerParentPosition),this.style||(this.style=this.createStyles());var n=document.getElementsByTagName("head")[0];n.insertBefore(this.style,n.firstChild)}else this.style&&this.style.parentNode&&this.style.parentNode.removeChild(this.style);if(this.items.length>1){var o=[this.container];for(this.dots&&o.push(this.dots),this.nav&&o.push(this.nav),i=0;i<o.length;i++)o[i].removeEventListener("mouseenter",this._pauseAuto),o[i].removeEventListener("mouseleave",this._resumeAuto);if(this.pauseAuto(),this.settings.autoPlay.on&&(this.startAuto(),this.settings.autoPlay.pauseOnHover))for(i=0;i<o.length;i++)o[i].addEventListener("mouseenter",this._pauseAuto),o[i].addEventListener("mouseleave",this._resumeAuto)}this.selectedItem=null,this.setPointer(this.pointerVal),this.updateDots()},setSwipeStyles:function(){var t,e,i,s={"user-drag":"none","user-select":"none","-moz-user-select":"none","-webkit-user-drag":"none","-webkit-user-select":"none","-ms-user-select":"none"},n={};for(var o in s)n[o]=s[o];for(n["pointer-events"]="none",t=0;t<this.numItems;t++){this.settings.swipe.on?this.css(this.items[t],s):this.removeCss(this.items[t],s);var r=this.items[t].getElementsByTagName("img");for(e=r.length,i=0;i<e;i++)this.settings.swipe.on?this.css(r[i],n):this.removeCss(r[i],n)}this.settings.swipe.on&&!this.settings.swipe.touchOnly?this.container.style.cssText+="; cursor: -webkit-grab; cursor: grab;":this.removeCss(this.container,["cursor"])},css:function(t,e){for(var i in e)t.style[i]=e[i]},removeCss:function(t,e){if(Array.isArray(e))for(var i=0;i<e.length;i++)t.style[e[i]]="";else for(var s in e)t.style[s]=""},addClass:function(t,e){var i=t.className.split(" ");-1===i.indexOf(e)&&i.push(e),t.className=i.join(" ")},removeClass:function(t,e){var i=t.className.split(" "),s=i.indexOf(e);-1!==s&&(i.splice(s,1),t.className=i.join(" "))},hasClass:function(t,e){return t.className.split(" ").indexOf(e)>-1},hideOrShowElement:function(t,e){this.settings.hideUsingVisibility?t.style.visibility=e?"hidden":"visible":t.style.display=e?"none":"block"},setOptions:function(t,e){for(var i in e){var s=typeof t[i];s!==typeof e[i]&&null!==t[i]||("object"===s&&null!==t[i]?this.setOptions(t[i],e[i]):t[i]=e[i])}},cloneObject:function(t,e){var i,s;if(Array.isArray(t))for(s=0;s<t.length;s++)"object"==typeof t[s]&&null!==settings[s]?(e.push(Array.isArray(t[i])?[]:{}),this.cloneObject(t[s],e[s])):e.push(t[s]);else for(i in t)"object"==typeof t[i]&&null!==t[i]?(e[i]=Array.isArray(t[i])?[]:{},this.cloneObject(t[i],e[i])):e[i]=t[i];return e},mergeObjects:function(t,e){var i;for(i in e)"object"!=typeof e[i]||null===e[i]||Array.isArray(e[i])?t[i]=e[i]:(("object"!=typeof t[i]||null===t[i]||Array.isArray(t[i]))&&(t[i]={}),this.mergeObjects(t[i],e[i]));return t},createDots:function(){var t=this,e=document.createElement("UL");e.setAttribute("class","tin-slide-dots");var i=function(e){t.onDotClick(e)};this.dotsItems=[];for(var s=0;s<this.numItems;s++){var n=document.createElement("LI");n.setAttribute("class","tin-slide-dot-"+s),n.setAttribute("tin-slide-index",s),n.style.cursor="pointer",e.appendChild(n),this.dotsItems.push(n),n.addEventListener("click",i)}return e},createNav:function(){var t=document.createElement("NAV");t.setAttribute("class","tin-slide-next-prev");var e=document.createElement("DIV");e.setAttribute("class","tin-slide-prev"),e.style.cursor="pointer",e.addEventListener("mousedown",(function(t){t.preventDefault()})),e.addEventListener("click",function(t){this.previous()}.bind(this)),t.appendChild(e);var i=document.createElement("DIV");return i.setAttribute("class","tin-slide-next"),i.style.cursor="pointer",i.addEventListener("mousedown",(function(t){t.preventDefault()})),i.addEventListener("click",function(t){this.next()}.bind(this)),t.appendChild(i),t},createStyles:function(){var t=[];t.push(".tin-slide-prev, .tin-slide-next {position: absolute;left: 10px;top: 50%;}"),t.push(".tin-slide-prev:before, .tin-slide-prev:after, .tin-slide-next:before, .tin-slide-next:after {content: '';display: block;width: 0;height: 0;position: absolute;top: 0;-webkit-transform: translateY(-50%);-ms-transform: translateY(-50%);-o-transform: translateY(-50%);transform: translateY(-50%);}"),t.push(".tin-slide-prev:before, .tin-slide-next:before {opacity: 0.1;-webkit-transition: opacity 200ms cubic-bezier(0.48, 0.01, 0.21, 1);-o-transition: opacity 200ms cubic-bezier(0.48, 0.01, 0.21, 1);transition: opacity 200ms cubic-bezier(0.48, 0.01, 0.21, 1);}"),t.push(".tin-slide-prev:hover:before, .tin-slide-next:hover:before {opacity: 0;}"),t.push(".tin-slide-prev:before {left: 0;border-top: 23px solid transparent;border-bottom: 23px solid transparent;border-right: 41px solid black;margin-left: -4px;}"),t.push(".tin-slide-prev:after {left: 0;border-top: 20px solid transparent;border-bottom: 20px solid transparent;border-right: 35px solid rgba(255, 255, 255, 0.4);-webkit-transition: border-right-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);-o-transition: border-right-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);transition: border-right-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);}"),t.push(".tin-slide-prev:hover:after {border-right-color: white;}"),t.push(".tin-slide-next {left: inherit;right: 10px;}"),t.push(".tin-slide-next:before {right: 0;border-top: 23px solid transparent;border-bottom: 23px solid transparent;border-left: 41px solid black;margin-right: -4px;}"),t.push(".tin-slide-next:after {right: 0;border-top: 20px solid transparent;border-bottom: 20px solid transparent;border-left: 35px solid rgba(255, 255, 255, 0.4);-webkit-transition: border-left-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);-o-transition: border-left-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);transition: border-left-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);}"),t.push(".tin-slide-next:hover:after {border-left-color: white;}"),t.push(".tin-slide-dots {position: absolute;bottom: 10px;left: 50%;-webkit-transform: translateX(-50%);-ms-transform: translateX(-50%);-o-transform: translateX(-50%);transform: translateX(-50%);}"),t.push(".tin-slide-dots li {-webkit-box-sizing: border-box;box-sizing: border-box;display: inline-block;width: 16px;height: 16px;border-radius: 8px;background-color: transparent;border: 2px solid white;margin-right: 5px;opacity: 0.9;-webkit-box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);-webkit-transition: background-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);-o-transition: background-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);transition: background-color 200ms cubic-bezier(0.48, 0.01, 0.21, 1);}"),t.push(".tin-slide-dots li:hover {background-color: rgba(255, 255, 255, 0.5);}"),t.push(".tin-slide-dots li.on {background-color: white; }"),t.push(".tin-slide-outside {pointer-events: none;}");var e=document.createElement("STYLE");return e.innerHTML=t.join("\n"),e},setPointer:function(t){var e,s;this.pointerVal=t;var n=t%this.numItems;n<0&&this.settings.loop&&(n+=this.numItems),this.pointer=n;var o,r=[];if(this.settings.hideItems){var a=n-this.translateXOffsetProgress;a<0&&this.settings.loop&&(a+=this.numItems);var h=Math.floor(a);for(h>=0&&r.push(this.items[h]),e=1;e<=this.numItemsInside-(a===h?1:0);e++){var l=h+e;this.settings.loop&&(l%=this.numItems),l<this.items.length&&-1===r.indexOf(this.items[l])&&r.push(this.items[l])}}else for(e=0;e<this.numItems;e++)r.push(this.items[e]);for(s in this.itemsVisible)this.itemsVisible[s]=null;var d=r.length,u=!1;for(e=0;e<d;e++){o=r[e],void 0===this.itemsVisible[o.tinSlideIndex]&&this.hideOrShowElement(o,!1);var c=this.pointer-o.tinSlideIndex;this.translateXOffsetProgress?c>this.numHalfItems?c-=this.numItems:c<-this.numHalfItems&&(c+=this.numItems):c>1&&(c-=this.numItems),this.itemsVisible[o.tinSlideIndex]=c,c>.5||c<-.5||u?(o.style.position="absolute",o.style.zIndex=""):(u=!0,this.selectedItem!==o&&(this.selectedItem&&this.removeClass(this.selectedItem,"tin-slide-selected"),this.selectedItem=o,this.addClass(o,"tin-slide-selected"),this.settings.useUpdateContainerHeight||this.settings.ratio||this.settings.hasHeight||(o.style.position="relative"),this.settings.zIndex&&(o.style.zIndex=this.settings.zIndex),this.settings.moveSelectedItem&&(this.container.removeChild(o),this.container.appendChild(o)),i.emit("itemSelected",{index:o.tinSlideIndex,item:o})))}for(s in this.itemsVisible)null===this.itemsVisible[s]&&(delete this.itemsVisible[s],o=this.items[s],this.hideOrShowElement(o,!0),o.style.position="absolute",o.style.zIndex="");this.applySlideEffect()},next:function(t){var e=!1;if(this.items.length>1&&(!0!==t&&this.settings.autoPlay.stopOnNavigation&&this.stopAuto(),!this.timerSwipe||this.swipeXAbs<this.settings.swipe.releaseRequiredSwipeX))if(this.settings.loop||this.targetIndex<this.numItems-1)this.targetIndex++,this.targetVal=this.targetIndex,this.animateToTarget(),e=!0;else if(!t&&this.settings.useNonLoopingHint){this.targetVal=this.numItems-1+.05,this.animateToTarget();var i=this;this.timerNonLoopingHint=setTimeout((function(){i.targetVal=i.targetIndex,i.animateToTarget()}),200)}return e},previous:function(t){var e=!1;if(this.items.length>1&&(!0!==t&&this.settings.autoPlay.stopOnNavigation&&this.stopAuto(),!this.timerSwipe||this.swipeXAbs<this.settings.swipe.releaseRequiredSwipeX))if(this.settings.loop||this.targetIndex>0)this.targetIndex--,this.targetVal=this.targetIndex,this.animateToTarget(),e=!0;else if(!t&&this.settings.useNonLoopingHint){this.targetVal=-.05,this.animateToTarget();var i=this;this.timerNonLoopingHint=setTimeout((function(){i.targetVal=i.targetIndex,i.animateToTarget()}),200)}return e},onSwipePress:function(t){if(this.items.length>1){var e="touchstart"===t.type;if("A"===t.target.nodeName)return;var i=t;if(void 0!==i.button&&2===i.button||void 0!==i.which&&3===i.which)return;this.swipePressX=e?t.touches[0].clientX:t.clientX,this.swipeX=0,this.swipeXAbs=0,this.settings.swipe.pressMoveBeforeInvokeGrabbing?(document.addEventListener("touchmove",this.onSwipePressMove),document.addEventListener("mousemove",this.onSwipePressMove),document.addEventListener("touchend",this.clearSwipePressMove),document.addEventListener("mouseup",this.clearSwipePressMove)):this.onTimerSwipePress(),(this.loop||this.targetIndexWithinBounds>0&&this.targetIndexWithinBounds<this.numItems-1)&&t.stopPropagation()}},onSwipePressMove:function(){this.clearSwipePressMove(),this.onTimerSwipePress()},clearSwipePressMove:function(){document.removeEventListener("touchmove",this.onSwipePressMove),document.removeEventListener("mousemove",this.onSwipePressMove),document.removeEventListener("touchend",this.clearSwipePressMove),document.removeEventListener("mouseup",this.clearSwipePressMove)},onTimerSwipePress:function(){this.settings.swipe.touchOnly||(this.container.style.cssText+="; cursor: -webkit-grabbing; cursor: grabbing;"),clearTimeout(this.timerNonLoopingHint),this.settings.autoPlay.stopOnNavigation&&this.pauseAuto(),this.timerAnimate&&(cancelAnimationFrame(this.timerAnimate),this.timerAnimate=0);for(var t=0,e=this.step,i=0;i<25;i++)t+=e*=this.settings.swipe.stepFactor;this.swipePressPointerVal=this.pointerVal+t,this.swipeTargetVal=this.swipePressPointerVal,document.addEventListener("touchmove",this._onSwipeMove),document.addEventListener("touchend",this._onSwipeRelease),this.settings.swipe.touchOnly||(document.addEventListener("mousemove",this._onSwipeMove),document.addEventListener("mouseup",this._onSwipeRelease)),this.startSwipeTimer()},onSwipeMove:function(t){if(void 0===t.tinSlideMoved){var e="touchmove"===t.type;this.swipeIsTouch=e;var i=this.getContainerWidth();if(i){if(e&&void 0!==t.target&&t.target!==this.container){var s=t.target;if(s.scrollWidth>s.offsetWidth&&(this.swipeScrollsElementCounter++,this.swipeScrollsElementCounter<4||s.scrollLeft>0&&s.scrollLeft+s.offsetWidth<s.scrollWidth))return void(t.tinSlideMoved=this)}var n=e?t.touches[0].clientX:t.clientX;if(void 0===n)return;void 0===this.swipePressX&&(this.swipePressX=n),this.swipeX=this.swipePressX-n,this.swipeXAbs=this.swipeX<0?-this.swipeX:this.swipeX,this.swipePreventDefault||this.swipeXAbs>10&&(this.swipePreventDefault=!0);var o=this.swipePressPointerVal+this.swipeX/i;if(this.settings.loop)t.tinSlideMoved=this;else{var r=this.settings.useNonLoopingHint?.05:0;o<-r?o=-r:o>this.numItems-1+r?o=this.numItems-1+r:t.tinSlideMoved=this}this.swipeTargetVal=o;var a=Math.round(this.swipeTargetVal)%this.numItems;a<0&&(a+=this.numItems),this.targetIndexWithinBounds=a,this.updateDots()}}},onSwipeRelease:function(t){if(document.removeEventListener("touchmove",this._onSwipeMove),document.removeEventListener("touchend",this._onSwipeRelease),this.settings.swipe.touchOnly||(document.removeEventListener("mousemove",this._onSwipeMove),document.removeEventListener("mouseup",this._onSwipeRelease),this.container.style.cssText+="; cursor: -webkit-grab; cursor: grab;"),this.swipePreventDefault=!1,this.swipeScrollsElementCounter=0,this.swipeXAbs>=this.settings.swipe.releaseRequiredSwipeX){var e;if(this.step<-.04)this.settings.autoPlay.stopOnNavigation&&this.stopAuto(),e=Math.floor(this.pointerVal);else if(this.step>.04)this.settings.autoPlay.stopOnNavigation&&this.stopAuto(),e=Math.ceil(this.pointerVal);else{for(var i=15*this.step,s=this.step,n=0;n<80;n++)i+=s*=this.settings.swipe.stepFactor;i>1?i=1:i<-1&&(i=-1);var o=this.pointerVal+i;e=Math.round(o),this.settings.autoPlay.stopOnNavigation&&(e===this.targetIndex?"touchend"===t.type&&this.resumeAuto():this.stopAuto())}this.choke=1,setTimeout(function(){this.timerSwipe&&(cancelAnimationFrame(this.timerSwipe),this.timerSwipe=0),this.targetIndex=e,this.targetVal=this.targetIndex,this.animateToTarget()}.bind(this),1)}else cancelAnimationFrame(this.timerSwipe),this.timerSwipe=0,"touchend"===t.type&&this.resumeAuto()},startSwipeTimer:function(){this.timerSwipe||(this.timerSwipe=requestAnimationFrame(this._onTimerSwipe))},onTimerSwipe:function(){var t=this.pointerVal,e=(this.swipeTargetVal-t)*(this.swipeIsTouch?this.settings.swipe.stepFactorTouch:this.settings.swipe.stepFactor);this.step=e,this.stepAbs=this.step<0?-this.step:this.step,t+=e,this.setPointer(t),this.timerSwipe=requestAnimationFrame(this._onTimerSwipe)},getContainerWidth:function(){return this.containerWidth||(this.containerWidth=t.offsetWidth),this.containerWidth},animateTo:function(t){this.targetIndex=t%this.numItems,this.targetIndex<0&&(this.targetIndex+=this.numItems),this.targetIndexWithinBounds=this.targetIndex,this.updateDots();var e=this.pointerVal%this.numItems;if(this.settings.loop){var i=e-this.targetIndex;i>this.numHalfItems?e-=this.numItems:i<-this.numHalfItems&&(e+=this.numItems)}this.pointerVal=e,this.targetVal=this.targetIndex,this.animateToTarget()},animateToTarget:function(){clearTimeout(this.timerNonLoopingHint);var t=this.targetIndex%this.numItems;t<0&&(t+=this.numItems),this.targetIndexWithinBounds=t,this.updateDots(),this.settings.useUpdateContainerHeight&&this.updateContainerHeight(),this.timerAnimate||(this.timerAnimate=requestAnimationFrame(this._onAnimationTimer))},onAnimationTimer:function(){var t=this.pointerVal,e=this.targetVal-t,i=e<0?-e:e;if(i<this.settings.stepSnap)this.step=this.stepAbs=0,this.setPointer(this.targetVal),cancelAnimationFrame(this.timerAnimate),this.timerAnimate=0;else{var s=e*this.settings.stepFactor;if(s*this.step>=0){if(this.step=e*this.settings.stepFactor,this.choke<1&&(this.choke=this.choke*this.settings.chokeReleaseFactor+(this.choke||this.settings.chokeReleaseStep?this.settings.chokeReleaseStep:.05)),this.choke>i&&(this.choke=i*(.5+this.settings.chokeReturnFactor)),this.choke>1&&(this.choke=1),this.step>this.settings.stepMin||this.step<-this.settings.stepMin){var n=this.choke*this.settings.stepMax;this.step>n?this.step=n:this.step<-n&&(this.step=-n),this.step>this.settings.stepMin||this.step<-this.settings.stepMin||(this.step=this.settings.stepMin*(this.step<0?-1:1))}this.stepAbs=this.step<0?-this.step:this.step,t+=this.step}else(s=this.step*(1-this.settings.stepTurnBreakFactor))>this.settings.stepSnap||s<-this.settings.stepSnap?this.step=s:this.step=0,t+=s;this.stepAbs=this.step<0?-this.step:this.step,this.setPointer(t),this.timerAnimate=requestAnimationFrame(this._onAnimationTimer)}},goTo:function(t){clearTimeout(this.timerNonLoopingHint),this.settings.autoPlay.stopOnNavigation&&this.stopAuto(),this.timerAnimate&&(cancelAnimationFrame(this.timerAnimate),this.timerAnimate=0),this.targetIndex=t%this.numItems,this.targetIndex<0&&(this.targetIndex+=this.numItems),this.targetIndexWithinBounds=this.targetIndex,this.updateDots(),this.settings.useUpdateContainerHeight&&this.updateContainerHeight(),this.setPointer(this.targetIndexWithinBounds)},updateContainerHeight:function(t){var e;if(void 0===t)if((e=this.getParentSlides()).length)e[0].updateContainerHeight();else{var i=this.getSubSlides();i.length?i[0].updateContainerHeightFromParent():this.doUpdateContainerHeight()}else this.doUpdateContainerHeight(t),(e=this.getParentSlides().reverse()).length&&e[0].updateContainerHeight(this.containerHeight)},doUpdateContainerHeight:function(t){this.container.getAttribute("id");void 0===t&&(t=0);var e=this.items[this.targetIndexWithinBounds].offsetHeight;e||(this.items[this.targetIndexWithinBounds].style.display="block",e=this.items[this.targetIndexWithinBounds].offsetHeight),e<t&&(e=t),e>0&&this.containerHeight!==e&&(this.containerHeight=e,this.css(this.container,{height:e+"px"}))},updateContainerHeightFromParent:function(){this.updateContainerHeight(0)},getParentSlides:function(){var t=[];return function e(i){i.parentNode&&void 0!==i.parentNode&&(void 0!==i.parentNode.tinSlide&&t.push(i.parentNode.tinSlide),e(i.parentNode))}(this.container),t.reverse()},getSubSlides:function(){var t=[];return function e(i){for(var s=0,n=i.childNodes.length;s<n;s++)void 0!==i.childNodes[s].tinSlide?(t.push(i.childNodes[s].tinSlide),e(i.childNodes[s].tinSlide.getCurrentItem())):e(i.childNodes[s])}(this.items[this.targetIndexWithinBounds]),t.reverse()},applySlideEffect:function(){for(var t in this.itemsVisible){var e=this.items[t],i=this.itemsVisible[t],s=i<0?-i:i,n=[];if(this.settings.effects.slideHorizontal.on){var o=i-this.translateXOffsetProgress,r=100*this.settings.effects.slideHorizontal.offset*-o+"%",a=this.settings.verticallyCenter?"-50%":0;n.push("translate3d("+r+", "+a+", 0)"),o>.75||o<-(this.settings.effects.slideHorizontal.numVisible-.25)?void 0===this.itemsOutside[t]&&(this.itemsOutside[t]=e,this.addClass(e,"tin-slide-outside")):void 0!==this.itemsOutside[t]&&(delete this.itemsOutside[t],this.removeClass(e,"tin-slide-outside"))}if(this.settings.effects.scale.on){var h;if(s<this.settings.effects.scale.maxAt)h=this.settings.effects.scale.max;else if(s<this.settings.effects.scale.minAt){var l=1-(s-this.settings.effects.scale.maxAt)/(this.settings.effects.scale.minAt-this.settings.effects.scale.maxAt);h=this.settings.effects.scale.min+l*(this.settings.effects.scale.max-this.settings.effects.scale.min)}else h=this.settings.effects.scale.min;n.push("scale("+h+", "+h+")")}if(n.length?e.style.transform=n.join(" "):""!==e.style.transform&&(e.style.transform=""),this.settings.effects.fade.on){var d;if(s<this.settings.effects.fade.maxAt)d=this.settings.effects.fade.max;else if(s<this.settings.effects.fade.minAt){var u=1-(s-this.settings.effects.fade.maxAt)/(this.settings.effects.fade.minAt-this.settings.effects.fade.maxAt);d=this.settings.effects.fade.min+u*(this.settings.effects.fade.max-this.settings.effects.fade.min)}else d=this.settings.effects.fade.min;e.style.opacity=d}else""!==e.style.opacity&&(e.style.opacity="")}this.settings.effects.motionBlur.on&&this.applyBlur()},applyBlur:function(){var t=this.stepAbs-this.settings.effects.motionBlur.stepMin;t<0&&(t=0);var e=t*this.settings.effects.motionBlur.factor;e>this.settings.effects.motionBlur.maxPixels&&(e=this.settings.effects.motionBlur.maxPixels);var i=e?"blur("+e+"px)":"";for(var s in this.itemsVisible)this.items[s].style.filter=i},updateDots:function(){var t;this.dots&&this.currentDotIndex!==this.targetIndexWithinBounds&&(null!==this.currentDotIndex&&(t=this.dotsItems[this.currentDotIndex])&&this.removeClass(t,"on"),this.currentDotIndex=this.targetIndexWithinBounds,(t=this.dotsItems[this.currentDotIndex])&&this.addClass(t,"on"))},onDotClick:function(t){this.settings.autoPlay.stopOnNavigation&&this.stopAuto();var e=parseInt(t.target.getAttribute("tin-slide-index"),10);this.animateTo(e)},startAuto:function(){"stopped"!==this.autoPlayState&&"started"!==this.autoPlayState&&(this.autoPlayState="started",this.resumeAuto())},pauseAuto:function(){"stopped"!==this.autoPlayState&&this.autoPlayState&&(this.autoPlayState="paused",clearInterval(this.timerAutoPlay),this.timerAutoPlay=0)},resumeAuto:function(){"stopped"!==this.autoPlayState&&this.autoPlayState&&(this.autoPlayState="started",clearInterval(this.timerAutoPlay),this.timerAutoPlay=setInterval(function(){if(!this.timerSwipe&&this.container.clientHeight&&!this.hasClass(this.container,"window-hidden")){var t=this.autoPlayForwards?this.next(!0):this.previous(!0);t||(this.autoPlayForwards=!this.autoPlayForwards,t=this.autoPlayForwards?this.next(!0):this.previous(!0))}}.bind(this),this.settings.autoPlay.time))},stopAuto:function(){"stopped"!==this.autoPlayState&&this.autoPlayState&&(this.pauseAuto(),this.autoPlayState="stopped")},imageLoaded:function(t){this.settings.useUpdateContainerHeight&&this.updateContainerHeight()}};var n={};i={next:function(t){s.next()},previous:function(t){s.previous()},animateTo:function(t){s.animateTo(t)},goTo:function(t){s.goTo(t)},getDots:function(){return s.dots?s.dots:s.createDots()},getNav:function(){return s.nav?s.nav:s.createNav()},startAuto:function(){s.startAuto()},stopAuto:function(){s.stopAuto()},updateContainerHeight:function(t){s.updateContainerHeight(t)},updateContainerHeightFromParent:function(){s.updateContainerHeightFromParent()},getCurrentItem:function(){return s.items[s.targetIndexWithinBounds]},on:function(t,e){"object"!=typeof n[t]&&(n[t]=[]),n[t].push(e)},removeListener:function(t,e){var i;"object"==typeof n[t]&&(i=n[t].indexOf(e))>-1&&n[t].splice(i,1)},emit:function(t,e){var i,s,o,r=[].slice.call(arguments,1);if("object"==typeof n[t])for(o=(s=n[t].slice()).length,i=0;i<o;i++)s[i].apply(this,r)}},s.init(t,e),document.ondragstart=function(){return!1};var o=null;function r(t){var e="visible",i="hidden",n={focus:e,focusin:e,pageshow:e,blur:i,focusout:i,pagehide:i};((t=t||window.event).type in n?"hidden"===n[t.type]:!!document[o])?s.addClass(s.container,"window-hidden"):s.removeClass(s.container,"window-hidden")}return"hidden"in document?(o="hidden",document.addEventListener("visibilitychange",r)):"mozHidden"in document?(o="mozHidden",document.addEventListener("mozvisibilitychange",r)):"webkitHidden"in document?(o="webkitHidden",document.addEventListener("webkitvisibilitychange",r)):"msHidden"in document?(o="msHidden",document.addEventListener("msvisibilitychange",r)):"onfocusin"in document?document.onfocusin=document.onfocusout=r:window.onpageshow=window.onpagehide=window.onfocus=window.onblur=r,o&&void 0!==document[o]&&r({type:document[o]?"blur":"focus"}),t.tinSlide=i,i}}));