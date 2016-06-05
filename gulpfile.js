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
    concat = require('gulp-concat'),
    htmlmin = require('gulp-htmlmin'),
    browserSync = require('browser-sync').create();

var param = process.argv[process.argv.length -1];

//----------//
// SETTINGS //
//----------//
//TODO: refern always to min css/js

var config = {
    html_src: './src/*.html',
    scss_files: '/**/*.scss',
    scss_srcFolder:'./src/scss',
    css_outputStyle: param === '--build' || param === '--pre' ? {outputStyle: 'compressed'} : '',
    css_file: 'style.css', //Need to be adjusted to your naming convention of your scss entry file/point
    css_file_min: 'style.min.css',
    js_srcFolder: './src/js',
    js_files: '/**/*.js',
	js_file_min: 'app.min.js',
    js_mangle: param === '--build' ? true : false,
    js_compress: true,
    output_dest: param === '--build' ? './build' : './preprod'
}

//-------//
// TASKS //
//-------//

//SCSS
gulp.task('scss:compile', function () {
    return gulp.src(config.scss_srcFolder + config.scss_files)
    .pipe(sourcemaps.init())
    .pipe(sass(config.css_outputStyle).on('error', sass.logError))
    .pipe( prefixer( { browsers: ['last 6 versions'] }) )
    .pipe(sourcemaps.write('.'))
	.pipe(gulp.dest(config.output_dest + '/css'))
    .pipe(browserSync.stream());
});

gulp.task('css:rename', ['scss:compile'], function() {
    if (param === '--build' || param === '--pre') {
        gulp.src(config.output_dest + '/css/' + config.css_file)
        // gulp.src(output.css_file)
        .pipe(rename(config.css_file_min))
        .pipe(gulp.dest(config.output_dest + '/css'));
    }
});

gulp.task('css:cleanFolder', ['css:rename'], function() {
    if (param === '--build'|| param === '--pre') {
        del([config.output_dest + '/css/' + config.css_file]);
    };
});

// gulp.task('copyCSS', function() {
//    gulp.src(src.css_folder)
//    .pipe(gulp.dest(output.css_folder));
// });

//JAVASCRIPT
gulp.task('scripts:concat', function() {
    return gulp.src([config.js_srcFolder + config.js_files, '!src/js/**/*.min.js'])
    .pipe(concat(config.js_file_min))
    .pipe(gulp.dest(config.output_dest + '/js'));
});

// by default gulp-uglify only mangles local vars, not globals
gulp.task('scripts:compress', ['scripts:concat'], function() {
    return gulp.src(config.output_dest + '/js/' + config.js_file_min)
    .pipe(sourcemaps.init())
    .pipe(uglify({
        mangle: config.js_mangle,
        compress: config.js_compress
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.output_dest + '/js'));
});
// create a task that ensures the `js` task is complete before
// reloading browsers
gulp.task('js-watch', ['scripts:compress'], browserSync.reload);

// HTML
gulp.task('html:minify', function() {
  return gulp.src(config.html_src)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(config.output_dest))
});
gulp.task('html-watch', ['html:minify'], browserSync.reload);


//----------//
// COMMANDS //
//----------//
// Static Server + watching scss/html files
gulp.task('server', ['scss:compile'], function() {

    browserSync.init({
        server: "./preprod"
    });

    gulp.watch(config.scss_srcFolder + config.scss_files, ['scss:compile']);
    gulp.watch(config.js_srcFolder + config.js_files, ['js-watch']);
    gulp.watch(config.html_src, ['html-watch']).on('change', browserSync.reload);
});


gulp.task('watch', function () {
    gulp.watch(config.scss_srcFolder + config.scss_files, ['scss:compile']);
    gulp.watch(config.js_srcFolder + config.js_files, ['scripts:concat', 'scripts:compress']);
    gulp.watch(config.html_src, ['html:minify']);
});

gulp.task('default', ['scss:compile', 'scripts:concat', 'scripts:compress', 'html:minify']);

gulp.task('build',['scss:compile', 'css:rename', 'css:cleanFolder', 'scripts:concat', 'scripts:compress', 'html:minify']);
