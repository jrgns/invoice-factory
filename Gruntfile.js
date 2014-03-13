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
          join: true, bare: true
        },
        files: {
          'src/invoice.js': 'src/*.coffee'
        }
      },
      compileSpec: {
        options: {
          join: true, bare: true
        },
        files: {
          'spec/InvoiceSpec.js': 'spec/*.coffee'
        }
      }
    },

    uglify: {
      build: {
        files: {
          'web/assets/js/invoice-factory.js': [ 'src/templating.js', 'src/invoice.js' ]
        }
      }
    },

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: [ 'src/templating.js', 'src/invoice.js' ],
        dest: 'web/assets/js/invoice-factory.js',
      },
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
        src: 'web/assets/js/invoice-factory.js',
        options: {
          specs: 'spec/InvoiceSpec.js',
          vendor: [
            'http://code.jquery.com/jquery-1.10.1.min.js'
          ]
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task(s).
  grunt.registerTask('debug', ['coffeelint', 'coffee', 'concat', 'jasmine']);

  grunt.registerTask('default', ['coffeelint', 'coffee', 'uglify']);

  grunt.registerTask('test', ['default', 'jasmine']);

  grunt.registerTask('build', ['test', 'compress']);

};
