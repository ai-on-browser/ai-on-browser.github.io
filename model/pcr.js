import { PCA } from './pca.js'

class PCR {
	constructor() {
		this._pca = new PCA();
		this._rd = 0
	}

	fit(x, y) {
		x = Matrix.fromArray(x);
		y = Matrix.fromArray(y);
		this._pca.fit(x);
		let xh = this._pca.predict(x, this._rd);
		xh = xh.resize(xh.rows, xh.cols + 1, 1);
		const xtx = xh.tDot(xh);

		this._w = xtx.slove(xh.t).dot(y);
	}

	predict(x) {
		x = Matrix.fromArray(x);
		let xh = this._pca.predict(x, this._rd);
		xh = x.resize(xh.rows, xh.cols + 1, 1);
		return xh.dot(this._w).value;
	}
}

var dispPCR = function(elm, platform) {
	const fitModel = (cb) => {
		const dim = platform.datas.dimension
		platform.fit((tx, ty) => {
			const model = new PCR();
			model.fit(tx, ty);

			platform.predict((px, pred_cb) => {
				const pred = model.predict(px);
				pred_cb(pred);
			}, dim === 1 ? 100 : 4)
			platform.evaluate((x, e_cb) => {
				e_cb(model.predict(x))
			})
		});
	};

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispPCR(platform.setting.ml.configElement, platform)
}
