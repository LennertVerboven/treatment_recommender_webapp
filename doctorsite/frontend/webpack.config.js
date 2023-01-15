// const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    plugins: [
    //     new webpack.DefinePlugin({ // <-- key to reducing React's size
    //         'process.env': {
    //             'NODE_ENV': JSON.stringify('production')
    //         }
    //     }),
    //     new webpack.optimize.AggressiveMergingPlugin(), //Merge chunks
        new CompressionPlugin(),
    ],
    // optimization: {
    //     minimize: true,
    //     namedModules: false,
    //     namedChunks: false,
    //     chunkIds: 'total-size',
    //     moduleIds: 'size',
    // }
};