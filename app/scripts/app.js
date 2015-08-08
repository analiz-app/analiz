(function ( document ) {
  'use strict';

  var app = document.querySelector( '#app' );

  app.appName = "Analiz";

  /**
   * Require modules
   */
  app.remote = require( 'remote' );
  app.npm = require( 'npm' );
  app.async = require( 'async' );
  app.categories = require( './categories.js' );
  app.getFilters = require( './moduleLister.js' );
  app.directory = require( 'directory-tree' );
  app.directory.fs = require( 'fs' );
  app.directory.path = require( 'path' );
  app.dateFormat = require( 'dateformat' );
  app.i18n = require("i18n");
  var settingsFile = app.directory.path.resolve( __dirname, '..', 'settings.json' );
  app.settings = require( settingsFile );

  app.npmPrefix = app.directory.path.resolve( __dirname, '..' );

  /**
   * Configure i18n
   */
  app.i18n.configure({
    locales:['en', 'fr'],
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
  app.getFilters();

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
          callback( app.__( 'No files' ) );
        }

        // Get the options the plugin need
        plugin.config.options.forEach( function( option ) {
          var optionData;
          if ( option.type != 'separator' ) {
            if ( Array.isArray( option.data ) ) {
              optionData = ( option.value !== undefined ) ? option.value : option.data[ 0 ].value;
            } else {
              optionData = option.data;
            }

            parameters.options[ option.name ] = optionData;
          }
        } );

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

          if ( error ) {
            callback( error );
          }

          // Store the analyze results
          if ( !app.analyzeResults[ app.currentPlugin.id ] ) {
            app.analyzeResults[ app.currentPlugin.id ] = {
              name: app.currentPlugin.config.name,
              category: app.currentPlugin.config.category,
              options: app.currentPlugin.config.options,
              fileCount: app.currentPlugin.fileCount,
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
                app.selected = 2;
              } else {
                  app.loadingModal.set( 'data.fileValue', 0 );
                  app.loadingModal.set( 'data.fileCount', 0 );
              }
              callback();
            }, 500);
          }
        } );
      }, function ( err ) {
        app.error( app.__( 'Analysis error' ), err );
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
    document.querySelector( 'body' ).removeAttribute( 'unresolved' );
    app.isNarrow = document.getElementById('paperDrawerPanel').narrow;

    app.loadingModal = document.querySelector('loading-modal');
  });

  // About dialog
  app.aboutOpen = function ( e ) {
    document.querySelector( '.settings-dropdown' ).close();
    document.querySelector( 'about-dialog paper-dialog' ).open();
  };

  app.changeLanguage = function ( e ) {
    app.settings.language = (app.settings.language == 'fr') ? 'en' : 'fr';
    app.directory.fs.writeFileSync( settingsFile, JSON.stringify(app.settings) );

    app.remote.getCurrentWindow().reload();
  };

  app.filterResults = function ( e ) {
    app.changeTab();
    document.querySelector( '.result-card-' + e.detail.name ).classList.toggle( 'hide-result-card' );
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

})(document);
