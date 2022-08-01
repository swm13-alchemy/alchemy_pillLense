import classify from "@functions/classify";
import type { AWS } from "@serverless/typescript";
import baseConfiguration from "./serverless.base";

const serverlessConfiguration: AWS = {
	...baseConfiguration,
	provider: {
		...baseConfiguration.provider,
		ecr: {
			images: {
				classify_image: {
					path: "./",
				},
			},
		},
		environment: {
			...baseConfiguration.provider.environment,
			MODEL_PATH: "/usr/models/m/model.json",
		},
	},
	functions: {
		classify: {
			events: classify.events,
			timeout: 30,
			image: {
				name: "classify_image",
			},
		},
	},
};

module.exports = serverlessConfiguration;
