module.exports = function () {
  var that = this;

  return this.async.waterfall([
    // Get the plugins name
    function ( callback ) {


      that.npm.load( { 'prefix': that.npmPrefix }, function () {
        that.npm.commands.ls( [], true, function ( error, data ) {
          var pluginsName = [];

          // Get the name of the analiz plugins only
          Object.keys( data.dependencies ).map( function ( key ) {
            if ( data.dependencies[key].name.substr(0, 13) == 'analiz-plugin' ) {
              pluginsName.push( data.dependencies[key].name );
            }
          } );

          callback( null, pluginsName );
        });
      });
    },
    // Require the plugins & fill app.filters
    function ( pluginsName, callback ) {
      var plugins = [];
      pluginsName.forEach( function ( element, index, array ) {
        var plugin = require( element );
        plugin.color = that.categories[plugin.config.category];
        plugins.push( plugin );
      } );

      document.getElementById('filter-list-loader').classList.add('hide');
      app.toast( 'Les plugins sont chargés' );
      that.filters = plugins;
    }
  ]);
};
