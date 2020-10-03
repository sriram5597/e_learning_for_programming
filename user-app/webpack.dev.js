const merge = require("webpack-merge");
const common = require("./webpack.common");
const path = require("path");
const htmlPlugin = require("html-webpack-plugin");
const EncodingPlugin = require("webpack-encoding-plugin");

module.exports = merge(
    common,
    {
        mode: "development",
        devtool: "inlint-source-map",
        target: "web",
        output: {
            filename: "[name].bundle.js",
            path: path.resolve(__dirname, "dist"),
            publicPath: '/',

        },
        plugins: [
            new htmlPlugin({
                template: "./public/index.html",
                title: 'development'
            }),
            new EncodingPlugin({
                encoding: "utf-8"
            })
        ],
        module: {
            rules:  [
                {
                    test: /\.scss$/,
                    use: [
                        "style-loader",
                        "css-loader",
                        "sass-loader"
                    ]
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"]
                },
                {
                    test: /\.html$/,
                    use: ["html-loader"]
                },
                {
                    test: /\.(svg|png|jpg|gif)$/,
                    use: {
                        loader: "file-loader",
                        options: {
                            name: "[name].[hash].[ext]",
                            outputPath: "assets"
                        }
                    }
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true,
                            cacheCompression: false,
                        }
                    }
                }
            ]
        },
        devServer: {
            contentBase: './dist',
            port: 3000,
            historyApiFallback: true,
            inline: true,
            compress: true,
            proxy: {
                "/api": {
                    target: "http://localhost:4000",
                    secure: false,
                    changeOrigin: true,
                }
            }
        }
    }
)