'use strict';

var gulp  = require('gulp');
var watch = require('gulp-watch');
var sass  = require('gulp-sass');

gulp.task('sass', function () {
  gulp.src('scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('css'));
});

gulp.task('css-lib', function () {
  gulp.src('scss/lib/**/*.css')
    .pipe(gulp.dest('css/lib'));
});

gulp.task('watch', function () {
  gulp.watch('scss/**/*.scss', ['sass']);
  gulp.watch('scss/lib/**/*.css', ['css-lib'])
});

gulp.task('default', ['sass', 'css-lib', 'watch']);
