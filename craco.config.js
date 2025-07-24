const path = require("path");

module.exports = {
  webpack: {
    resolve: {
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        util: require.resolve("util"),
        process: require.resolve("process/browser"),
        path: require.resolve("path-browserify"),
        fs: false,
        net: false,
        tls: false,
        zlib: require.resolve("browserify-zlib"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        assert: require.resolve("assert"),
        url: require.resolve("url"),
        os: require.resolve("os-browserify/browser"),
      },
    },
    plugins: {
      add: [
        new (require("webpack")).ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      ],
    },
  },
  eslint: {
    enable: false,
  },
};