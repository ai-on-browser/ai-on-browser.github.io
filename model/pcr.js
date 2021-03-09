import { PCA } from './pca.js'

class PCR {
	constructor() {
		this._pca = new PCA();
		this._rd = 0
	}

	fit(x, y) {
		this._pca.fit(x);
		let xh = this._pca.predict(x, this._rd);
		xh = xh.resize(xh.rows, xh.cols + 1, 1);
		const xtx = xh.tDot(xh);

		this._w = xtx.slove(xh.t).dot(y);
	}

	predict(x) {
		let xh = this._pca.predict(x, this._rd);
		xh = x.resize(xh.rows, xh.cols + 1, 1);
		return xh.dot(this._w);
	}
}

var dispPCR = function(elm, platform) {
	const fitModel = (cb) => {
		const dim = platform.datas.dimension
		platform.fit((tx, ty) => {
			const x = Matrix.fromArray(tx);
			const t = new Matrix(ty.length, 1, ty);

			const model = new PCR();
			model.fit(x, t);

			platform.predict((px, pred_cb) => {
				const pred_values = Matrix.fromArray(px);
				const pred = model.predict(pred_values).value;
				pred_cb(pred);
			}, dim === 1 ? 100 : 4)
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
