import classify from "@functions/classify";
import type { AWS } from "@serverless/typescript";
import baseConfiguration from "./serverless.base";

const serverlessConfiguration: AWS = {
	...baseConfiguration,
	custom: {
		webpack: {
			webpackConfig: "./webpack.config.js",
			includeModules: false,
		},
	},
	plugins: ["serverless-webpack", "serverless-offline"],
	functions: { classify },
};

module.exports = serverlessConfiguration;
