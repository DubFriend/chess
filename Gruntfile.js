module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'js/lib/jsmessage.js',
                    'js/lib/log.js',
                    'js/chessboard-0.1.0.js',
                    'js/global.js',
                    'js/board.js',
                    'js/execute.js'
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

    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['qunit', 'concat', 'uglify']);

};
