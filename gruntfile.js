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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.registerTask('default', ['requirejs']);
};