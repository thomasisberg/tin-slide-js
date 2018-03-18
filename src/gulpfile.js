const gulp = require('gulp');
const sass = require('gulp-sass');
const jshint = require('gulp-jshint');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

const dest = '../public/src/';

function dist() {
    return gulp.src([
        '*.html', 
        '*.jpg'
    ]).pipe(gulp.dest(dest));
}

function styles() {
    return gulp.src('*.scss')
        .pipe(sass())
        .pipe(gulp.dest(dest));
}

function script() {
    return gulp.src('tin-slide.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulp.dest(dest))
        .pipe(rename('tin-slide.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./'));
}

function watch() {
    gulp.watch(['*.html', '*.jpg'], dist).on('error', err);
    gulp.watch('*.scss', styles).on('error', err);
    gulp.watch('tin-slide.js', script).on('error', err);
}

function err(error) {
    console.log(error);
}

function build() {
    return gulp.parallel(dist, styles, script)();
}

exports.dist = dist;
exports.styles = styles;
exports.script = script;
exports.watch = watch;
exports.default = build;
