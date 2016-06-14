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
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    watch = require('gulp-watch'),
    batch = require('gulp-batch'),
    browserSync = require('browser-sync').create();

var param = process.argv[process.argv.length -1];

//----------//
// SETTINGS //
//----------//
//TODO: always compile to min css/js

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
    output_dest: param === '--build' ? './build' : './preprod',
    asset_srcImages: './src/img/**/*'
}

//-------//
// TASKS //
//-------//

// SCSS
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
        .pipe(rename(config.css_file_min)) //{ suffix: '.min' }
        .pipe(gulp.dest(config.output_dest + '/css'));
    }
});

gulp.task('css:cleanFolder', ['css:rename'], function() {
    if (param === '--build'|| param === '--pre') {
        del([config.output_dest + '/css/' + config.css_file]);
    };
});

// JAVASCRIPT
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
    .pipe(browserSync.stream());
});
gulp.task('html-watch', ['html:minify'], browserSync.reload);
// ASSETS IMAGES
gulp.task('assets:imagemin', function () {
    return gulp.src(config.asset_srcImages)
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest(config.output_dest + '/img'));
});

gulp.task('asset-watch', ['assets:imagemin'], browserSync.reload);

//----------//
// COMMANDS //
//----------//

//UNBIND EXAMPLE
/*
var callback = function(stream) {
  console.log('someone connected!');
};
server.on('connection', callback);
// ...
server.removeListener('connection', callback);
*/

// Static Server + watching scss/html files
gulp.task('serve', [ 'build'], function() {

    browserSync.init({
        server: "./preprod"
    });

    function scssCallback() {
        gulp.start('scss:compile');
        // gulp.watch(config.scss_srcFolder + config.scss_files, ['scss:compile'])
    };

    watch(config.scss_srcFolder + config.scss_files, scssCallback );
    gulp.watch(config.scss_srcFolder + config.scss_files, ['scss:compile']);

    //Watch the scss folder for changes
    // watch(config.scss_srcFolder + config.scss_files, batch(function (events, done){
    //     gulp.start('scss:compile',
    //         //callback when done
    //         gulp.watch(config.scss_srcFolder + config.scss_files, ['scss:compile'])
    //     );
    // }));

    // watch the js folder for changes
    watch(config.js_srcFolder + config.js_files, batch(function (events, done) {
        gulp.start('scripts:concat', 'scripts:compress',
            //callback when done
            gulp.watch(config.js_srcFolder + config.js_files, ['js-watch'])
        );
    })).on('change', browserSync.reload);


    watch(config.asset_srcImages, batch(function (events, done) {
        //TODO clean folder
        gulp.start('assets:imagemin', done);
    })).on('change', browserSync.reload);

    gulp.watch(config.html_src, ['html-watch']);
    // gulp.watch(config.html_src, ['html-watch']).on('change', browserSync.reload);
    // gulp.watch(config.html_src, ['html:minify']);
});


gulp.task('default', ['scss:compile', 'scripts:concat', 'scripts:compress', 'html:minify', 'assets:imagemin']);

gulp.task('build',['scss:compile', 'css:rename', 'css:cleanFolder', 'scripts:concat', 'scripts:compress', 'html:minify', 'assets:imagemin']);
