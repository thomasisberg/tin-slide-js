const gulp = require('gulp');
const mainBowerFiles = require('main-bower-files');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const webpack = require('webpack-stream');

var dest = '../../public/example/';

function js() {
    return gulp.src('main.js')
        .pipe(webpack())
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(dest))
        // .pipe(rename('scripts.min.js'))
        // .pipe(uglify())
        // .pipe(gulp.dest(dest));
}

function dist() {
    return gulp.src(['*.html', '*.png'])
        .pipe(gulp.dest(dest))
}

function watch() {
    gulp.watch('index.html', dist).on('error', err);
    gulp.watch('main.js', js).on('error', err);
}

function err(error) {
    console.log(error);
}

var build = gulp.parallel(js, dist);

exports.watch = watch;
exports.build = build;
exports.default = build;
