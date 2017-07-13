module.exports = function (grunt) {
    grunt.initConfig({
        requirejs: {
            compile: {
                options: {
                    preserveLicenseComments: false,
                    paths: {
                        tourbus: 'thirdparty/jquery-tourbus.min',
                        bootstrap: 'thirdparty/bootstrap.min',
                        d3: 'thirdparty/d3.min',
                        QuadTree: 'thirdparty/QuadTree',
                        googleChart: 'thirdparty/loader'
                    },
                    baseUrl: 'src',
                    name: '../tools/almond',
                    include: ['../main'],
                    out: 'main.min.js',
                    insertRequire: ['../main'],
                    wrapShim: true,
                    wrap: {
                        startFile: 'tools/wrap.start',
                        endFile: 'tools/wrap.end'
                    }
                }
            }
        },
        uglify: {
            my_target: {
                files: {
                    'src/thirdparty/thirdaparty.min.js': [
                        'src/thirdparty/jquery.min.js',
                        'src/thirdparty/jquery-ui.js',
                        'src/thirdparty/papaparse.js',
                        'src/thirdparty/fancytree.min.js']
                }
            }
        },
        cssmin: {
            target: {
                files: {
                    'style/style.min.css': ['style/*.css']
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    // grunt.registerTask('default', ['requirejs']);
    grunt.registerTask('default', ['cssmin', 'uglify']);
};