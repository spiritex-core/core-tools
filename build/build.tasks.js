'use strict';

module.exports = {

	//---------------------------------------------------------------------
	Context: {
		Package: require( '../package.json' ),
		// AWS_ProfileName: 'admin',
		// AWS_BucketName: 'jsongin.liquicode.com',
	},


	//---------------------------------------------------------------------
	run_tests: [

		// Run tests and capture the output.
		{
			$Shell: {
				command: 'npx mocha -u bdd tests/**/*.tests.js --timeout 0 --slow 1000',
				out: { filename: 'tests.md' },
				err: { console: true },
			}
		},
		{ $PrependTextFile: { filename: 'tests.md', value: '# ${Package.name}\n\n> Version: ${Package.version}\n\n## Test Results\n\n```\n' } },
		{ $AppendTextFile: { filename: 'tests.md', value: '```\n' } },

	],


	//---------------------------------------------------------------------
	build_docs: [

		// Generate: readme.md
		{
			$Shell: {
				command: 'node build/build-readme.js',
				out: { console: true },
				err: { console: true },
			}
		},

		// Generate: version.md
		{
			$ExecuteEjs: {
				ejs_string: '<%- Context.Package.version %>',
				use_eval: true,
				out: { filename: 'version.md' },
			}
		},

	],


	//---------------------------------------------------------------------
	git_publish: [

		// Update github and finalize the version.
		{
			$Shell: {
				command: 'git add .',
				out: { console: true },
				err: { console: true },
				halt_on_error: false
			}
		},
		{
			$Shell: {
				command: 'git commit --quiet -m "Finalization for v${Package.version}"',
				out: { console: true },
				err: { console: true },
				halt_on_error: false
			}
		},
		{
			$Shell: {
				command: 'git push --quiet origin main',
				out: { console: true },
				err: { console: true },
				halt_on_error: false
			}
		},
		// Tag the existing version
		{
			$Shell: {
				command: 'git tag -a v${Package.version} -m "Version v${Package.version}"',
				out: { console: true },
				err: { console: true },
				halt_on_error: false
			}
		},
		{
			$Shell: {
				command: 'git push --quiet origin v${Package.version}',
				out: { console: true },
				err: { console: true },
				halt_on_error: false
			}
		},

	],


	//---------------------------------------------------------------------
	npm_publish: [

		// Update npmjs.com with new package.
		{
			$Shell: {
				command: 'npm publish . --access public',
				// output: 'console', errors: 'console', halt_on_error: false
				out: { console: true },
				err: { console: true },
				halt_on_error: false
			}
		},

	],


	//---------------------------------------------------------------------
	publish_version: [

		// Finalize and publish the existing version.
		{ $RunTask: { task: 'run_tests' } },
		{ $RunTask: { task: 'build_docs' } },
		{ $RunTask: { task: 'git_publish' } },
		{ $RunTask: { task: 'npm_publish' } },

	],


	//---------------------------------------------------------------------
	start_new_version: [

		// Increment and update the official package version.
		{ $SemverInc: { context: 'Package.version' } },
		{
			$PrintContext: {
				context: 'Package',
				out: { as: 'json-friendly', filename: 'package.json' },
			}
		},

		// Reload the package file.
		{
			$ReadJsonFile: {
				filename: 'package.json',
				out: { context: 'Package' },
			}
		},

		// Rebuild the docs.
		{ $RunTask: { task: 'build_docs' } },

		// Update github with the new version.
		{
			$Shell: {
				command: 'git add .',
				out: { console: true },
				err: { console: true },
				halt_on_error: false
			}
		},
		{
			$Shell: {
				command: 'git commit --quiet -m "Initialization for v${Package.version}"',
				out: { console: true },
				err: { console: true },
				halt_on_error: false
			}
		},
		{
			$Shell: {
				command: 'git push --quiet origin main',
				out: { console: true },
				err: { console: true },
				halt_on_error: false
			}
		},

	],

};
