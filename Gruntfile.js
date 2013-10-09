var path = require('path'),
    fs = require('fs');

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('assemble');

    //explicity set source files because order is important
    var srcFiles = [
        '<%= dirs.src %>/main.js'
    ],
    banner = [
        '/**',
        ' * @license',
        ' * <%= pkg.longName %> - v<%= pkg.version %>',
        ' * Copyright (c) 2013, Chad Engler',
        ' * <%= pkg.homepage %>',
        ' *',
        ' * Compiled: <%= grunt.template.today("yyyy-mm-dd") %>',
        ' *',
        ' * <%= pkg.longName %> is licensed under the <%= pkg.license %> License.',
        ' * <%= pkg.licenseUrl %>',
        ' */',
        ''
    ].join('\n');

    //Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dirs: {
            build: 'build',
            less: 'src/less',
            src: 'src/js',
            vendor: 'vendor',
            layouts: 'src/templates/layouts',
            pages: 'src/templates/pages'
        },
        files: {
            intro: '<%= dirs.src %>/intro.js',
            outro: '<%= dirs.src %>/outro.js',
            less: '<%= dirs.less %>/main.less',
            buildJs: '<%= dirs.build %>/js/<%= pkg.name %>.js',
            buildJsMin: '<%= dirs.build %>/js/<%= pkg.name %>.min.js',
            buildCss: '<%= dirs.build %>/css/<%= pkg.name %>.css',
            buildCssMin: '<%= dirs.build %>/css/<%= pkg.name %>.min.css'
        },
        replace: {
            dist: {
                options: {
                    variables: {
                        'VERSION': '<%= pkg.version %>'
                    },
                    prefix: '@@'
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= files.buildJs %>', '<%= files.buildJsMin %>'],
                        dest: '<%= dirs.build %>'
                    }
                ]
            }
        },
        clean: {
            all: '<%= dirs.build %>'
        },
        // Copy vendor files into build folder.
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= dirs.vendor %>',
                        src: '**',
                        dest: '<%= dirs.build %>'
                    }
                ]
            }
        },       
        concat: {
            options: {
                banner: banner
            },
            dist: {
                src: ['<%= files.intro %>'].concat(srcFiles).concat(['<%= files.outro %>']),
                dest: '<%= files.buildJs %>'
            }
        },
        uglify: {
            options: {
                banner: banner,
                mangle: true
            },
            dist: {
                src: '<%= files.buildJs %>',
                dest: '<%= files.buildJsMin %>'
            }
        },
        jshint: {
            beforeconcat: srcFiles,
            options: {
                /* Enforcement options */
                bitwise: false,     //allow bitwise operators
                camelcase: false,   //must use camelCase or UPPER_CASE
                curly: false,       //one line conditionals w/o braces are allowed
                eqeqeq: true,       //must use === if possible
                forin: false,       //forin loops much check hasOwnProperty
                immed: true,        //self-calling functions must be wrapped in parens
                latedef: true,      //can't use a variable until it is defined
                newcap: true,       //ctor names must be Captialized
                noarg: true,        //arguments.caller/callee are deprecated, disallow
                noempty: true,      //warn about empty blocks
                nonew: true,        //no using `new Constructor();` without saving the value (no using only side-effects)
                plusplus: false,    //you can use unary increment and decrement operators
                quotmark: true,     //quotes must be consistent
                unused: true,       //warn about declared but not used variables
                strict: false,      //do not require functions to be able to run in strict-mode
                trailing: true,     //help prevent weird whitespace errors in multi-line strings using \ 
                maxlen: 200,        //no line should be longer than 120 characters

                /* Relaxing Options */
                boss: true,        //do not warn about the use of assignments in cases where comparisons are expected

                /* Environments */
                browser: true,      //this runs in a browser :)
                devel: false,       //warn about using console.log and the like
                jquery: false,      //no jquery used here
                node: false,        //no node support...YET! :)
                worker: false,       //web-workers are not used

                /* Globals */
                undef: true,
                globals: {
                    gf: false,
                    PIXI: false
                }
            }
        },
        less: {
            dev: {
                options: {
                    paths: ['<%= dirs.less %>']
                },
                files: {
                    '<%= files.buildCss %>': '<%= files.less %>'
                }
            },
            prod: {
                options: {
                    paths: ['<%= dirs.less %>'],
                    yuicompress: true
                },
                files: {
                    '<%= files.buildCssMin %>': '<%= files.less %>'
                }
            }
        },
        watch: {
            options: {
                interrupt: true
            },
            less: {
                files: '<%= dirs.less %>/**/*.less',
                tasks: ['buildCss']
            },
            scripts: {
                files: '<%= dirs.src %>/**/*.js',
                tasks: ['buildJs']
            },
            templates: {
                files: ['<%= dirs.layouts %>/*.hbs', '<%= dirs.pages %>/**/*.hbs'],
                tasks: ['buildHbs']
            }
        },
        connect: {
            test: {
                options: {
                    port: grunt.option('port-test') || 9002,
                    base: './',
                    keepalive: true
                }
            }
        },
        assemble: {
            options: {
                assets: '<%= dirs.build %>',
                layoutdir: '<%= dirs.layouts %>',
                layout: 'default.hbs',
                flatten: true
            },
            index: {
                files: {
                    '<%= dirs.build %>/index/': ['<%= dirs.pages %>/index/index.hbs']
                }
            }

        }
    });

    //default task
    grunt.registerTask('default', ['hint', 'clean', 'copy', 'buildJs', 'buildCss', 'assemble']);

    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('buildJs', ['concat', 'uglify', 'replace']);
    grunt.registerTask('buildCss', ['less:dev', 'less:prod']);
    grunt.registerTask('buildHbs', ['assemble']);

    grunt.registerTask('dev', ['default', 'watch']);
};