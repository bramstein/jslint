/*global require, process, exports*/
/**
 * JSLint - Node.js front-end v0.4.3
 *
 * Licensed under the revised BSD License.
 * Copyright 2010-2011 Bram Stein
 * All rights reserved.
 */
var opts = require('opts'),
    fs = require('fs'),
    puts = require('sys').puts,
    path = require('path'),
    async = require('async'),
    jslintcore = require('jslint-core'),
    boolOptions = [
        {
	        long: "adsafe",
	        value: true,
	        description: "if ADsafe should be enforced"
        },
        {
	        long: "bitwise",
	        value: true,
	        description: "if bitwise operators should not be allowed"
        },
        {
	        long: "browser",
	        value: true,
	        description: "if the standard browser globals should be predefined"
        },
        {
	        long: "cap",
	        value: true,
	        description: "if upper case HTML should be allowed"
        },
        {
	        long: "css",
	        value: true,
	        description: "if CSS workarounds should be tolerated"
        },
        {
	        long: "debug",
	        value: true,
	        description: "if debugger statements should be allowed"
        },
        {
	        long: "devel",
	        value: true,
	        description: "if logging should be allowed (console, alert, etc.)"
        },
        {
	        long: "es5",
	        value: true,
	        description: "if ES5 syntax should be allowed"
        },
        {
	        long: "evil",
	        value: true,
	        description: "if eval should be allowed"
        },
        {
	        long: "forin",
	        value: true,
	        description: "if for in statements must filter"
        },
        {
	        long: "fragment",
	        value: true,
	        description: "if HTML fragments should be allowed"
        },
        {
	        long: "newcap",
	        value: true,
	        description: "if constructor names must be capitalized"
        },
        {
	        long: "nomen",
	        value: true,
	        description: "if names should be checked"
        },
        {
	        long: "on",
	        value: true,
	        description: "if HTML event handlers should be allowed"
        },
        {
	        long: "onevar",
	        value: true,
	        description: "if only one var statement per function should be allowed"
        },
        {
	        long: "passfail",
	        value: true,
	        description: "if the scan should stop on first error"
        },
        {
	        long: "plusplus",
	        value: true,
	        description: "if increment/decrement should not be allowed"
        },
        {
	        long: "regexp",
	        value: true,
	        description: "if the . should not be allowed in regexp literals"
        },
        {
	        long: "rhino",
	        value: true,
	        description: "if the Rhino environment globals should be predefined"
        },
        {
	        long: "undef",
	        value: true,
	        description: "if variables should be declared before used"
        },
        {
	        long: "safe",
	        value: true,
	        description: "if use of some browser features should be restricted"
        },
        {
	        long: "windows",
	        value: true,
	        description: "if MS Windows-specigic globals should be predefined"
        },
        {
	        long: "strict",
	        value: true,
	        description: "require the \"use strict\"; pragma"
        },
        {
	        long: "sub",
	        value: true,
	        description: "if all forms of subscript notation are tolerated"
        },
        {
	        long: "white",
	        value: true,
	        description: "if strict whitespace rules apply"
        },
        {
	        long: "widget",
	        value: true,
	        description: "if the Yahoo Widgets globals should be predefined"
        },

        // These are extension options
        {
            long: 'floop',
            value: true,
            description: 'if function creation in blocks should be allowed'
        },
        {
            long: 'fallthru',
            value: true,
            description: 'if fallthrough on switches should be tolerated'
        },
        {
            long: 'nolint',
            value: true,
            description: 'if linting should be skipped'
        }
    ],
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
        },

        // These options are specific to the JSLint front-end
        {
            long: 'version',
            description: 'print JSLint edition and exit',
            callback: function () {
                puts('JSLint edition ' + jslintcore.JSLINT.edition);
                process.exit(0);
            }
        },
        {
            long: 'dname',
            description: 'the display filename to use when reading from STDIN',
            value: true
        },
        {
            long: 'config',
            description: 'load the JSLint configuration from a JSON file',
            value: true
        },
        {
            long: 'xmlout',
            description: 'File to place XML output into.  This output can be parsed using the Hudson Violations plugin',
            value: true
        }
    ];

