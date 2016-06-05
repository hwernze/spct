//-----------//
//  PLUGINS  //
//-----------//
'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    prefixer = require('gulp-autoprefixer'),
    rename = require("gulp-rename"),
    del = require('del'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

var param = process.argv[process.argv.length -1];

//----------//
// SETTINGS //
//----------//
//TODO: split scss files conf into file-pattern & folders
//TODO: remove any deploy into the src folder

var config = {
    src: './src/**/*',
    scss_files: './src/scss/**/*.scss',
    // IF Param = --build use -> ./build/css else if param = --pre use -> ./preprod/css else development use -> ./src/css
    css_out: param === '--build' ? './build/css' : param === '--pre' ? './preprod/css' : './src/css',
    css_outputStyle: param === '--build' || param === '--pre' ? {outputStyle: 'compressed'} : '',
    css_file: 'style.css', //Need to be adjusted to your naming convention of your scss entry file/point
    css_file_min: 'style.min.css',
    js_folder: './src/js',
    js_files: '/**/*.js',
	js_file_min: 'app.min.js',
    js_out: param === '--build' ? './build/js' : param === '--pre' ? './preprod/js' : './src/js',
    js_mangle: param === '--build' ? true : false,
    js_compress: true
}
console.log("-- CONFIG --");
console.log(config);

//-------//
// TASKS //
//-------//

gulp.task('scss:compile', function () {
    return gulp.src(config.scss_files)
    .pipe(sourcemaps.init())
    .pipe(sass(config.css_outputStyle).on('error', sass.logError))
    .pipe( prefixer( { browsers: ['last 6 versions'] }) )
    .pipe(sourcemaps.write('.'))
	.pipe(gulp.dest(config.css_out));
});

gulp.task('scripts:concat', function() {
    return gulp.src([config.js_folder + config.js_files, '!src/js/**/*.min.js'])
    .pipe(concat(config.js_file_min))
    .pipe(gulp.dest(config.js_out));
});

// by default gulp-uglify only mangles local vars, not globals
gulp.task('scripts:compress', ['scripts:concat'], function() {
    return gulp.src(config.js_out + '/' + config.js_file_min)
    .pipe(sourcemaps.init())
    .pipe(uglify({
        mangle: config.js_mangle,
        compress: config.js_compress
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.js_out));
});

// gulp.task('copyCSS', function() {
//    gulp.src(src.css_folder)
//    .pipe(gulp.dest(output.css_folder));
// });

gulp.task('renameCSS', ['scss:compile'], function() {
    if (param === '--build' || param === '--pre') {
        gulp.src(config.css_out + '/' + config.css_file)
        // gulp.src(output.css_file)
        .pipe(rename(config.css_file_min))
        .pipe(gulp.dest(config.css_out));
    }
});

gulp.task('cleanCSSFolder', ['renameCSS'], function() {
    if (param === '--build'|| param === '--pre') {
        del([config.css_out + '/' + config.css_file]);
    };
});

gulp.task('watch', function () {
    gulp.watch(config.scss_files, ['scss:compile']);
    gulp.watch(config.js_files, ['scripts:concat']);
});

gulp.task('default', ['scss:compile', 'scripts:concat', 'scripts:compress']);

gulp.task('build',['scss:compile', 'renameCSS', 'cleanCSSFolder', 'scripts:concat', 'scripts:compress']);
