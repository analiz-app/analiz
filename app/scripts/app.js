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
    var files;

    app.loadingModal.set( 'data.pluginTotal', data.plugins.length);
    // Open the loader modal
    app.loadingModal.open();

    // Get all the files in the directory
    walk( data.path, function ( err, files ) {
      // Run the plugins one by one
      data.plugins.forEach( function ( plugin, index ) {
        // Prepare the parameters
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

        // Get the options the plugin need
        plugin.config.options.forEach( function( option ) {
          parameters.options[option.name] = option.data;
        } );

        // Set the loading data for the current plugin
        app.loadingModal.push( 'data.name', plugin.config.name );
        app.loadingModal.set( 'data.fileTotal', parameters.files.length );

        app.currentPlugin[ plugin.config.name.en ] = {
          id: index,
          config: plugin.config,
          fileCount: parameters.files.length
        };

        // Run the plugin
        plugin.run( parameters.files, parameters.options, app.loadingResults );
      } );
    } );
  };

  app.loadingResults = function ( error, results ) {
    var pluginId = app.currentPlugin[ results.name.en ].id;
    // Store the analyze results
    if ( !app.analyzeResults[ pluginId ] ) {
      app.analyzeResults[ pluginId ] = {
        name: app.currentPlugin[ results.name.en ].config.name,
        category: app.currentPlugin[ results.name.en ].config.category,
        options: app.currentPlugin[ results.name.en ].config.options,
        data: []
      };
    }
    app.analyzeResults[ pluginId ].data.push( results );

    // Set the file progress
    app.loadingModal.set( 'data.fileCount', app.loadingModal.data.fileCount + 1 );
    app.loadingModal.set( 'data.fileValue', Math.round( ( ( 100 * app.loadingModal.data.fileCount ) / app.loadingModal.data.fileTotal ) / app.loadingModal.data.pluginTotal ) );
    // Verify if all the files for the current plugin has been analyzed
    if ( app.loadingModal.data.fileCount == app.loadingModal.data.fileTotal ) {
      // Set the plugin progress
      app.loadingModal.set( 'data.pluginCount', app.loadingModal.data.pluginCount + 1 );
      app.loadingModal.set( 'data.pluginValue', Math.round( ( 100 * app.loadingModal.data.pluginCount ) / app.loadingModal.data.pluginTotal ));
      // Verify if the analyze is over
      if ( app.loadingModal.data.pluginCount == app.loadingModal.data.pluginTotal ) {
        app.isLoaded( app.analyzeResults );
      } else {
        app.loadingModal.set( 'data.fileCount', 0);
      }
    }
  };

  app.isLoaded = function ( results ) {
    // Close the modal, reset the loader and show the audit page
    document.querySelector('loading-modal').close();
    setTimeout(function () {
      document.querySelector('loading-modal').reset();
    }, 500);
    app.toast( app.__( 'Scan completed!' ) );

    app.analyzeResults = [];

    document.querySelector('page-audit').set('data', results);

    app.isAudit = true;
    app.selected = 2;
  };

  app.isAudit = false;

  app.changeTab = function ( e ) {
    document.querySelector( 'page-audit #pages' ).selected = 0;
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
