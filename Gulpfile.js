var del = require('del');
var electron = require('gulp-electron');
var gulp = require('gulp');
var install = require("gulp-install");
var merge = require('merge-stream');
var run = require('gulp-run');

var packageJson = require('./app/package.json');

// CONFIG
var electronVersion = 'v0.30.0';
// Set your platform as for dev
var sCurrentPlatform = 'linux-x64';
// var aPlatforms = [sCurrentPlatform];
var aPlatforms = [sCurrentPlatform, 'win32-x64', 'darwin-x64'];

// Misc
var sBuildFolder = 'builds/' + electronVersion + '/' + sCurrentPlatform;
var sAppFolder =  sBuildFolder + '/resources/app';

// Build the app
// TODO : Add gulp-bump for automatic version name when the first usable app prototype is done
gulp.task('electron', ['copy', 'install', 'cleanBuilds'], function() {
  return gulp.src("")
    .pipe(electron({
      src: './dist',
      packageJson: packageJson,
      release: './builds',
      cache: './cache',
      version: electronVersion,
      platforms: aPlatforms,
      packaging: false,
      platformResources: {
        darwin: {
          CFBundleDisplayName: packageJson.name,
          CFBundleIdentifier: packageJson.name,
          CFBundleName: packageJson.name,
          CFBundleVersion: packageJson.version,
          icon: 'analiz.icns'
        },
        win: {
          "version-string": packageJson.version,
          "file-version": packageJson.version,
          "product-version": packageJson.version,
          "icon": 'analiz.ico'
        }
      }
    }))
    .pipe(gulp.dest(""));
});

// Copy files in the dist folder
gulp.task('copy', [], function () {
  var app = gulp.src(['app/**/*'])
    .pipe(gulp.dest('dist'));

  var bower = gulp.src(['bower_components/**/*'])
    .pipe(gulp.dest('dist/bower_components'));

  return merge(app, bower);
});

gulp.task('install', [], function () {
  return gulp.src(['./dist/package.json'])
  .pipe(install({production: false}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['dist', '.tmp']));
gulp.task('cleanBuilds', del.bind(null, ['builds']));

gulp.task('default', ['electron']);

gulp.task('dev', ['default'], function () {
  gulp.watch(['app/**/*'], ['update']);
});

gulp.task('update', [], function () {
  return gulp.src(['app/**/*'])
    .pipe(gulp.dest(sAppFolder));
});
