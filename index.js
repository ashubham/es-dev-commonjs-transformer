const commonjs = require('rollup-plugin-commonjs');
const acorn = require("acorn");
const minimatch = require("minimatch")
const path = require("path");

let transformer = commonjs();
transformer.getModuleInfo = () => {
    return {
        isEntry: true
    }
}
transformer.parse = function parse(code, acornOpts) {
    return acorn.Parser.parse(code, {
        ecmaVersion: 2020,
        sourceType: 'module',
        ...acornOpts
    })
};

transformer.error = function(...args) {
    console.error(...args);
}

function cjsTransformer(excludePaths = []) {
    return async function ({url, status, contentType, body}) {
        if(!url.endsWith('.js')) {
            return {body, contentType};
        }

        if(excludePaths.some(excludePath => minimatch(url, excludePath))) {
            return {body, contentType};
        }

        // random.js is just a placeholder name which is needed.
        let transformed = transformer.transform(body, path.basename(url));
        if(transformed) {
            transformed.code = transformed.code.replace("import * as commonjsHelpers from", cjsHelper);
            // replacing it in one shot does not work for some encoding reason perhaps.
            transformed.code = transformed.code.replace("'commonjsHelpers.js'", "");
            transformed.code = transformed.code.replace(/\?commonjs-proxy/g, '')
            transformed.code = transformed.code.replace(/\0/g, '')
            return { body: transformed.code, contentType };
        }

        return { body, contentType };
    }
}


module.exports = cjsTransformer;

const cjsHelper = `
var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
function commonjsRequire () {
    throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}
function unwrapExports (x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}
function createCommonjsModule(fn, module) {
    return module = { exports: {} }, fn(module, module.exports), module.exports;
}
function getCjsExportFromNamespace (n) {
    return n && n['default'] || n;
}
var commonjsHelpers = { commonjsGlobal, commonjsRequire, createCommonjsModule, getCjsExportFromNamespace, unwrapExports };
`;