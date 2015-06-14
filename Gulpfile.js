var browserSync = require('browser-sync');
var reload = browserSync.reload;
var gulp = require('gulp');
var del = require('del');
var electron = require('gulp-electron');
var merge = require('merge-stream');

var packageJson = require('./app/package.json');

// Watch Files For Changes & Reload
gulp.task('serve', [], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
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
gulp.task('electron', ['default', 'cleanReleases'], function(cb) {
  gulp.src("")
  .pipe(electron({
      src: './dist',
      packageJson: packageJson,
      release: './releases',
      cache: './cache',
      version: 'v0.28.1',
      packaging: false,
      platforms: ['linux-x64', 'win32-x64', 'darwin-x64']
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

// Clean Output Directory
gulp.task('clean', del.bind(null, ['dist']));
gulp.task('cleanReleases', del.bind(null, ['releases']));


gulp.task('default', ['copy'],function() {
  // place code for your default task here
});
