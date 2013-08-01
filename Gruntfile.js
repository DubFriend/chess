module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: ['Gruntfile.js', 'js/**/*.js'],
            options: {
                ignores: [
                    'js/chessboard-0.1.0.js',
                    'js/lib/underscore.js',
                    'js/lib/jquery-2.0.3.js',
                    'js/test/qunit-1.12.0.js',
                    'js/lib/jsmessage.js',
                    'js/intro.js',
                    'js/outro.js'
                ]
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'js/intro.js',
                    'js/lib/jsmessage.js',
                    'js/chessboard-0.1.0.js',
                    'js/global.js',
                    'js/piece.js',
                    'js/board.js',
                    'js/execute.js',
                    'js/outro.js'
                ],
                dest: '<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    '<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },

        qunit: {
            files: ['js/test/index.html']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);

};
