(function (document) {
  'use strict';

  var app = document.querySelector('#app');

  app.appName = "Analiz";

  // Default page
  app.selected = 0;

  var colors = [
    {
      'main': 'red',
      'accent': 'green'
    }, {
      'main': 'pink',
      'accent': 'light-green'
    }, {
      'main': 'purple',
      'accent': 'lime'
    }, {
      'main': 'deep-purple',
      'accent': 'yellow'
    }, {
      'main': 'indigo',
      'accent': 'pink'
    }, {
      'main': 'blue',
      'accent': 'orange'
    }, {
      'main': 'light-blue',
      'accent': 'amber'
    }, {
      'main': 'cyan',
      'accent': 'orange'
    }, {
      'main': 'teal',
      'accent': 'red'
    }, {
      'main': 'green',
      'accent': 'purple'
    }, {
      'main': 'light-green',
      'accent': 'pink'
    }, {
      'main': 'lime',
      'accent': 'deep-purple'
    }, {
      'main': 'amber',
      'accent': 'cyan'
    }, {
      'main': 'orange',
      'accent': 'teal'
    }, {
      'main': 'deep-orange',
      'accent': 'light-blue'
    }, {
      'main': 'brown',
      'accent': 'lime'
    }, {
      'main': 'grey',
      'accent': 'blue-grey'
    }, {
      'main': 'blue-grey',
      'accent': 'grey'
    }
  ];

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

  app.addEventListener('template-bound', function() {
    console.log('Our app is ready to rock!');
  });

  window.addEventListener('WebComponentsReady', function() {
    document.querySelector('body').removeAttribute('unresolved');
  });

})(document);
