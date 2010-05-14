var args = require('args'),
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

function main(args) {
	var options = parser.parse(args),
		configOptions = {};

	if (options.config) {
		try {
			configOptions = JSON.parse(options.config.read());
		} catch (e) {
			parser.error({}, 'Error: Configuration file contains JSON syntax errors.');
		}
		options = util.update(options, configOptions);

		delete options.config;
	}

	print(JSON.stringify(options));

	// Clean up the options before passing to JSLint
	delete options.command;
	delete options.args;
	
	
	parser.printHelp(options);
}

main(system.args);
