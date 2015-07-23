(function (document) {
  'use strict';

  var app = document.querySelector('#app');

  app.appName = "Analiz";

  app.npm = require("npm");
  app.modulesDir = 'resources/app';

  app.remote = require('remote');

  app.directory = require('directory-tree');
  app.directory.fs = require('fs');
  app.dateFormat = require('dateformat');

  var colors = require('./_colors.js');

  // Default page
  app.selected = 0;

  var i = 0;
  app.filters = [
    {
      'id': i++,
      'name': "Validation W3C",
      'color': colors[Math.floor(Math.random()*colors.length)]
    },
    {
      'id': i++,
      'name': "Analyse syntaxique",
      'color': colors[Math.floor(Math.random()*colors.length)]
    },
    {
      'id': i++,
      'name': "Plan du document",
      'color': colors[Math.floor(Math.random()*colors.length)]
    },
    {
      'id': i++,
      'name': "Rapport sur les feuilles de styles",
      'color': colors[Math.floor(Math.random()*colors.length)]
    },
    {
      'id': i++,
      'name': "Microdatas et microformats",
      'color': colors[Math.floor(Math.random()*colors.length)]
    },
    {
      'id': i++,
      'name': "Attributs ARIA",
      'color': colors[Math.floor(Math.random()*colors.length)]
    },
    {
      'id': i++,
      'name': "Contraste",
      'color': colors[Math.floor(Math.random()*colors.length)]
    },
  ];

  window.addEventListener('WebComponentsReady', function() {
    document.querySelector('body').removeAttribute('unresolved');
  });

})(document);
