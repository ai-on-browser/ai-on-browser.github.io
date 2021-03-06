class MAD {
	// Median Absolute Deviation from median
	// https://www.vdu.lt/cris/bitstream/20.500.12259/92994/4/Aleksas_Pantechovskis_md.pdf
	// https://eurekastatistics.com/using-the-median-absolute-deviation-to-find-outliers/
	constructor() {
		this._median = null;
		this._mad = null;
	}

	fit(data) {
		const n = data.length;
		if (n === 0) {
			return;
		}
		const x = Matrix.fromArray(data);
		this._median = x.median(0)
		x.sub(this._median)
		x.abs()
		this._mad = x.median(0)
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		x.sub(this._median)
		x.abs()
		x.div(this._mad)

		return x.max(1).value
	}
}

var dispMAD = function(elm, platform) {
	const calcMAD = function() {
		platform.fit((tx, ty, cb) => {
			const threshold = +elm.select("[name=threshold]").property("value")
			const model = new MAD()
			model.fit(tx);
			const outliers = model.predict(tx).map(v => v > threshold)
			cb(outliers)
			platform.predict((px, pred_cb) => {
				const outlier_tiles = model.predict(px).map(v => v > threshold)
				pred_cb(outlier_tiles)
			}, 3)
		})
	}

	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 2)
		.attr("min", 0)
		.attr("max", 10)
		.property("required", true)
		.attr("step", 0.1)
		.on("change", function() {
			calcMAD();
		});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcMAD);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispMAD(platform.setting.ml.configElement, platform)
}
