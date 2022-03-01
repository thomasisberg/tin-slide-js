const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: {
        main: './src/js/tin-slide.js'
    },
    output: {
        filename: 'tin-slide.min.js',
        path: path.resolve(__dirname, './dist'),
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                format: {
                    comments: false,
                },
            },
            extractComments: false,
        })],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{
                from: './src/js/tin-slide.js',
                to: path.resolve(__dirname, './dist'),
                globOptions: {
                    optimization: {
                        minimize: false
                    }
                }
            }]
        })
    ]
};
