import { GraphModel } from "@tensorflow/tfjs-node";
import { loadImage, createCanvas, Canvas } from "canvas";
import { labels } from "./config";

class PillLenseModel {
	pillLenseModel: GraphModel;

	async loadModel() {
		if (this.pillLenseModel) {
			return this.pillLenseModel;
		}

		const customModelUrl = process.env.MODEL_PATH
			? `file://${process.env.MODEL_PATH}`
			: "file://./models/m/model.json";
		const tf = require("@tensorflow/tfjs-node");

		this.pillLenseModel = await tf.loadGraphModel(customModelUrl);

		return this.pillLenseModel;
	}

	async createInputFromImage(imagePath, shape) {
		const image = await loadImage(imagePath);
		const tf = require("@tensorflow/tfjs-node");

		const c: Canvas = createCanvas(image.width as number, image.height as number);
		const ctx: CanvasRenderingContext2D = c.getContext("2d");
		ctx.drawImage(image as unknown as CanvasImageSource, 0, 0, image.width as number, image.height as number);

		let [modelWidth, modelHeight] = shape;
		return tf.tidy(() => {
			return tf.image
				.resizeBilinear(tf.browser.fromPixels(c as unknown as HTMLCanvasElement), [modelWidth, modelHeight])
				.div(255.0)
				.expandDims(0);
		});
	}

	getDetectedObjectList = (res, shape, threshold) => {
		const tf = require("@tensorflow/tfjs-node");
		const [modelWidth, modelHeight] = shape;

		const [boxes, scores, classes, valid_detections] = res;
		const boxes_data = boxes.dataSync();
		const scores_data = scores.dataSync();
		const classes_data = classes.dataSync();
		const valid_detections_data = valid_detections.dataSync()[0];

		tf.dispose(res);

		const results = [];
		for (let i = 0; i < valid_detections_data; ++i) {
			let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
			x1 *= modelWidth;
			x2 *= modelWidth;
			y1 *= modelHeight;
			y2 *= modelHeight;
			const width = x2 - x1;
			const height = y2 - y1;
			const label = labels[classes_data[i]];
			const score = scores_data[i].toFixed(2);

			if (score < threshold) continue;

			results.push({
				posX: x1,
				posY: y1,
				width,
				height,
				label,
				score,
			});
		}

		return results;
	};

	async classify(imageBuffer: Buffer) {
		if (!this.pillLenseModel) {
			await this.loadModel();
		}
		const [modelWidth, modelHeight] = this.pillLenseModel.inputs[0].shape.slice(1, 3);

		const input = await this.createInputFromImage(imageBuffer, [modelWidth, modelHeight]);

		const res = await this.pillLenseModel.executeAsync(input);

		return this.getDetectedObjectList(res, [modelWidth, modelHeight], 0.7);
	}
}

export default new PillLenseModel();
