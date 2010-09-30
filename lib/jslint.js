/**
 * JSLint - Node.js front-end v0.3.0
 *
 * Licensed under the revised BSD License.
 * Copyright 2010 Bram Stein
 * All rights reserved.
 */
var opts = require('opts'),
    fs = require('fs'),
    puts = require('sys').puts,
	jslintcore = require('jslint-core'),
    options = [
        {
            long: 'indent',
            description: 'the number of spaces used for indentation (default is 4)',
            value: true
        },
        {
            long: 'maxerr',
            description: 'the maximum number of warnings reported (default is 50)',
            value: true
        },
        {
            long: 'maxlen',
            description: 'the maximum number of characters in a line',
            value: true
        },
        {
            long: 'predef',
            description: 'Comma separated names of predefined variables',
            value: true
        }
    ];

function lint(data, options) {
	if (!jslintcore.JSLINT(data, options)) {
		jslintcore.JSLINT.errors.forEach(function (e) {
			if (e) {
				process.stdout.write('jslint: Lint at line ' + e.line + ' character ' + e.character + ': ' + e.reason + '\n');
				process.stdout.write((e.evidence || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1") + '\n');
				process.stdout.write('\n');
			}
		});
		return false;
	}
	return true;
}

exports.main = function() {
    var files = [],
        lintOptions = {},
        config = {},
        key = null,
        stdin = null,
        buffer = '';

    // Add the jslint core options
    jslintcore.options.forEach(function (option) {
        options.push({
            long: option.name,
            description: option.description
        });
    });

    // Version switch
    options.push({
        long: 'version',
        short: 'v',
        description: 'print JSLint edition and exit',
        callback: function () {
            puts('JSLint edition ' + jslintcore.edition);
        }
    });

    // Configuration file
    options.push({
        long: 'config',
        short: 'c',
        description: 'load the JSLint configuration from a JSON file',
        value: true
    });

    opts.parse(options, [], true);

    // Build the lint options
    jslintcore.options.forEach(function (option) {
        lintOptions[option.name] = !!opts.get(option.name);
    });

    // FIXME: this also defaults zero to <default>
    lintOptions['indent'] = parseInt(opts.get('indent')) || 4;
    lintOptions['maxerr'] = parseInt(opts.get('maxerr')) || 50;
    if (parseInt(opts.get('maxlen'))) {
        lintOptions['maxlen'] = parseInt(opts.get('maxlen'));
    }
    lintOptions['predef'] = (opts.get('predef') || '').split(',');

    var config = opts.get('config') || null;

    if (opts.get('config')) {
        config = JSON.parse(fs.readFileSync(opts.get('config'), 'utf8')) || {};

        for (key in config) {
            // only overwrite configuration options if they are not specified on the command line
            if (config.hasOwnProperty(key) && !opts.get(key)) {
                lintOptions[key] = config[key];
            }
        }
    }

    if (opts.args().length !== 0) {
        opts.args().forEach(function (file) {
            fs.readFile(file, 'utf8', function (err, data) {
                if (err) {
                    process.stdout.write("jslint: File not found '" + file + "'.\n");
                    process.exit(1);
                } else {
                    process.stdout.write("jslint: Checking file '" + file + "'.\n");
                    if (lint(data, lintOptions)) {
                        process.stdout.write("jslint: No problems found in '" + file + "'.\n");
                    }
                }
            });
        });
    } else {
        // read from stdin
        stdin = process.openStdin();
        stdin.setEncoding('utf8');

        // JSLint doesn't stream so we buffer :(
        stdin.on('data', function (chunk) {
            buffer += chunk;
        });

        stdin.on('end', function () {
            if(!lint(buffer, lintOptions)) {
                process.exit(1);
            }
        });
    }
};
