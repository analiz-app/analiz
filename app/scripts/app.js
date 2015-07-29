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
    config: [],

    set: function ( property, value ) {
      this[property] = value;
      // If the path and the config are set show the 'Analiz !' button
      if ( this.path && this.config.length > 0 ) {
        document.getElementById( 'analyzeButton' ).disabled = false;
      } else {
        document.getElementById( 'analyzeButton' ).disabled = true;
      }
    }
  };

  /**
   * The analyse function
   * @param  {Object} config Configuration object
   */
  app.analiz = function ( config ) {
    console.dir(config);
    app.toast( 'Lancement de l\'analyse...');

    app.isAudit = true;
    app.selected = 2;
  };

  app.isAudit = false;

  // Default page
  app.selected = 2;

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

})(document);
