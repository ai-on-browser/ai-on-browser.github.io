class BoxCox {
	// https://qiita.com/Jumtra/items/84ae4ebfa85407f9d9eb
	constructor(lambda = null) {
		this._lambda = lambda
	}

	_t(v) {
		if (this._lambda === 0) {
			return Math.log(v)
		} else {
			return (v ** this._lambda - 1) / this._lambda
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

var dispBoxCox = function(elm, platform) {
	const fitModel = () => {
		const auto = autoCheck.property("checked")
		const h = +lambdaelm.property("value")
		const model = new BoxCox(h)
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
	dispBoxCox(platform.setting.ml.configElement, platform)
}
