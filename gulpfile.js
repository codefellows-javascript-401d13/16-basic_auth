'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

gulp.task('test', function gulpTest(){
  gulp.src('./test/*-test.js', {read: false})
  .pipe(mocha({reporter: 'spec'}));
});

gulp.task('lint', function gulpLint(){
  return gulp.src(['**/*.js', '!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});

gulp.task('dev', function gulpDev(){
  gulp.watch(['**/*.js', '!node_modules/**'], ['lint', 'test']);
});

gulp.task('default', ['dev']);
