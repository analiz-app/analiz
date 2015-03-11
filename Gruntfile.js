'use strict';

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('web-component-tester');

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    app_public: 'app/public',
    dist: 'dist',
    dist_public: 'dist/public'
  };

  // App Targets, change values during development, accelerating compilation times
  var oAppTargets = {
    mac: false,
    win: true,
    linux32: false,
    linux64: false
  };

  var oBinariesTargets = {
    releases: 'releases',
    builds: 'builds'
  };

  grunt.initConfig({
    yeoman: yeomanConfig,
    binaries: oBinariesTargets,
    bumpup: '<%= yeoman.app %>/manifest.json',
    watch: {
      options: {
        nospawn: true
      },
      default: {
        files: [
          '<%= yeoman.app_public %>/*.html',
          '<%= yeoman.app_public %>/elements/{,*/}*.html',
          '{.tmp,<%= yeoman.app_public %>}/elements/{,*/}*.{css,js}',
          '{.tmp,<%= yeoman.app_public %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app_public %>}/scripts/{,*/}*.js',
          '<%= yeoman.app_public %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      },
      js: {
        files: ['<%= yeoman.app_public %>/scripts/{,*/}*.js'],
        tasks: ['jshint']
      },
      styles: {
        files: [
          '<%= yeoman.app_public %>/styles/{,*/}*.css',
          '<%= yeoman.app_public %>/elements/{,*/}*.css'
        ],
        tasks: ['copy:styles', 'autoprefixer:server']
      },
      sass: {
        files: [
          '<%= yeoman.app_public %>/styles/{,*/}*.{scss,sass}',
          '<%= yeoman.app_public %>/elements/{,*/}*.{scss,sass}'
        ],
        tasks: ['sass:server', 'autoprefixer:server']
      }
    },
    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      options: {
        loadPath: 'bower_components'
      },
      dist: {
        options: {
          style: 'compressed'
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app_public %>',
          src: ['styles/{,*/}*.{scss,sass}', 'elements/{,*/}*.{scss,sass}'],
          dest: '<%= yeoman.dist_public %>',
          ext: '.css'
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app_public %>',
          src: ['styles/{,*/}*.{scss,sass}', 'elements/{,*/}*.{scss,sass}'],
          dest: '.tmp',
          ext: '.css'
        }]
      }
    },
    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },
      server: {
        files: [{
          expand: true,
          cwd: '.tmp',
          src: '**/*.css',
          dest: '.tmp'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist_public %>',
          src: ['**/*.css', '!bower_components/**/*.css'],
          dest: '<%= yeoman.dist_public %>'
        }]
      }
    },
    browserSync: {
      options: {
        notify: false,
        port: 9000,
        open: true
      },
      app: {
        options: {
          watchTask: true,
          injectChanges: false, // can't inject Shadow DOM
          server: {
            baseDir: ['.tmp', '<%= yeoman.app_public %>'],
            routes: {
              '/bower_components': 'bower_components'
            }
          }
        },
        src: [
          '.tmp/**/*.{css,html,js}',
          '<%= yeoman.app_public %>/**/*.{css,html,js}'
        ]
      },
      dist: {
        options: {
          server: {
            baseDir: 'dist'
          }
        },
        src: [
          '<%= yeoman.dist_public %>/**/*.{css,html,js}',
          '!<%= yeoman.dist_public %>/bower_components/**/*'
        ]
      }
    },
    clean: {
      dist: ['.tmp', '<%= yeoman.dist %>/*', '<%= yeoman.dist %>', '.sass-cache/**/*', '.sass-cache'],
      releases: '<%= binaries.releases %>',
      builds: ['<%= binaries.builds %>/**/*', '<%= binaries.builds %>'],
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        '<%= yeoman.app_public %>/scripts/{,*/}*.js',
        '!<%= yeoman.app_public %>/scripts/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    },
    useminPrepare: {
      html: '<%= yeoman.app_public %>/index.html',
      options: {
        dest: '<%= yeoman.dist_public %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.dist_public %>/{,*/}*.html'],
      css: ['<%= yeoman.dist_public %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist_public %>']
      }
    },
    replace: {
      dist: {
        options: {
          patterns: [{
            match: /\/elements\/elements\.html/g,
            replacement: '/elements/elements.vulcanized.html'
          }]
        },
        files: {
          '<%= yeoman.dist_public %>/index.html': ['<%= yeoman.dist_public %>/index.html']
        }
      }
    },
    vulcanize: {
      default: {
        options: {
          strip: true
        },
        files: {
          '<%= yeoman.dist_public %>/elements/elements.vulcanized.html': [
            '<%= yeoman.dist_public %>/elements/elements.html'
          ]
        }
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app_public %>/images',
          src: '{,*/}*.{png,jpg,jpeg,svg}',
          dest: '<%= yeoman.dist_public %>/images'
        }]
      }
    },
    minifyHtml: {
      options: {
        quotes: true,
        empty: true,
        spare: true
      },
      app: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist_public %>',
          src: '*.html',
          dest: '<%= yeoman.dist_public %>'
        }]
      }
    },
    copy: {
      dist_public: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app_public %>',
          dest: '<%= yeoman.dist_public %>',
          src: [
            '*.{ico,txt}',
            '.htaccess',
            '*.html',
            'elements/**',
            '!elements/**/*.scss',
            'images/{,*/}*.{webp,gif}'
          ]
        }, {
          expand: true,
          dot: true,
          dest: '<%= yeoman.dist_public %>',
          src: ['bower_components/**']
        }]
      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.html', '*.js', '*.css'
          ]
        }, {
          expand: true,
          dot: true,
          dest: '<%= yeoman.dist_public %>',
          src: ['bower_components/**']
        }]
      },
      styles: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app_public %>',
          dest: '.tmp',
          src: ['{styles,elements}/{,*/}*.css']
        }]
      },
      manifest: {
        files: [{
          src: '<%= yeoman.app %>/manifest.json',
          dest: '<%= yeoman.dist %>/package.json'
        }]
      },
      assets: {
        files: [{
          expand: true,
          src: [ 'assets/**/*' ],
          cwd: '<%= yeoman.app_public %>/',
          dest: '<%= yeoman.dist_public %>/'
        }]
      },
    },
    'wct-test': {
      local: {
        options: {remote: false}
      },
      remote: {
        options: {remote: true}
      }
    },
    // See this tutorial if you'd like to run PageSpeed
    // against localhost: http://www.jamescryer.com/2014/06/12/grunt-pagespeed-and-ngrok-locally-testing/
    pagespeed: {
      options: {
        // By default, we use the PageSpeed Insights
        // free (no API key) tier. You can use a Google
        // Developer API key if you have one. See
        // http://goo.gl/RkN0vE for info
        nokey: true
      },
      // Update `url` below to the public URL for your site
      mobile: {
        options: {
          url: "https://developers.google.com/web/fundamentals/",
          locale: "en_GB",
          strategy: "mobile",
          threshold: 80
        }
      }
    },
    /* markdown: compile markdown documents, for about text */
    markdown: {
      credits: {
        options: {
          templateContext: {}
        },
        files: [
          {
            src: '<%= yeoman.app %>/about.md',
            dest: '<%= yeoman.dist %>/about.html'
          }
        ]
      }
    },
    /* install-dependencies: load dependencies of the app before packaginf it */
    "install-dependencies": {
      options: {
        cwd: '<%= yeoman.dist %>'
      }
    },
    /* node-webkit: package the app for multiple platforms */
    nodewebkit: {
      options: {
        build_dir: 'builds',
        appName: 'analiz',
        appVersion: grunt.file.readJSON(yeomanConfig.app + '/manifest.json').version,
        credits: yeomanConfig.dist + '/about.html',
        mac: oAppTargets.mac,
        mac_icns: yeomanConfig.dist_public + '/assets/icons/icon.icns',
        win: oAppTargets.win,
        linux32: oAppTargets.linux32,
        linux64: oAppTargets.linux64,
        forceDownload: false
      },
      src: '<%= yeoman.dist %>/**/*'
    },
    /* compress: packaging the binaries into shippable zip */
    compress: {
      options: {
        pretty: true,
        mode: 'zip'
      },
      mac: {
        options: {
          archive: '<%= binaries.releases %>/mac/analiz.zip'
        },
        files: [
          {
            expand: true,
            cwd: '<%= binaries.builds %>/analiz/osx/',
            src: [ '**/*' ]
          }
        ]
      },
      win: {
        options: {
          archive: '<%= binaries.releases %>/win/analiz.zip'
        },
        files: [
          {
            expand: true,
            cwd: '<%= binaries.builds %>/analiz/win/',
            src: [ '**/*' ]
          }
        ]
      },
      linux32: {
        options: {
          archive: '<%= binaries.releases %>/linux32/analiz.zip'
        },
        files: [
          {
            expand: true,
            cwd: '<%= binaries.builds %>/analiz/linux32/',
            src: [ '**/*' ]
          }
        ]
      },
      linux64: {
        options: {
          archive: '<%= binaries.releases %>/linux64/analiz.zip'
        },
        files:
        [
          {
            expand: true,
            cwd: '<%= binaries.builds %>/analiz/linux64/',
            src: [ '**/*' ]
          }
        ]
      }
    },
    'bower-install-simple': {
      server: {
        options: {
          cwd: '<%= yeoman.app %>',
          directory: '../<%= yeoman.dist %>/bower_components'
        }
      }
    }
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'browserSync:dist']);
    }

    grunt.task.run([
      'clean:server',
      'sass:server',
      'copy:styles',
      'autoprefixer:server',
      'browserSync:app',
      'watch'
    ]);
  });

  grunt.registerTask('test:local', ['wct-test:local']);
  grunt.registerTask('test:remote', ['wct-test:remote']);

  grunt.registerTask('build', [
    'clean:dist',
    'sass',
    'copy',
    'bower-install-simple',
    'useminPrepare',
    'imagemin',
    'concat',
    'autoprefixer',
    'uglify',
    'vulcanize',
    'usemin',
    'replace',
    'minifyHtml'
  ]);

  grunt.registerTask('build-bin', [
    'clean:dist',
    'bumpup:prerelease',
    'sass',
    'copy',
    'bower-install-simple',
    'markdown',
    'useminPrepare',
    'imagemin',
    'concat',
    'autoprefixer',
    'uglify',
    'vulcanize',
    'usemin',
    'replace',
    'minifyHtml',
    'install-dependencies',
    'nodewebkit',
    'compress'
  ]);

  grunt.registerTask('default', [
    'jshint',
    // 'test'
    'build'
  ]);
};
