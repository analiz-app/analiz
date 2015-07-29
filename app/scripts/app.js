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
  app.npmPrefix = 'resources/app';
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
      if ( this.path && this.plugins.length > 0 ) {
        document.getElementById( 'analyzeButton' ).disabled = false;
      } else {
        document.getElementById( 'analyzeButton' ).disabled = true;
      }
    }
  };

  /**
   * The analyse function
   * @param  {Object} data Data configuration object
   */
  app.analiz = function ( data ) {
    var files;
    app.toast( 'Lancement de l\'analyse...');

    // Get all the files in the directory
    walk( data.path, function ( err, files ) {
      // Run the plugins one by one
      data.plugins.forEach( function ( plugin ) {
        // Prepare the parameters
        var parameters = {
          files: [],
          options: plugin.config.options
        };

        // Get the files the plugin need
        files.forEach( function( file ) {
          if ( plugin.config.fileTypes.indexOf( app.directory.path.extname( file ) ) >= 0 ) {
            parameters.files.push( file );
          }
        } );

        // Run the plugin
        plugin.run( parameters.files, parameters.options, app.getAnalyzeResults );
      } );
    } );
  };

  app.getAnalyzeResults = function ( error, results ) {
    app.isAudit = true;
    app.selected = 2;
  };

  app.isAudit = false;

  // Default page
  app.selected = 0;

  var i = 0;

  window.addEventListener( 'WebComponentsReady', function() {
    document.querySelector( 'body' ).removeAttribute( 'unresolved' );
    app.isNarrow = document.getElementById('paperDrawerPanel').narrow;
  });

  // About dialog
  app.aboutOpen = function ( e ) {
    document.querySelector( '.settings-dropdown' ).close();
    document.querySelector( 'about-dialog paper-dialog' ).open();
  };

  app.results = [
    {
      category: 'html',
      name: 'Validation HTML'
    },{
      category: 'css',
      name: 'Validation CSS'
    },{
      category: 'js',
      name: 'JSHint'
    },{
      category: 'misc',
      name: 'Contraste'
    },{
      category: 'html',
      name: 'Analyse syntaxique'
    },
  ];

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
