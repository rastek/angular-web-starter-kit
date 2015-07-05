/**
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync-x');
var pageSpeed = require('psi');
var debug = require('gulp-debug');
var reload = browserSync.reload;
var cache = $.cache;

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe(reload({stream: true, once: true}))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Optimize images
gulp.task('images', function () {
    return gulp.src(['app/assets/images/**/*'])
        .pipe(cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/assets/images'))
        .pipe($.size({title: 'images'}));
});

// Copy all files at the root level (app)
gulp.task('copy', function () {
    return gulp.src([
        'app/*',
        '!app/*.html',
        'node_modules/apache-server-configs/dist/.htaccess',
        '!app/scss',
        '!app/scripts'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'))
        .pipe($.size({title: 'copy'}));
});

// Copy web fonts to dist
gulp.task('fonts', function () {
    return gulp.src(['app/assets/fonts/**'])
        .pipe(gulp.dest('dist/assets/fonts'))
        .pipe($.size({title: 'fonts'}));
});


// Automatically prefix CSS
gulp.task('styles:css', function () {
    return gulp.src('app/styles/css/**/*.css')
        .pipe($.changed('app/styles'))
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest('app/styles'))
        .pipe($.size({title: 'styles:css'}));
});

// Compile Sass For Style Guide Components (app/styles/components)
gulp.task('styles:scss', function () {
    var path = require('path');
    return gulp.src('app/scss/app.scss')
        .pipe($.sass({
            style: 'expanded',
            precision: 10,
            loadPath: ['app/scss']
        }))
        .on('error', console.error.bind(console))
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest('app/assets/styles'))
        .pipe(reload({stream: true}))
        .pipe($.size({title: 'styles:scss'}));
});

// Output final CSS styles
gulp.task('styles', ['styles:scss', 'styles:css']);

// Scan your HTML for assets & optimize them
gulp.task('html', function () {
    var assets = $.useref.assets({searchPath: '{.tmp,app}'});
    return gulp.src('app/**/*.html')
        .pipe(assets)
        // Concatenate and minify JavaScript
        .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
        // Remove Any Unused CSS
        // commented for now as it doesn't work well with angular (ng-class for example)
        /*.pipe($.if('*.css', $.uncss({
         html: [
         'app/htm.html'
         ],
         // CSS Selectors for UnCSS to ignore
         ignore: [
         '.navdrawer-container.open',
         /.app-bar.open/
         ]
         })))*/
        // Concatenate and minify styles
        .pipe($.if('*.css', $.csso()))
        .pipe(assets.restore())
        .pipe($.useref())
        // Update production Style Guide paths
        .pipe($.replace('components/components.css', 'components/main.min.css'))
        // Minify any HTML
        .pipe($.if('*.html', $.minifyHtml({empty: true})))
        // Output files
        .pipe(gulp.dest('dist'))
        .pipe($.size({title: 'html'}));
});


gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
        .pipe($.sourcemaps.init())
        .pipe($.concat('app.js'))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('app/assets/scripts'));
});

gulp.task('vendor', function () {
    var mainBowerFiles = require('main-bower-files');
    return gulp.src(mainBowerFiles(/* options */))
        .pipe(debug({title: '[DEBUG][vendor task]:'}))
        .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
        .pipe($.sourcemaps.init())
        .pipe($.concat('vendor.js'))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('app/assets/scripts'));
});

//Clear cache
gulp.task('clear', function (done) {
    return cache.clearAll(done);
});

// Clean output directory
gulp.task('clean', ['clear'], del.bind(null, ['.tmp', 'dist']));

// Watch files for changes & reload
gulp.task('serve', function () {
    browserSync({
        open: false,
        notify: true,
        server: {
            baseDir: ['.tmp', 'app']
        }
    });

    gulp.watch(['app/**/*.html'], reload);
    gulp.watch(['app/scss/**/*.scss'], ['styles:scss']);
    gulp.watch(['app/scripts/**/*.js'], [/*'jshint',*/ 'scripts', reload]);
    gulp.watch(['app/assets/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
    browserSync({
        open: false,
        notify: true,
        logPrefix: 'WSK',
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: {
            baseDir: 'dist'
        }
    });
});

// Build production files, the default task
gulp.task('default', ['clean'], function (cb) {
    runSequence('styles', 'vendor', 'scripts', ['jshint', 'html', 'images', 'fonts', 'copy'], cb);
});

// Run PageSpeed Insights
gulp.task('pagespeed', function (cb) {
    // Update the below URL to the public URL of your site
    pageSpeed.output('example.com', {
        strategy: 'mobile'
        // By default we use the PageSpeed Insights free (no API key) tier.
        // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
        // key: 'YOUR_API_KEY'
    }, cb);
});

// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
