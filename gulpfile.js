//-----------//
//  PLUGINS  //
//-----------//
'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass');
//----------//
// SETTINGS //
//----------//

var src = {
	all_files: '**/*',
	sass_files: 'scss/**/*.scss',
	css_folder: 'css',
	min_css: 'style.min.css',
	js_files: 'js/**/*.js',
	js_folder: 'js',
	min_js: 'app.min.js',
	img: 'img/*',
	img_folder: 'img'
}

var output = {
	base_folder: 'build/',
	js: 'build/js',
	css: 'build/css',
	img: 'build/img',
	min_css: 'app.min.css',
	min_js: 'app.min.js'
}

//-------//
// TASKS //
//-------//

gulp.task('sass', function () {
  return gulp.src('./scss/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./scss/**/*.scss', ['sass']);
});
