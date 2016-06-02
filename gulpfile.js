//-----------//
//  PLUGINS  //
//-----------//
'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    prefixer = require('gulp-autoprefixer'),
    rename = require("gulp-rename");


//----------//
// SETTINGS //
//----------//

var src = {
	all_files: './src/**/*',
	sass_files: './src/scss/**/*.scss', //
	css_folder: './src/css',   //
    css_files: './src/css/**/*.css',   //
	js_files: './src/js/**/*.js',
	js_folder: './src/js',
	images: './src/img/*',
	img_folder: './src/img'
}

var output = {
	base_folder: './dist/',
	js: './dist/js',
	css_folder: './dist/css',
    min_css: 'style.min.css', //
	img: './dist/img',
	min_js: 'app.min.js'
}

//-------//
// TASKS //
//-------//

gulp.task('scss:dev', function () {
    return gulp.src(src.sass_files)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe( prefixer( { browsers: ['last 6 versions'] }) )
    //remove '.' to include sourcemaps directly into the css-file
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(src.css_folder));
});

gulp.task('scss:build', function () {
    return gulp.src(src.sass_files)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe( prefixer( { browsers: ['last 6 versions'] }) )
    .pipe(sourcemaps.write())
    .pipe(rename(output.min_css))
	.pipe(gulp.dest(output.css_folder));
});


gulp.task('watch', function () {
    gulp.watch(src.all_files, ['scss:dev']);
});
gulp.task('build',['scss:build']);
