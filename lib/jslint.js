var os = require('os'),
	args = require('args'),
	sys = require('system'),
	parser = new args.Parser(),
	fulljslint = require('fulljslint'),
	io = require('file'),
	util = require('util');

parser.arg('file').optional();

parser.help('Runs JSLint.\nReads from the standard input if no file is specified.');

parser.option('--indent').
	help('the number of spaces used for indentation (default is 4)').
	integer().
	def(4);

parser.option('--maxerr').
	help('the maximum number of warnings reported (default is 50)').
	integer().
	def(50);

parser.option('--maxlen').
	help('the maximum number of characters in a line').
	integer();

parser.option('--predef').
	help('the names of predefined variables').
	push();

fulljslint.options.forEach(function (option) {
	parser.option('--' + option.name).
		help(option.description).
		bool(option.value);
});
	
parser.option('--version').
	help('print JSLint edition and exit.').
	action(function () {
		this.print('JSLint edition ' + fulljslint.version);
		this.exit();
	});

parser.option('-c', '--config').
	help('load the JSLint configuration from a JSON file').
	input();

parser.helpful();

function lint(data, options) {
	if (!fulljslint.JSLINT(data, options)) {
		fulljslint.JSLINT.errors.forEach(function (e) {
			if (e) {
				sys.stdout.print('jslint: Lint at line ' + e.line + ' character ' + e.character + ': ' + e.reason);
				sys.stdout.print((e.evidence || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
				sys.stdout.print('');
			}
		});
		return false;
	}
	return true;
}

function main(args) {
	var options = parser.parse(args),
		data, files;

	if (options.config) {
		try {
			configOptions = JSON.parse(options.config.read());
		} catch (e) {
			parser.error({}, 'Error: JSON configuration file contains syntax errors.');
		}
		options = util.update(options, configOptions);

		delete options.config;
	}

	files = [].concat(options.args);

	// Clean up the options before passing to JSLint
	delete options.args;
	delete options.command;	

	if (files.length) {
		// Use file(s)
		files.forEach(function (file) {
			if (io.isFile(file)) {
				sys.stdout.print("jslint: Checking file '" + file + "'.");
				if (lint(io.read(file), options)) {
					sys.stdout.print("jslint: No problems found in '" + file + "'.");
				}
			} else {
				sys.stdout.print("jslint: File not found '" + file + "'.");
				os.exit(1);
			}
		});
	} else {
		// Read from stdin
		lint(sys.stdin.readLines(), options);
	}
	os.exit(0);
}

main(sys.args);
