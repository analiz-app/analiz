var del = require('del');
var electron = require('gulp-electron');
var gulp = require('gulp');
var install = require('gulp-install');
var merge = require('merge-stream');
var path = require('path');

var packageJson = require('./app/package.json');

// CONFIG
var electronVersion = 'v0.34.1';
// Set the platforms for builds
var aPlatforms = ['linux-x64', 'win32-x64', 'darwin-x64'];
// Set the folder for dev (use the first element in aPlatforms)
var sAppFolder = path.resolve( 'builds', electronVersion, aPlatforms[0], 'resources', 'app' );

// Build the app
gulp.task('electron', ['copy', 'install', 'install-plugins', 'cleanBuilds'], function() {
  return gulp.src("")
    .pipe(electron({
      src: './dist',
      packageJson: packageJson,
      release: './builds',
      cache: './cache',
      version: electronVersion,
      platforms: aPlatforms,
      packaging: true,
      asar: false,
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

// Build the app for dev
gulp.task('electron-dev', ['copy', 'install', 'install-plugins', 'cleanBuilds'], function() {
  return gulp.src("")
    .pipe(electron({
      src: './dist',
      packageJson: packageJson,
      release: './builds',
      cache: './cache',
      version: electronVersion,
      platforms: aPlatforms[0],
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

gulp.task('install-plugins', [], function () {
  return gulp.src('./dist/package.json')
  .pipe(gulp.dest('./dist/plugins/'))
  .pipe(install());
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['dist', '.tmp']));
gulp.task('cleanBuilds', del.bind(null, ['builds']));

gulp.task('default', ['electron']);

gulp.task('dev', ['electron-dev'], function () {
  gulp.watch(['app/**/*'], ['update']);
});

gulp.task('update', [], function () {
  return gulp.src(['app/**/*'])
    .pipe(gulp.dest(sAppFolder));
});
