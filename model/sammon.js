class Sammon {
	// https://en.wikipedia.org/wiki/Sammon_mapping
	// https://oimokihujin.hatenablog.com/entry/2014/06/01/073231
	constructor(x, rd) {
		this._x = x
		const n = this._x.length
		this._y = Matrix.randn(n, rd)
		this._alpha = 0.3

		this._d = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				let d = 0
				for (let k = 0; k < x[i].length; k++) {
					d += (x[i][k] - x[j][k]) ** 2
				}
				d = Math.sqrt(d)
				this._d.set(i, j, d)
				this._d.set(j, i, d)
			}
		}
	}

	fit() {
		const c = this._d.sum()
		const n = this._y.rows
		const d = this._y.cols
		for (let i = 0; i < n; i++) {
			let de = Matrix.zeros(1, d)
			let dde = Matrix.zeros(1, d)
			for (let j = 0; j < n; j++) {
				if (i === j) continue
				let dp = 0
				for (let k = 0; k < d; k++) {
					dp += (this._y.at(i, k) - this._y.at(j, k)) ** 2
				}
				dp = Math.sqrt(dp)
				if (dp === 0) continue

				const t1 = (this._d.at(i, j) - dp) / (this._d.at(i, j) * dp)
				const t2 = this._y.row(i).copySub(this._y.row(j))
				de.sub(t2.copyMult(2 / c * t1))
				dde.sub(t2.copyMap(v => 2 / c * t1 * (1 - v ** 2 / dp * (1 / (this._d.at(i, j) - dp) + 1 / dp))))
			}

			for (let j = 0; j < d; j++) {
				this._y.subAt(i, j, this._alpha * de.at(0, j) / Math.abs(dde.at(0, j)))
			}
		}
		return this._y
	}
}

var dispSammon = function(elm, platform) {
	const setting = platform.setting
	let model = null
	const fitModel = cb => {
		const dim = setting.dimension
		platform.plot((tx, ty, px, pred_cb) => {
			if (!model) {
				model = new Sammon(tx, dim)
			}
			const pred = model.fit()
			pred_cb(pred.toArray())
			cb && cb()
		})
	}
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			platform.init()
		})
	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			fitModel()
		})
	let isRunning = false;
	const runButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			runButton.attr("value", (isRunning) ? "Stop" : "Run");
			if (isRunning) {
				(function stepLoop() {
					if (isRunning) {
						fitModel(() => setTimeout(stepLoop, 0));
					}
					stepButton.property("disabled", isRunning);
					runButton.property("disabled", false);
				})();
			} else {
				runButton.property("disabled", true);
			}
		});
	return () => {
		isRunning = false
	}
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.terminate = dispSammon(platform.setting.ml.configElement, platform);
}
