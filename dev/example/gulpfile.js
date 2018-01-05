var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('js', function() {
    return gulp.src(mainBowerFiles())
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('../../public/example/'))
});

gulp.task('build', function() {
    gulp.start('js');
});

gulp.task('watch', function () {
    gulp.watch('public/*.html', function () {
        gulp.start('build');
    });
});

gulp.task('default', function() {
    gulp.start('build');
});
