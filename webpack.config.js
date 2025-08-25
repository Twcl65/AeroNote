const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config();

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return {
        entry: './src/index.tsx',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].[contenthash].js',
            clean: true,
            publicPath: '/',
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: 'ts-loader',
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1,
                            },
                        },
                        'postcss-loader',
                    ],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource',
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html',
                filename: 'index.html',
            }),
            new webpack.DefinePlugin({
                'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(supabaseUrl),
                'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
            }),
            ...(isProduction ? [
                new GenerateSW({
                    clientsClaim: true,
                    skipWaiting: true,
                    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'google-fonts-cache',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365,
                                },
                                cacheableResponse: {
                                    statuses: [0, 200],
                                },
                            },
                        },
                        {
                            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'images',
                                expiration: {
                                    maxEntries: 50,
                                    maxAgeSeconds: 60 * 60 * 24 * 30,
                                },
                            },
                        },
                    ],
                })
            ] : []),
        ],
        devServer: {
            static: {
                directory: path.join(__dirname, 'public'),
            },
            compress: true,
            port: 3000,
            hot: true,
            historyApiFallback: true,
            devMiddleware: {
                writeToDisk: false,
            },
        },
        optimization: {
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                        maxSize: 2 * 1024 * 1024,
                        priority: 10,
                    },
                    common: {
                        name: 'common',
                        minChunks: 2,
                        chunks: 'all',
                        priority: 5,
                        reuseExistingChunk: true,
                    },
                },
            },
        },
    };
};
