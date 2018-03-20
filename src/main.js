(function() {
    'use strict';

    if(window.requestAnimationFrame === undefined) {
        window.requestAnimationFrame = function(callback) {
            setTimeout(callback, 1000/60);
        }
    }

    var nav = document.getElementById('nav');
    var navButton = document.getElementById('nav-button');
    var navOn = false;

    var documentClickHandler = function(event) {
        var scope = event.target;
        do {
            if(scope === nav || scope == navButton) {
                break;
            }
            scope = scope.parentNode;
        } while(scope && scope !== undefined);
        if(!scope) {
            event.preventDefault();
            toggleNav();
        }
    };
    
    var toggleNav = function() {
        navOn = !navOn;
        nav.className = navOn ? 'on' : '';
        if(navOn) {
            requestAnimationFrame(function() {
                document.addEventListener('mousedown', documentClickHandler);
                document.addEventListener('touchend', documentClickHandler);
            });
        }
        else {
            document.removeEventListener('mousedown', documentClickHandler);
            document.removeEventListener('touchend', documentClickHandler);
        }
    };

    navButton.addEventListener('click', toggleNav);
    
})();