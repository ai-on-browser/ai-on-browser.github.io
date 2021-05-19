class MaximumLikelihoodEstimator {
	// https://home.hiroshima-u.ac.jp/tkurita/lecture/prnn/node7.html
	constructor(distribution = 'normal') {
		this._distribution = distribution
	}

	fit(x) {
		x = Matrix.fromArray(x)
		if (this._distribution === 'normal') {
			this._m = x.mean(0)
			this._s = x.cov()
		}
	}

	probability(x) {
		x = Matrix.fromArray(x)
		if (this._distribution === 'normal') {
			const d = Math.sqrt(2 * Math.PI * this._s.det()) ** x.cols
			x.sub(this._m)
			const v = x.dot(this._s.inv())
			v.mult(x)
			const s = v.sum(1)
			s.map(v => Math.exp(-v / 2) / d)
			return s.value
		}
	}

	predict(x) {
		return this.probability(x)
	}
}

var dispMaximumLikelihoodEstimator = function(elm, platform) {
	const fitModel = () => {
		const distribution = elm.select("[name=distribution]").property("value")
		const model = new MaximumLikelihoodEstimator(distribution);
		platform.fit((tx, ty) => {
			model.fit(tx);

			platform.predict((px, pred_cb) => {
				const pred = model.predict(px)
				const min = Math.min(...pred);
				const max = Math.max(...pred);
				pred_cb(pred.map(v => specialCategory.density((v - min) / (max - min))))
			}, 4)
		});
	};

	elm.append("select")
		.attr("name", "distribution")
		.selectAll("option")
		.data([
			"normal"
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispMaximumLikelihoodEstimator(platform.setting.ml.configElement, platform);
}
