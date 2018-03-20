const gulp = require('gulp');
const sass = require('gulp-sass');
const jshint = require('gulp-jshint');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');

const dest = '../public/';

function dist() {
    return gulp.src([
        '*.html', 
        '*.jpg'
    ]).pipe(gulp.dest(dest));
}

function styles() {
    return gulp.src('*.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: [
                'last 2 versions',
                'ie 8',
                'ie 9',
                'android 2.3',
                'android 4',
                'opera 12'
            ]
        }))
        .pipe(concat('style.css'))
        .pipe(gulp.dest(dest));
}

function scripts() {
    return gulp.src(['tin-slide.js', 'main.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest(dest))
}
function minify() {
    return gulp.src('tin-slide.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(rename('tin-slide.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./'));
}

function watch() {
    gulp.watch(['*.html', '*.jpg'], dist).on('error', err);
    gulp.watch('*.scss', styles).on('error', err);
    gulp.watch(['main.js'], scripts).on('error', err);
    gulp.watch('tin-slide.js', gulp.series(scripts, minify)).on('error', err);
}

function err(error) {
    console.log(error);
}

var build = gulp.parallel(dist, styles, scripts, minify);

exports.dist = dist;
exports.styles = styles;
exports.scripts = scripts;
exports.minify = minify;
exports.watch = watch;
exports.build = build;
exports.default = build;
