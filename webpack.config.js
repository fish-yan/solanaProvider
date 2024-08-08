const path = require('path');
const webpack = require('webpack')

module.exports = {
    mode: 'production',
    entry: './src/provider.ts',
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'], // ['包名', '包中的值']
            process: 'process/browser'
	})
    ],
    output: {
        path:  "/Users/yan/code/ONTO_IOS/ONTO/Discover/Browser/DappProvider/Solana/",// path.resolve(__dirname, 'dist'),
        filename: 'solanaProvider.js',
        library: "solanaProvider",
    },
    module: {
        // 指定loader加载的规则
        rules: [
            {
                test: /\.ts$/, // 指定规则生效的文件：以ts结尾的文件
                use: 'ts-loader', // 要使用的loader
                exclude: /node-modules/ // 要排除的文件
            }
        ]
    },
    // 设置哪些文件类型可以作为模块被引用
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            "buffer": require.resolve("buffer/"),
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "process": require.resolve('process/browser'),
            "vm": require.resolve("vm-browserify")
        }
    }
};