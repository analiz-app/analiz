"use strict";

var pkg = require( "./package.json" ),
    sOSName = require( "os-name" )().toLowerCase().split( " " ).join( "" ),
    $ = require( "jquery" );

$( function() {
    $( "body" ).addClass( sOSName );

    console.log( pkg.name, "(version", pkg.version, "): launched." );

    // uncomment the following line to show the console at app' startup
    require( "nw.gui" ).Window.get().showDevTools();
} );
