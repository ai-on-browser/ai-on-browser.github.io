class JeoJohnson {
	// https://betashort-lab.com/%E3%83%87%E3%83%BC%E3%82%BF%E3%82%B5%E3%82%A4%E3%82%A8%E3%83%B3%E3%82%B9/yeo-johnson%E5%A4%89%E6%8F%9B/
	constructor(lambda = null) {
		this._lambda = lambda
	}

	_t(v) {
		if (v >= 0) {
			if (this._lambda === 0) {
				return Math.log(v + 1)
			} else {
				return ((v + 1) ** this._lambda - 1) / this._lambda
			}
		} else {
			if (this._lambda === 2) {
				return -Math.log(-v + 1)
			} else {
				return -((-v + 1) ** (2 - this._lambda) - 1) / (2 - this._lambda)
			}
		}
	}

	fit(x) {
		this._lambda = 0.1
	}

	predict(x) {
		return x.map(r => {
			if (Array.isArray(r)) {
				return r.map(v => this._t(v))
			}
			return this._t(r)
		})
	}
}

var dispJeoJohnson = function(elm, platform) {
	const fitModel = () => {
		const auto = autoCheck.property("checked")
		const h = +lambdaelm.property("value")
		const model = new JeoJohnson(h)
		platform.fit((tx, ty, pred_cb) => {
			if (auto) {
				model.fit(tx, ty.map(v => v[0]))
			}
			pred_cb(model.predict(ty))
		});
	}
	elm.append("span")
		.text("lambda")
	const autoCheck = elm.append("input")
		.attr("type", "checkbox")
		.attr("name", "auto")
		.attr("title", "auto")
		.property("checked", false)
		.property("disabled", true)
		.on("change", () => {
			lambdaelm.property("disabled", autoCheck.property("checked"))
		})
	const lambdaelm = elm.append("input")
		.attr("type", "number")
		.attr("name", "lambd")
		.attr("value", 0.1)
		.attr("step", 0.1)
		.property("disabled", false)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel)
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispJeoJohnson(platform.setting.ml.configElement, platform)
}
