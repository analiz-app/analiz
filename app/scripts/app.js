(function ( document ) {
  'use strict';

  var app = document.querySelector( '#app' );

  app.appName = "Analiz";

  app.remote = require( 'remote' );
  app.npm = require( 'npm' );
  app.async = require( 'async' );
  app.categories = require( './categories.js' );
  app.getFilters = require( './moduleLister.js' );
  app.directory = require( 'directory-tree' );
  app.directory.fs = require( 'fs' );
  app.dateFormat = require( 'dateformat' );

  app.toast = function ( message ) {
    var toast = document.getElementById('toast');

    toast.text = message;
    toast.show();
  };

  app.npmPrefix = 'resources/app';
  app.filters = [];
  app.getFilters();

  // Analyze config object
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

  app.analiz = function ( config ) {
    console.dir(config);
    app.toast( 'Lancement de l\'analyse...');
  };

  // Default page
  app.selected = 0;

  var i = 0;

  window.addEventListener( 'WebComponentsReady', function() {
    document.querySelector( 'body' ).removeAttribute( 'unresolved' );
  });

  // About dialog
  app.aboutOpen = function ( e ) {
    document.querySelector( '.settings-dropdown' ).close();
    document.querySelector( 'about-dialog paper-dialog' ).open();
  };

})(document);
