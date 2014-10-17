'use strict';

var gulp, jshint, jscs;

gulp = require('gulp');
jshint = require('gulp-jshint');
jscs = require('gulp-jscs');

gulp.task('default', function () {
  gulp.src([ './*.js', './**/*.js', '!./node_modules/**/*.*' ])
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jscs());
});