Introduction
============
A CommonJS front-end for JSLint which allows you to set all JSLint options through the command line or a JSON configuration file. It also supports reading from stdin, so it can be used in a Unix pipe.

Installation
============
Assuming your Narwhal (http://narwhaljs.org/) environment is set up, you can use its package manager Tusk to install the front-end for JSLint. You will first need to install the "fulljslint" module and then the command line front-end.

    tusk install http://github.com/bramstein/fulljslint/zipball/master
    tusk install http://github.com/bramstein/jslint/zipball/master

If you get an "zip file not found" error, go into your Narwhal installation directory, create an empty "zips" directory and try again. You should now be able to run JSLint from the command line.

Usage
=====

   jslint [OPTIONS] [FILE]

You can also use jslint with stream processing to---for example---pipe in the contents of a file:

   cat myfile.js | jslint [OPTIONS]

Options
=======
All JSLint specific options are documented in detail on the official JSLint documentation (http://www.jslint.com/lint.html). This command line front-end supports several additional options:

 * -c, --config CONFIG: use a given JSON formatted configuration file.
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

If your project uses a lot of predefined variables, you can declare them either via multiple "--predef" command line options, or an array of strings in the JSON configuration file.

Credits
=======
* Douglas Crockford (JSLint - http://www.jslint.com/)
