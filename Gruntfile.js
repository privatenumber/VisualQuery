module.exports = function(grunt) {
	'use strict';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		smash: {
			bundle: {
				src: 'src/visualquery.js',
				dest: 'src/<%= pkg.name %>.smashed.js'
			},
		},


		jshint: {
			options: {
				'strict': true,
				'curly': true,
				'eqeqeq': true,
				'eqnull': true,
				'camelcase': true,
				'undef': true,

				globals: {
					jQuery: true
				},
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
			development: {
				options: {
					'browser': true,
					'jquery': true,
					'devel': true

				},
				files: {
					src: ['src/<%= pkg.name %>.smashed.js']
				}
			}
		},

		// concat: {
		// 	options: {
		// 		separator: ';\n'
		// 	},
		// 	dist: {
		// 		src: ['src/*.js'],
		// 		dest: 'dist/<%= pkg.name %>.js'
		// 	}
		// },

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				enclose: { 'window.jQuery': '$' }
			},

			bundle: {
				options: {
					mangle: false,
					beautify: true,
					compress: false
				},
				src: 'src/<%= pkg.name %>.smashed.js',
				dest: 'dist/<%= pkg.name %>.uglify.js'
			},

			bundlemin: {
				options: {
					mangle: true,
					compress: true
				},
				src: 'src/<%= pkg.name %>.smashed.js',
				dest: 'dist/<%= pkg.name %>.uglify.min.js'
			}

			// build: {
			// 	src: 'dist/<%= pkg.name %>.js',
			// 	dest: 'dist/<%= pkg.name %>.uglify.js'
			// }
		},

		'closure-compiler': {
			frontend: {
				closurePath: '/Applications/closure-compiler',
				js: 'src/<%= pkg.name %>.smashed.js',
				jsOutputFile: 'dist/<%= pkg.name %>.closure.js',
				//maxBuffer: 500,
				options: {
				//	compilation_level: 'ADVANCED_OPTIMIZATIONS',
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
				files: ['src/*'],
				tasks: ['development'],
			}
		}
	});


	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-smash');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-closure-compiler');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['smash', 'jshint', 'uglify', 'closure-compiler', 'watch']);
	grunt.registerTask('development', ['smash', 'jshint:development', 'uglify']);

};