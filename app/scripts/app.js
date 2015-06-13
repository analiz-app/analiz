(function (document) {
  'use strict';

  var app = document.querySelector('#app');

  app.appName = "Analiz";

  app.addEventListener('template-bound', function() {
    console.log('Our app is ready to rock!');
  });

  window.addEventListener('WebComponentsReady', function() {
    document.querySelector('body').removeAttribute('unresolved');
  });

})(document);
