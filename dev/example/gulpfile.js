var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var concat = require('gulp-concat');
// var rename = require('gulp-rename');
// var uglify = require('gulp-uglify');

var dest = '../../public/example/';

function js() {
    return gulp.src(mainBowerFiles())
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(dest));
        // .pipe(rename('scripts.min.js'))
        // .pipe(uglify())
        // .pipe(gulp.dest(dest));
}

function dist() {
    return gulp.src(['*.html'])
        .pipe(gulp.dest(dest))
}

function watch() {
    return gulp.watch('index.html', dist);
}

var build = gulp.parallel(js, dist);
exports.build = build;
exports.default = build;
