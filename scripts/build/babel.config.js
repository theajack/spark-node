/*
 * @Author: chenzhongsheng
 * @Date: 2022-12-02 22:35:38
 * @Description: Coding something
 */
module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'entry',
                targets: {
                    esmodules: true,
                    ie: 11,
                },
            },
        ],
        '@babel/preset-typescript',
    ],
    'ignore': [
        'node_modules/**'
    ]
};

