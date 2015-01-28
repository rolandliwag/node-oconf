#!/usr/bin/env node
// ex: filetype=javascript

var oconf = require('../lib/index'),
    util = require('util'),
    _ = require('underscore'),
    argv = require('optimist')
        .option('lint', {
            type: 'boolean',
            default: false
        })
        .option('ignore', {
            type: 'string'
        })
        .option('bare', {
            type: 'boolean'
        })
        .option('allowmissing', {
            type: 'boolean'
        })
        .demand(1)
        .usage('Usage: $0 [--lint] [--bare] [--allowmissing] [--ignore <filename>] <filename.cjson> [path.to.value...]')
        .argv;

try {
    var args = argv._.splice(1),
        config = oconf.load(argv._[0], {ignore: argv.ignore}),
        // Normalize oconf ... foo.bar quux => ['foo', 'bar', 'quux']
        pathToValue = _.flatten(args.map(function (item) {
            return item.split('.');
        }));

    pathToValue.forEach(function (arg) {
        if (!config || typeof config !== 'object' || !(arg in config)) {
            if (argv.allowmissing) {
                process.exit(0);
            } else {
                throw new Error('No such value: ' + pathToValue.join('.'));
            }
        }
        config = config[arg];
    });

    if (!argv.lint) {
        if (argv.bare) {
            if (Array.isArray(config)) {
                util.puts(config.join(' '));
            } else if (typeof config === 'object' && config) {
                util.puts(JSON.stringify(config));
        } else {
                util.puts(config);
            }
        } else {
            util.puts(JSON.stringify(config, false, 4));
        }
    }
} catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
}