Introduction
============
A Node.js front-end for JSLint which allows you to set all JSLint options through the command line or a JSON configuration file. It also supports reading from stdin, so it can be used in a Unix pipe.

Installation
============
You will first need to install the "jslint-core" module and then the command line front-end:

    npm install https://github.com/One-com/jslint-core/tarball/module
    npm install https://github.com/bramstein/jslint/tarball/master

Usage
=====

    jslint [OPTIONS] [FILE, ...]

You can also use jslint with stream processing to---for example---pipe in the contents of a file:

    cat myfile.js | jslint [OPTIONS]

Options
=======
All JSLint specific options are documented in detail on the [official JSLint documentation](http://www.jslint.com/lint.html). This command line front-end supports several additional options:

 * --config CONFIG: use a given JSON formatted configuration file.
 * --help: Print help message.
 * --version: Print the JSLint edition.

To mimick the original JSLint command-line configuration (rhino.js) you can use the following JSON configuration file:
    {
        "bitwise": true,
        "eqeqeq": true,
        "immed": true,
        "newcap": true,
        "nomen": true,
        "onevar": true,
        "plusplus": true,
        "regexp": true,
        "rhino": true,
        "undef": true,
        "white": true
    }

And use it:
    jslint --config myconfig.json [FILE]

If your project uses a lot of predefined variables, you can declare them either via multiple "--predef" command line options, or an array of strings in the JSON configuration file. JSLint will look for a configuration file called `jslintrc` in either the current directory, your home directory or `/etc/`.

Credits
=======
* Douglas Crockford ([JSLint](http://www.jslint.com/))
