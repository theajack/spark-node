/*
 * @Author: tackchen
 * @Date: 2022-10-23 20:12:31
 * @Description: Coding something
 */
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import path from 'path';

const { resolveRootPath } = require('../helper/utils');

const extensions = [ '.ts', '.d.ts', '.js' ];

const config = ({
    main: { i: 'index.ts', o: 'index.min.js', format: 'cjs', name: 'SparkNode' },
    chat: { i: 'chat.ts', o: 'chat.js', format: 'es', name: 'SparkChat' },
    cdn: { i: 'chat-cdn.ts', o: 'chat.cdn.js', format: 'umd', name: 'SparkChat' },
})[process.env.TYPE];

export default {
    input: resolveRootPath(`src/${config.i}`),
    output: {
        file: resolveRootPath(`npm/${config.o}`),
        format: config.format,
        name: config.name,
    },
    plugins: [
        uglify(),
        commonjs(),
        typescript(),
        nodeResolve({
            extensions,
        }),
        babel({
            exclude: [ 'node_modules/**' ],
            extensions,
            configFile: path.join(__dirname, './babel.config.js'),
        }),
        replace({
            'process.env.NODE_ENV': '"production"',
        }),
    ],
};


