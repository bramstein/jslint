Introduction
============
(TODO)

Installation
============
Assuming your Narwhal (http://narwhaljs.org/) environment is set up, you can use its package manager Tusk to install the front-end for JSLint. You will first need to install the "fulljslint" module and then the command line front-end.

    tusk install http://github.com/bramstein/fulljslint/zipball/master
    tusk install http://github.com/bramstein/jslint/zipball/master

You should now be able to run JSLint from the command line. If you get an error message about the zip file not being found, go into your Narwhal installation directory, create an empty "zip" directory and try again.

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

Credits
=======
* Douglas Crockford (JSLint, http://www.jslint.com/)
