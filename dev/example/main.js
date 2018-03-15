import TinSlide from 'tin-slide';

var slides = document.getElementsByClassName('slides');
for(var ii=0; ii<slides.length; ii++) {
    TinSlide(slides[ii], !ii?undefined:{
        loop: false,
        generate: {
            nav: {
                on: false
            },
            dots: {
                on: false
            }
        },
        motionBlur: {
            on: true
        }
    });
}