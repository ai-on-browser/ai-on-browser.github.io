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
		platform.plot((tx, ty, px, pred_cb) => {
				const x = Matrix.fromArray(tx);
				const t = new Matrix(ty.length, 1, ty);

				const model = new PCR();
				model.fit(x, t);

				const pred_values = Matrix.fromArray(px);
				const pred = model.predict(pred_values).value;
				pred_cb(pred);
			}, dim === 1 ? 100 : 4
		);
	};

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

var pcr_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispPCR(root, platform);
}

export default pcr_init

