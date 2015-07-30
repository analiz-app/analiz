var bump = require('gulp-bump');
var del = require('del');
var electron = require('gulp-electron');
var filter = require('gulp-filter');
var git = require('gulp-git');
var gulp = require('gulp');
var install = require('gulp-install');
var merge = require('merge-stream');
var tag_version = require('gulp-tag-version');

var packageJson = require('./app/package.json');

// CONFIG
var electronVersion = 'v0.30.0';
// Set the platforms for builds
var aPlatforms = ['linux-x64', 'win32-x64', 'darwin-x64'];
// Set the folder for dev (use the first element in aPlatforms)
var sBuildFolder = 'builds/' + electronVersion + '/' + aPlatforms[0];
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

/**
 * Bumping version number and tagging the repository with it.
 * Please read http://semver.org/
 *
 * You can use the commands
 *
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */
var inc = function (importance) {
  // get all the files to bump version in
  return gulp.src(['./package.json', './bower.json', './app/package.json'])
    // bump the version number in those files
    .pipe(bump({type: importance}))
    // save it back to filesystem
    .pipe(gulp.dest('./'))
    // commit the changed version number
    .pipe(git.commit('bumps package version'))

    // read only one file to get the version number
    .pipe(filter('package.json'))
    // **tag it in the repository**
    .pipe(tag_version());
};

gulp.task('patch', function() { return inc('patch'); });
gulp.task('feature', function() { return inc('minor'); });
gulp.task('release', function() { return inc('major'); });
