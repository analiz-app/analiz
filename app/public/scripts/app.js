(function (document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');


  app.appName = 'Analyz';
  app.selected_page = 0;

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
    //
    // Toggle button for the drawer
    //
    var drawerPanel = document.getElementById( 'app_content' );
    var drawerPanelToggle = document.getElementById( 'toggle_drawer_icon' );

    drawerPanelToggle.classList.toggle('hide');

    drawerPanel.addEventListener('core-responsive-change', function () {
      drawerPanelToggle.classList.toggle('hide');
    });

    app.toggle_drawer = function ( e ) {
      drawerPanel.togglePanel();
    };
  });



// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document));
