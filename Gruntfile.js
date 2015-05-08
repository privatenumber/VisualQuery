module.exports = function(grunt) {

	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		sass: {
			options: {
				compass: true,
				style: "compressed"
			},
			code: {
				files: {
					'dist/css/VisualQuery.css' : 'src/css/VisualQuery.scss',
					'dist/example/demo.css' : 'src/css/demo.scss'
				}	
			}
		},

		browserify: {
			dist: {
				files: {
					'dist/VisualQuery.js' : ['src/javascript/VisualQuery.js']
				},
				options: {
					browserifyOptions: {
						'standalone': 'VisualQuery'
					}
				}
			}
		},

		jade: {
			debug: {
				options: {
					// data: {
					// 	debug: true,
					// 	timestamp: "<%= grunt.template.today() %>"
					// }
				},
				files: {
					"dist/example/index.html": "src/jade/index.jade"
				}
			}
		},

		jshint: {
			options: {
				'strict': true,
				'curly': true,
				'eqeqeq': true,
				'eqnull': true,
				'camelcase': true,
				'undef': true,
				'expr': true,
				'unused': 'strict',

				// Storing this-based functions elsewhere
				'validthis': true,

				// Allow variable shadowing for 'self'?
				'shadow': true
			},
			grunt: {
				options: {
					globals: {
						'module': true
					}
				},
				files: {
					src: ['Gruntfile.js']
				},
			},
			code: {
				options: {
					'browser': true,
					'jquery': true,
					'devel': true,
					globals: {
						module: true,
						require: true,
						Event: true
					}
				},
				files: {
					src: ['src/javascript/*']
				}
			}
		},

		uglify: {
			// options: {
			// 	banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
			// 	// enclose: { 'window.jQuery': '$' }
			// },

			bundle: {
				// options: {
				// 	mangle: true,
				// 	// beautify: true,
				// 	compress: true
				// },
				src: 'dist/VisualQuery.js',
				dest: 'dist/VisualQuery.min.uglified.js'
			}
		},

		'closure-compiler': {
			frontend: {
				closurePath: '/usr/local/Cellar/closure-compiler/20150315/libexec',
				js: 'dist/VisualQuery.js',
				jsOutputFile: 'dist/VisualQuery.min.closure.js',
				//maxBuffer: 500,
				options: {
					// 'compilation_level': 'ADVANCED',
				//	language_in: 'ECMASCRIPT5_STRICT',
					'language_in': 'ECMASCRIPT5'
				}
			}
		},

		watch: {
			grunt: {
				files: [ 'Gruntfile.js' ],
				options: {
					reload: true
				}
			},
			src: {
				files: ['src/**/*'],
				tasks: ['develop'],
				options: {
					livereload: 35730
				}
			},
			options: {
				spawn: false
			}
		}
	});


	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-closure-compiler');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('default', ['sass', 'jshint', 'jade', 'browserify', 'uglify', 'closure-compiler']);
	grunt.registerTask('develop', ['sass', 'jshint', 'jade', 'browserify', 'watch']);

};