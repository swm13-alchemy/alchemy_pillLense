import { middyfy } from "@libs/lambda";
import mobilenet from "@libs/pillLense";
import { Handler } from "aws-lambda";
import { mocked } from "ts-jest/utils";

jest.mock("@libs/lambda");
jest.mock("@libs/mobilenet");

describe("classify", () => {
	let main: (event: any) => any;
	let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;
	let mockedMobilenet: jest.Mocked<typeof mobilenet>;

	beforeEach(async () => {
		mockedMiddyfy = mocked(middyfy);
		mockedMiddyfy.mockImplementation((handler: Handler) => {
			return handler as never;
		});

		mockedMobilenet = mocked(mobilenet);

		main = (await import("./handler")).main as any;
	});

	afterEach(() => {
		jest.resetModules();
		jest.restoreAllMocks();
	});

	it("should return prediction information", async () => {
		const predictions = [
			{
				className: "Lazy cat",
				probability: 0.99,
			},
		];
		const buffer = Buffer.from("image-buffer-data");
		const event = {
			body: {
				image: "test-image",
			},
		} as any;

		jest.spyOn(Buffer, "from").mockReturnValue(buffer);
		mockedMobilenet.classify.mockResolvedValue(predictions);

		const actual = await main(event);

		expect(actual).toEqual(predictions);
		expect(Buffer.from).toHaveBeenCalledWith(event.body.image, "base64");
		expect(mockedMobilenet.classify).toHaveBeenCalledWith(buffer);
	});
});
