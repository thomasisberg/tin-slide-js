(function() {
    'use strict';
    var nav = document.getElementById('nav');
    var navButton = document.getElementById('nav-button');
    navButton.addEventListener('click', function(event) {
        nav.className = nav.className === 'on' ? '' : 'on';
    });
})();