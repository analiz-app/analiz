(function (document) {
  'use strict';

  var app = document.querySelector('#app');

  app.appName = "Analiz";
  
  app.remote = require('remote');
  app.npm = require('npm');
  app.async = require('async');
  app.categories = require('./categories.js');
  app.getFilters = require('./moduleLister.js');
  app.directory = require('directory-tree');
  app.directory.fs = require('fs');
  app.dateFormat = require('dateformat');

  app.npmPrefix = 'resources/app';
  app.filters = [];
  app.getFilters();

  // Default page
  app.selected = 0;

  var i = 0;

  window.addEventListener('WebComponentsReady', function() {
    document.querySelector('body').removeAttribute('unresolved');
  });

})(document);
