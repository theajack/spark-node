/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-14 08:06:30
 * @Description: Coding something
 */
const { build } = require('esbuild');
const { resolveRootPath } = require('./helper/utils');

main(
    resolveRootPath('scripts/dev/dev.ts'),
    resolveRootPath('scripts/dev/bundle.min.js')
);

function main (entry, outfile) {
    build({
        entryPoints: [ entry ],
        outfile,
        bundle: true,
        sourcemap: true,
        format: 'cjs',
        globalName: 'Sener',
        platform: 'node',
        define: {
            'process.env.NODE_ENV': '"development"',
        },
        plugins: [
        ],
        watch: {
            onRebuild (error) {
                if (!error) console.log(`rebuilt: ${outfile}`);
            },
        },
    }).then(() => {
        console.log(`watching: ${outfile}`);
    });

}
