module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffeelint: {
        all: ['src/*.coffee', 'spec/*.coffee']
    },
    coffee: {
      compile: {
        options: {
          join: true
        },
        files: {
          'web/assets/js/invoice.js': 'src/*.coffee'
        }
      },
      compileSpec: {
        files: [{
          expand: true,
          flatten: true,
          src: ['spec/*Spec.coffee'],
          dest: 'spec/',
          ext: '.js'
        }]
      }
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
    },
    jasmine: {
      invoice: {
        src: 'src/invoice.js',
        options: {
          specs: 'spec/*Spec.js'
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-compress');

  // Default task(s).
  grunt.registerTask('default', ['coffeelint', 'coffee']);

  grunt.registerTask('full', ['coffeelint', 'coffee', 'compress']);

};
