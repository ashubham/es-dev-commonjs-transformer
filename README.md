# es-dev-commonjs-transformer
CommonJS Module transformer for the es-dev-server

[![npm version](https://badge.fury.io/js/es-dev-commonjs-transformer
.svg)](https://badge.fury.io/js/es-dev-commonjs-transformer
)

## General Usage

```js
//es-dev-server.config.js

import cjsTransformer from 'es-dev-commonjs-transformer';

module.exports = {
    responseTransformers: [
        cjsTransformer(
            /* Exclude Paths Array */
            '**/node_modules/@open-wc/**/*',
            ...
        )
    ]
}
```

## OpenWC Karma Testing Setup

The Open-wc karma setup requires you to exlude some paths from being processed by the cjs transformer.
The following excludes seems to have worked for me.

```js
//karma.conf.ts

const cjsTransformer = require('es-dev-commonjs-transformer');
const { createDefaultConfig } = require('@open-wc/testing-karma');

module.exports = config => {
    let defaultConfig = createDefaultConfig(config);
    
    ...
    
    esm: {
        responseTransformers: [
        cjsTransformer(
                ...defaultConfig.esm.babelModernExclude,
                '**/node_modules/@open-wc/**/*',
                '**/node_modules/chai-dom/**/*',
                '**/node_modules/sinon-chai/**/*'
            )
        ]
    }
}
```
