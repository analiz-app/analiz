(function ( document ) {
  'use strict';

  var app = document.querySelector( '#app' );

  app.appName = "Analiz";

  /**
   * Require modules
   */
  app.remote = require( 'remote' );
  app.shell = require('shell');
  app.npm = require( 'npm' );
  app.async = require( 'async' );
  app.categories = require( './categories.js' );
  app.getFilters = require( './moduleLister.js' );
  app.directory = require( 'directory-tree' );
  app.directory.fs = require( 'fs' );
  app.directory.path = require( 'path' );
  app.dateFormat = require( 'dateformat' );
  app.i18n = require("i18n");
  app.settingsFile = app.directory.path.resolve( __dirname, '..', 'settings.json' );
  app.settings = require( app.settingsFile );

  app.npmPrefix = app.directory.path.resolve( __dirname, '..' );
  app.pluginsDir = app.directory.path.resolve( app.npmPrefix, 'plugins' );

  /**
   * Configure i18n
   */
  app.languagesAvailable = ['en', 'fr'];
  app.i18n.configure({
    locales: app.languagesAvailable,
    defaultLocale: app.settings.language,
    directory: app.directory.path.resolve(app.npmPrefix, 'locales')
  });

  app.__ = function ( string ) {
    return app.i18n.__( string );
  };

  /**
   * Get the categories list with the correct structure
   */
  app.categoriesList = [];
  Object.getOwnPropertyNames(app.categories).forEach( function ( element, index, array ) {
    app.categoriesList.push( app.categories[element] );
  } );

  /**
   * Show a toast
   * @param  {String} message Toast message
   */
  app.toast = function ( message ) {
    var toast = document.getElementById('toast');

    toast.text = message;
    toast.show();
  };

  /**
   * Get the filters from the external plugins
   */
  app.filters = [];

  /**
   * Analyze config object
   */
  app.analyzeConfig = {
    path: '',
    plugins: [],

    set: function ( property, value ) {
      this[property] = value;

      // If the path and the config are set show the 'Analiz !' button
      document.getElementById( 'analyzeButton' ).disabled = ( this.path && this.plugins.length === 0 );
    }
  };

  app.analyzeResults = [];
  app.currentPlugin = [];

  /**
   * The analyse function
   * @param  {Object} data Data configuration object
   */
  app.analiz = function ( data ) {
    app.loadingModal.set( 'data.pluginTotal', data.plugins.length );
    // Open the loader modal
    app.loadingModal.open();

    // Get all the files in the directory
    walk( data.path, function ( err, files ) {
      var appDir = app.directory.path.basename(data.path);
      // Delete the ignored files
      files.forEach(function( file, index ) {
        // Get an array of the parents folders from the base directory
        var parentFolders = app.directory.path.parse(
            file.replace( data.path , app.directory.path.sep )
          ).dir.split( app.directory.path.sep );

        // Verify if the file is in an ignored folder and delete it
        for (var i = 0; i < parentFolders.length; i++) {
          if ( document.querySelector( 'folder-tree' ).ignoredFiles.inArray( parentFolders[ i ] ) ) {
            delete files[ index ];
            break;
          }
        }
      });

      // Run the plugins one by one
      app.async.forEachOfSeries( data.plugins, function ( plugin, index, callback ) {
        var parameters = {
          files: [],
          options: {}
        };

        // Get the files the plugin need
        files.forEach( function( file ) {
          if ( plugin.config.fileTypes.indexOf( app.directory.path.extname( file ) ) >= 0 ) {
            parameters.files.push( file );
          }
        } );

        // Check if files for the analyze
        if ( parameters.files.length === 0 ) {
          callback( {
            title: app.__( 'Analysis error' ),
            content: app.__( 'No files' )
          } );
        }

        // Get the options the plugin need
        plugin.config.options.forEach( function( option ) {
          var optionData;
          if ( option.type != 'separator' && option.type != 'documentation-link' ) {
            if ( Array.isArray( option.data ) ) {
              optionData = ( option.value !== undefined ) ? option.value : option.data[ 0 ].value;
            } else {
              optionData = option.data;
            }

            parameters.options[ option.name ] = optionData;
          }
        } );

        parameters.options.language = app.settings.language;

        // Set the loading data for the current plugin
        app.loadingModal.set( 'data.name', plugin.config.name );
        app.loadingModal.set( 'data.fileTotal', parameters.files.length );

        app.currentPlugin = {
          id: index,
          config: plugin.config,
          fileCount: parameters.files.length
        };

        ////////////////////
        // Run the plugin //
        ////////////////////
        plugin.run( parameters.files, parameters.options, function ( error, results ) {

          if ( error !== null ) {
            callback( error );
          }

          // Store the analyze results
          if ( !app.analyzeResults[ app.currentPlugin.id ] ) {
            app.analyzeResults[ app.currentPlugin.id ] = {
              name: app.currentPlugin.config.name,
              category: app.currentPlugin.config.category,
              options: app.currentPlugin.config.options,
              fileCount: app.currentPlugin.fileCount,
              type: app.currentPlugin.config.renderType,
              data: []
            };
          }
          app.analyzeResults[ app.currentPlugin.id ].data.push( results );

          // Set the file progress
          app.loadingModal.set( 'data.fileCount', app.loadingModal.data.fileCount + 1 );
          app.loadingModal.set( 'data.fileValue', Math.round( ( 100 * app.loadingModal.data.fileCount ) / app.loadingModal.data.fileTotal ) );

          // Verify if all the files for the current plugin has been analyzed
          if ( app.loadingModal.data.fileCount == app.loadingModal.data.fileTotal ) {

            // Set the plugin progress
            app.loadingModal.set( 'data.pluginCount', app.loadingModal.data.pluginCount + 1 );
            app.loadingModal.set( 'data.pluginValue', Math.round( ( 100 * app.loadingModal.data.pluginCount ) / app.loadingModal.data.pluginTotal ) );

            // Add delay for visual feedback
            setTimeout(function () {
              // Verify if the analyze is over
              if ( app.loadingModal.data.pluginCount == app.loadingModal.data.pluginTotal ) {
                // All the analysis are done
                // Close the modal, reset the loader and show the audit page
                document.querySelector('loading-modal').close();

                // Wait till the modal is hidden to not show the reset to the user
                setTimeout(function () {
                  document.querySelector( 'loading-modal' ).reset();
                }, 500);
                app.toast( app.__( 'Scan completed!' ) );

                // Send the data to the audit page
                document.querySelector( 'page-audit' ).set( 'data', app.analyzeResults );

                // Reset the results variable
                app.analyzeResults = [];

                app.isAudit = true;
                app.selected = 1;
              } else {
                  app.loadingModal.set( 'data.fileValue', 0 );
                  app.loadingModal.set( 'data.fileCount', 0 );
              }
              callback();
            }, 500);
          }
        } );
      }, function ( err ) {
        if ( err ) {
          if ( typeof err == 'string' ) {
            err = {
              title: 'ERROR',
              content: err
            };
          }
          app.error( err.title, err.content );
        }
      } ) ;
    } );
  };

  app.isAudit = false;

  app.changeTab = function ( e ) {
    document.querySelector( 'page-audit #pages' ).selected = 0;
  };

  app.error = function ( title, message ) {
    var errorModal = document.querySelector( 'error-modal' );

    errorModal.data = {
      title: title,
      content: message
    };

    errorModal.open();

  };

  // Default page
  app.selected = 0;

  var i = 0;

  window.addEventListener( 'WebComponentsReady', function() {
    app.getFilters();
    document.querySelector( 'body' ).removeAttribute( 'unresolved' );
    app.isNarrow = document.getElementById('paperDrawerPanel').narrow;

    app.loadingModal = document.querySelector('loading-modal');
  });

  // About dialog
  app.aboutOpen = function ( e ) {
    document.querySelector( '.settings-dropdown' ).close();
    document.querySelector( 'about-dialog paper-dialog' ).open();
  };

  // Settings dialog
  app.settingsOpen = function ( e ) {
    document.querySelector( 'settings-modal' ).settings = app.settings;

    document.querySelector( '.settings-dropdown' ).close();
    document.querySelector( 'settings-modal' ).open();
  };

  // Open plugins folder
  app.pluginOpen = function ( e ) {
    var pluginPath = app.directory.path.resolve( __dirname, '..', 'plugins', 'node_modules' );
    app.shell.openItem(pluginPath);
  };

  app.filterResults = function ( e ) {
    app.changeTab();
    var resultCards = document.querySelectorAll( '.result-card-' + e.detail.name );
    for (var i = 0; i < resultCards.length; i++) {
      resultCards[i].classList.toggle( 'hide-result-card' );
    }
  };

  app.computeItemLanguage = function ( item ) {
    return item[app.settings.language];
  };

  var walk = function(dir, done) {
    var results = [];
    app.directory.fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      var pending = list.length;
      if (!pending) return done(null, results);
      list.forEach(function(file) {
        file = app.directory.path.resolve(dir, file);
        app.directory.fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            walk(file, function(err, res) {
              results = results.concat(res);
              if (!--pending) done(null, results);
            });
          } else {
            results.push(file);
            if (!--pending) done(null, results);
          }
        });
      });
    });
  };

  Array.prototype.inArray = function (value) {
    // Returns true if the passed value is found in the
    // array. Returns false if it is not.
    var i;
    for (i=0; i < this.length; i++) {
      if (this[i] == value) {
        return true;
      }
    }
    return false;
  };

})(document);
