import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";
import pillLense from "@libs/pillLense";

const classify: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	const imageBuffer = Buffer.from(event.body.image, "base64");

	return pillLense.classify(imageBuffer);
};

export const main = middyfy(classify);
