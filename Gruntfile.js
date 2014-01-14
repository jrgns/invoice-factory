module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'web/assets/js/invoice.min.js'
      }
    },
    jshint: {
        all: ['Gruntfile.js', 'src/*.js', 'test/*.js']
    },
    qunit: {
        all: ['test/**/*.html']
    },
    compress: {
      main: {
        options: {
          archive: "<%= pkg.name %>_<%= pkg.version %>.zip",
        },
        files: [
          { src: ['web/**'], dest: '/', filter: 'isFile' },
          { src: ['Readme.md'], dest: '/', filter: 'isFile' }
        ]
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-compress');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify']);

  grunt.registerTask('full', ['jshint', 'uglify', 'qunit', 'compress']);

};
