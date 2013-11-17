module.exports = function(grunt) {
    var glob = require('glob'),
        source = glob.sync('src/js/**/*.js'),//.filter(function(v) { return v.indexOf('vendor') === -1; }),
        testPort = grunt.option('port-test') || 9002,
        pkg = grunt.file.readJSON('package.json'),
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
        pkg: pkg,
        dirs: {
            build: 'build',
            less: 'src/less',
            src: 'src/js',
            vendor: 'vendor',
            game: 'game',
            imgs: 'src/img',
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
                    },
                    {
                        expand: true,
                        cwd: '<%= dirs.imgs %>',
                        src: '**',
                        dest: '<%= dirs.build %>/img'
                    }/*,
                    {
                        expand: true,
                        cwd: '<%= dirs.game %>',
                        src: '**',
                        dest: '<%= dirs.build %>/game'
                    }*/
                ]
            }
        },
        concat: {
            options: {
                banner: banner
            },
            dist: {
                src: ['<%= files.intro %>'].concat(source).concat(['<%= files.outro %>']),
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
            beforeconcat: source.concat('Gruntfile.js'),
            options: {
                jshintrc: '.jshintrc'
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
                files: ['<%= dirs.src %>/**/*.js','<%= dirs.game %>/**/*.js'],
                tasks: ['buildJs']
            },
            templates: {
                files: ['<%= dirs.layouts %>/*.hbs', '<%= dirs.pages %>/**/*.hbs'],
                tasks: ['buildHbs']
            },
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: ['default'],
                options: {
                    interrupt: true
                }
            },
            grapefruit: {
                files: '../grapefruit/src/**/*.js',
                tasks: ['grape'],
                options: {
                    spawn: false
                }
            }
        },
        connect: {
            dev: {
                options: {
                    port: testPort,
                    base: '<%= dirs.build %>',
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
                    '<%= dirs.build %>/index': ['<%= dirs.pages %>/index/index.hbs']
                }
            }

        }
    });

    //load NPM tasks
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

    //default task
    grunt.registerTask('default', ['hint', 'clean', 'copy', 'buildJs', 'buildCss', 'assemble']);

    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('buildJs', ['concat', 'uglify', 'replace']);
    grunt.registerTask('buildCss', ['less:dev', 'less:prod']);
    grunt.registerTask('buildHbs', ['assemble']);

    grunt.registerTask('dev', ['default', 'watch']);

    grunt.registerTask('grape', 'rebuild grapefruit', function() {
        var done = this.async();

        require('child_process').exec('cd ../grapefruit && rm -rf build/gf.js__temp && grunt urequire:dev && cp build/gf.js ../grapefruitjs.org/vendor/js/',
            function(error, stdout, stderr) {
                console.log('\n' + stdout);

                if(stderr)
                    console.log(stderr);

                if(error)
                    console.log(error);

                done(!error);
            }
        );
    });
};