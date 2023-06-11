/*
 * @Author: tackchen
 * @Date: 2022-10-23 20:12:31
 * @Description: Coding something
 */

const execa = require('execa');
const { resolveRootPath, copyFile } = require('../helper/utils');
const dts = require('rollup-plugin-dts').default;
const rollup = require('rollup');

async function build () {
    const version = process.argv[2];
    await execa(
        resolveRootPath('node_modules/rollup/dist/bin/rollup'),
        [
            '-c',
            resolveRootPath('scripts/build/rollup.config.js'),
            '--environment',
            [
                `NODE_ENV:production`,
            ],
        ],
        { stdio: 'inherit' },
    );

    copyFile({
        src: resolveRootPath('README.md'),
        dest: resolveRootPath('npm/README.md')
    });
    copyFile({
        src: resolveRootPath('LICENSE'),
        dest: resolveRootPath('npm/LICENSE')
    });
    copyFile({
        src: resolveRootPath('package.json'),
        dest: resolveRootPath('npm/package.json'),
        json: true,
        handler (pkg) {
            [ 'nodemonConfig', 'devDependencies' ].forEach(key => {delete pkg[key];});
            if (version) pkg.version = version;
            return pkg;
        },
    });
}


async function builddts ({
    input = resolveRootPath('src/index.ts'),
    output = resolveRootPath('npm/index.min.d.ts'),
} = {}) {
    await buildBase({
        inputOptions: {
            input,
            plugins: [ dts() ],
        },
        outputOptions: {
            file: output,
            format: 'es',
        },
    });
}


async function buildBase ({
    inputOptions,
    outputOptions,
}) {
    const bundle = await rollup.rollup(inputOptions);
    //   console.log(bundle.imports); // an array of external dependencies
    //   console.log(bundle.exports); // an array of names exported by the entry point
    //   console.log(bundle.modules); // an array of module objects
    //   // generate code and a sourcemap
    //   const { code, map } = await bundle.generate(outputOptions);
    await bundle.write(outputOptions);
}


async function main () {
    await build();
    await builddts();
}
main();


