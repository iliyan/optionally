function interpolate(name) {
    var path = require("path");
    var result = name.replace(/\${([^{}]*)}/g,
            function (a, b) {
                var r = process.env[b];
                return (r) ? r : a;
            });
    return path.normalize(result);
}

function load(file, default_config) {
    var configfile = interpolate(file);
    var fs = require("fs");
    if (fs.existsSync(configfile)) {
        console.log("loading: " + configfile);
        return merge(default_config, JSON.parse(fs.readFileSync(configfile, "utf-8")));
    }
    return default_config;
}

function resolve(files, default_config) {
    if (Array.isArray(files)) {
        var configs = files.map(function (e) {
            return !e || load(e, undefined);
        });
        
        return configs.reduceRight(function (previous, current) {
            return merge(previous, current);
        }, default_config);
    }
    else {
        return load(e, default_config);
    }
}



/* Merges two (or more) objects,
 giving the last one precedence */
function merge(target, source) {

    if (typeof target !== 'object') {
        target = {};
    }

    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            var sourceProperty = source[ property ];

            if (typeof sourceProperty === 'object') {
                target[ property ] = merge(target[ property ], sourceProperty);
                continue;
            }
            target[ property ] = sourceProperty;
        }
    }

    for (var a = 2, l = arguments.length; a < l; a++) {
        merge(target, arguments[a]);
    }
    return target;
}



/* 
 * Keep these "sane" - the defaults _must_ work for anyone checking out the 
 * application code from source repository
 */
var default_config = {
    seleniumAddress: "http://localhost:4444/wd/hub",
    specs: ["qa/**/*.js"],
    multiCapabilities: [{
            browserName: 'chrome'
        }],
    baseUrl: "https://dev6.travelhq.com/regtemplate"
};

exports.config = resolve("${USERPROFILE}/.protractor/config.js", default_config);
console.log(exports.config);
throw 0;