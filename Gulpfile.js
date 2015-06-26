var browserSync = require('browser-sync');
var del = require('del');
var electron = require('gulp-electron');
var gulp = require('gulp');
var install = require("gulp-install");
var merge = require('merge-stream');

var reload = browserSync.reload;
var packageJson = require('./app/package.json');

// CONFIG
var electronVersion = 'v0.28.1';
var aPlatforms = ['linux-x64', 'win32-x64', 'darwin-x64'];

// Watch Files For Changes & Reload
gulp.task('serve', [], function () {
  gulp.src(['./app/package.json'])
    .pipe(gulp.dest("./.tmp"))
    .pipe(install({production: true}));

  browserSync({
    notify: false,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch(['app/**/*'], reload);
});

// Build the app
// TODO : Add gulp-bump for automatic version name when the first usable app prototype is done
gulp.task('electron', ['default', 'cleanBuilds'], function() {
  return gulp.src("")
    .pipe(electron({
      src: './dist',
      packageJson: packageJson,
      release: './builds',
      cache: './cache',
      version: electronVersion,
      packaging: false,
      asar: true,
      platforms: aPlatforms
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
  gulp.src(['./dist/package.json'])
  .pipe(install({production: true}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['dist', '.tmp']));
gulp.task('cleanBuilds', del.bind(null, ['builds']));


gulp.task('default', ['install', 'copy'], function() {
  // place code for your default task here
});