function lint(data, options) {
    // Strip the first line if it is a script
    if (data.charAt(0) === '#' && data.charAt(1) === '!') {
        /*jslint regexp:false*/
        data = data.replace(/^#!.*$/m, '');
        /*jslint regexp:true*/
    }

    if (!jslintcore.JSLINT(data, options)) {
        return jslintcore.JSLINT.errors.filter(function (e) {
            return !!e;
        }).map(function (e) {
            return {
                line: e.line,
                character: e.character,
                reason: e.reason,
                evidence: e.evidence
            };
        });
    }
    return [];
}

function encodeXML(value) {
    return (value + '').replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function formatErrors(file, errors, xmlout) {
    errors.forEach(function (e) {
        if (!xmlout) {
            process.stdout.write(file + ': Lint at line ' + e.line + ' character ' + e.character + ': ' + e.reason + '\n');
            process.stdout.write((e.evidence || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1") + '\n');
            process.stdout.write('\n');
        } else {
            process.stdout.write('\t\t<issue char="' + encodeXML(e.character) + '" reason="' + encodeXML(e.reason) + '" line="' + encodeXML(e.line) + '" evidence="' + encodeXML(e.evidence) + '"/>\n');
        }
    });
}

function processFiles(lintOptions) {
    var stdin = null,
        buffer = '',
        files = [],
        xmlout = opts.get('xmlout') === 'true',
        dname = opts.get('dname') || 'stdin';

    if (opts.args().length !== 0) {
        // Sadly we can't run JSLint in parallel because it uses a global
        // error data structure (once that is fixed, changing "series" to
        // "parallel" should give a nice performance boost.
        async.series(opts.args().map(function (file) {
            return function (callback) {
                fs.readFile(file, 'utf8', function (err, data) {
                    var errors = [];

                    if (err) {
                        callback("jslint: File not found '" + file + "'.\n", file, null);
                    } else {
                        errors = lint(data, lintOptions);
                        if (errors.length === 0) {
                            callback(null, file, []);
                        } else {
                            // We treat JSLint errors not as fatal, so we can collect them
                            callback(null, file, errors);
                        }
                    }
                });
            };
        }), function (err, results) {
            if (err) {
                process.stdout.write(err);
                process.exit(1);
            } else {
                if (xmlout) {
                    process.stdout.write('<?xml version="1.0" encoding="utf-8"?>\n');
                    process.stdout.write('<jslint>\n');
                }

                results.forEach(function (result) {
                    if (result[1].length !== 0) {
                        if (!xmlout) {
                            process.stdout.write("jslint: Problems found in '" + result[0] + "'.\n");
                        } else {
                            process.stdout.write('\t<file name="' + encodeXML(result[0]) + '">\n');
                        }
                        formatErrors(result[0], result[1], xmlout);

                        if (xmlout) {
                            process.stdout.write('\t</file>\n');
                        }
                    } else {
                        if (!xmlout) {
                            process.stdout.write("jslint: No problems found in '" + result[0] + "'.\n");
                        } else {
                            process.stdout.write('\t<file name="' + encodeXML(result[0]) + '"/>\n');
                        }
                    }
                });

                if (xmlout) {
                    process.stdout.write('</jslint>\n');
                }
            }
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
            var errors = lint(buffer, lintOptions);

            if (xmlout) {
                process.stdout.write('<?xml version="1.0" encoding="utf-8"?>\n');
                process.stdout.write('<jslint>\n');
            } else {
                process.stdout.write("jslint: Checking file '" + dname + "'.\n");
            }

            if (errors.length !== 0) {
                if (xmlout) {
                    process.stdout.write('\t<file name="' + encodeXML(dname) + '">\n');
                }
                formatErrors(dname, errors, xmlout);
                if (xmlout) {
                    process.stdout.write('\t</file>\n');
                    process.stdout.write('</jslint>\n');
                }
                process.exit(1);
            } else if (opts.get('dname') && !xmlout) {
                if (xmlout) {
                    process.stdout.write('\t<file name="' + encodeXML(dname) + '"/>\n');
                } else {
                    process.stdout.write("jslint: No problems found in '" + opts.get('dname') + "'.\n");
                }
            }
        });
    }
}

function parseConfig(filename, lintOptions) {
    var key = null,
        config = JSON.parse(fs.readFileSync(filename, 'utf8')) || {};

    for (key in config) {
        // only overwrite configuration options if they are not specified on the command line
        if (config.hasOwnProperty(key) && !opts.get(key)) {
            lintOptions[key] = config[key];
        }
    }
}

exports.main = function () {
    var lintOptions = {},
        env = process.env,
        home = env.HOME || null,
        cwd = process.cwd(),
        xmlout = false;

    options = options.concat(boolOptions);

    opts.parse(options, [], true);

    xmlout = opts.get('xmlout') === 'true';

    // Build the lint options
    boolOptions.forEach(function (option) {
        lintOptions[option.name] = opts.get(option.name) === 'true';
    });

    lintOptions.indent = parseInt(opts.get('indent'), 10) === 'number' ? parseInt(opts.get('indent'), 10) : 4;
    lintOptions.maxerr = parseInt(opts.get('maxerr'), 10) === 'number' ? parseInt(opts.get('maxerr'), 10) : 50;

    if (parseInt(opts.get('maxlen'), 10)) {
        lintOptions.maxlen = parseInt(opts.get('maxlen'), 10);
    }
    lintOptions.predef = (opts.get('predef') || '').split(',');

    var config = opts.get('config') || null;

    if (opts.get('config')) {
        path.exists(opts.get('config'), function (exists) {
            if (exists) {
                if (!xmlout) {
                    process.stdout.write("jslint: Using configuration file '" + opts.get('config') + "'.\n");
                }
                parseConfig(opts.get('config'), lintOptions, opts);
            } else {
                if (!xmlout) {
                    process.stdout.write("jslint: Could not read configuration file '" + opts.get('config') + "'.\n");
                }
            }
            processFiles(lintOptions);
        });
    } else {
        path.exists(cwd + '/.jslintrc', function (existsDir) {
            if (existsDir) {
                if (!xmlout) {
                    process.stdout.write("jslint: Using configuration file './.jslintrc'.\n");
                }
                parseConfig(cwd + '/.jslintrc', lintOptions, opts);
                processFiles(lintOptions);
            } else {
                if (home) {
                    path.exists(home + '/.jslintrc', function (existsHome) {
                        if (existsHome) {
                            if (!xmlout) {
                                process.stdout.write("jslint: Using configuration file '~/.jslintrc'.\n");
                            }
                            parseConfig(home + '/.jslintrc', lintOptions, opts);
                            processFiles(lintOptions);
                        } else {
                            path.exists('/etc/jslintrc', function (existsSystem) {
                                if (existsSystem) {
                                    if (!xmlout) {
                                        process.stdout.write("jslint: Using configuration file '/etc/jslintrc'.\n");
                                    }
                                    parseConfig('/etc/jslintrc', lintOptions, opts);
                                    processFiles(lintOptions);
                                } else {
                                    processFiles(lintOptions);
                                }
                            });
                        }
                    });
                } else {
                    processFiles(lintOptions);
                }
            }
        });
    }
};
