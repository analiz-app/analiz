"use strict";

module.exports = function( grunt ) {

    // dynamically loading all grunt files in dev dependencies
    require( "matchdep" ).filterDev( "grunt-*" ).foreach( grunt.loadNpmTasks );

    // App Targets, change values during development, accelerating compilation times
    var oAppTargets = {
        "mac": true,
        "win": true,
        "linux32": true,
        "linux64": true
    };

    // configure tasks
    grunt.initConfig( {
        /* bumpup: incrementing version in app's package.json */
        "bumpup": "src/manifest.json",
        /* clean: empty folders before working */
        "clean": {
            "binaries": [ "bin" ],
            "releases": [ "releases" ]
        },
        /* copy: copy static files */
        "copy": {
            "manifest": {
                "src": "src/manifest.json",
                "dest": "bin/package.json"
            },
            "assets": {
                "expand": true,
                "src": [ "assets/**/*" ],
                "cwd": "src/",
                "dest": "bin/"
            },
            "vendors": {
                "expand": true,
                "src": [ "vendors/**/*" ],
                "cwd": "src/",
                "dest": "bin/"
            }
        },
        /* markdown: compile markdown documents, for about text */
        "markdown": {
            "credits": {
                "options": {
                    "templateContext": {}
                },
                "files": [
                    {
                        "src": "src/about.md",
                        "dest": "bin/about.html"
                    }
                ]
            }
        },
        /* stylus: styles of the application, including kouto-swiss */
        "stylus": {
            "options": {
                "compress": false,
                "use": [
                    require( "kouto-swiss" )
                ]
            },
            "styles": {
                "files": {
                    "bin/css/styles.css": "src/stylus/styles.styl"
                }
            }
        },
        /* install-dependencies: load dependencies of the app before packaginf it */
        "install-dependencies": {
            "options": {
                "cwd": "bin"
            }
        },
        /* node-webkit: package the app for multiple platforms */
        "nodewebkit": {
            "options": {
                "build_dir": "builds",
                "appName": "analiz",
                "appVersion": grunt.file.readJSON( "src/manifest.json" ).version,
                "credits": "bin/about.html",
                "mac": oAppTargets.mac,
                "mac_icns": "bin/assets/icons/icon.icns",
                "win": oAppTargets.win,
                "linux32": oAppTargets.linux32,
                "linux64": oAppTargets.linux64
            },
            "src": "bin/**/*"
        },
        /* compress: packaging the binaries into shippable zip */
        "compress": {
            "options": {
                "pretty": true,
                "mode": "zip"
            },
            "mac": {
                "options": {
                    "archive": "releases/mac/analiz.zip"
                },
                "files": {
                    "expand": true,
                    "cwd": "builds/analiz/osx/",
                    "src": [ "**/*" ]
                }
            },
            "win": {
                "options": {
                    "archive": "releases/win/analiz.zip"
                },
                "files": {
                    "expand": true,
                    "cwd": "builds/analiz/win/",
                    "src": [ "**/*" ]
                }
            },
            "linux32": {
                "options": {
                    "archive": "releases/linux32/analiz.zip"
                },
                "files": {
                    "expand": true,
                    "cwd": "builds/analiz/linux32/",
                    "src": [ "**/*" ]
                }
            },
            "linux64": {
                "options": {
                    "archive": "releases/linux64/analiz.zip"
                },
                "files": {
                    "expand": true,
                    "cwd": "builds/analiz/linux64/",
                    "src": [ "**/*" ]
                }
            }
        },
        /* watch: watching files and launch some tasks at changes */
        "watch": {
            "styles": {
                "files": "src/stylus/styles.styl",
                "tasks": [ "stylus" ]
            }
        }
    } );

    // declare tasks
    grunt.registerTask( "default", [ "build" ] );

    grunt.registerTask( "build", [
        "clean",
        "bumpup:prerelease",
        "copy:manifest",
        "copy:vendors",
        "copy:assets",
        "markdown",
        "stylus",
        "install-dependencies",
        "nodewebkit",
        "compress",
        "clean:bin",
    ] );

    // TODO : install & configure JSHint tasks

};
