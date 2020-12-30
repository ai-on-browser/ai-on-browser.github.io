class ARMA {
	// https://qiita.com/asys/items/622594cb482e01411632
	// http://www.lec.ac.jp/pdf/activity/kiyou/no04/04.pdf
	constructor(p, q) {
		this._p = p
		this._q = q
		this._rate = 0.1
		this._beta = 1.0e-5

		this._phi = []
		for (let i = 0; i < this._p; this._phi[i++] = 0);
		this._the = []
		for (let i = 0; i < this._q; this._the[i++] = 0.3);
	}

	fit(data) {
		const y = data
		const n = y.length

		const pq_max = Math.max(this._p, this._q)

		for (let k = 0; k < 1; k++) {
			this._u = [y[0]]
			for (let i = 1; i < n; i++) {
				let v = y[i]
				for (let j = 0; j < Math.min(i, this._p); j++) {
					v -= this._phi[j] * y[i - j - 1]
				}
				for (let j = 0; j < Math.min(i, this._q); j++) {
					v += this._the[j] * this._u[i - j - 1]
				}
				this._u[i] = v
			}
			let J = Matrix.zeros(n, this._p + this._q)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < Math.min(i, this._p); j++) {
					J.set(i, j, -y[i - j - 1])
				}
				for (let j = 0; j < Math.min(i, this._q); j++) {
					J.set(i, j + this._p, this._u[i - j - 1])
				}
			}
			J = J.select(pq_max)
			const f = new Matrix(n - pq_max, 1, this._u.slice(pq_max))

			const H = J.tDot(J)
			H.add(Matrix.eye(H.rows, H.cols, this._beta))
			const d = H.slove(J.tDot(f)).value
			let e = d.reduce((s, v, i) => s + Math.abs(v), 0)
			e /= this._phi.reduce((s, v) => s + Math.abs(v), 0) + this._the.reduce((s, v) => s + Math.abs(v), 0)
			if (isNaN(e) || e < 1.0e-12) break

			for (let i = 0; i < this._p; i++) {
				this._phi[i] -= this._rate * d[i]
			}
			for (let i = 0; i < this._q; i++) {
				this._the[i] -= this._rate * d[i + this._p]
			}
		}
	}

	predict(data, k) {
		const preds = []
		const lasts = data.slice(data.length - Math.max(this._p, this._q))
		lasts.reverse()
		for (let i = 0; i < k; i++) {
			let pred = 0
			for (let i = 0; i < this._p; i++) {
				pred += this._phi[i] * lasts[i]
			}
			pred += this._u[this._u.length - 1]
			for (let i = 0; i < this._q; i++) {
				pred -= this._u[this._u.length - i - 2] * this._the[i]
			}
			preds.push(pred)
			lasts.unshift(pred)
			lasts.pop()
		}
		return preds
	}
}

var dispARMA = function(elm, platform) {
	let model = null
	let epoch = 0
	const fitModel = (cb) => {
		const p = +elm.select(".buttons [name=p]").property("value")
		const q = +elm.select(".buttons [name=q]").property("value")
		const c = +elm.select(".buttons [name=c]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			if (!model) {
				model = new ARMA(p, q);
			}
			model.fit(tx.map(v => v[0]))
			const pred = model.predict(tx.map(v => v[0]), c)
			pred_cb(pred)
			elm.select(".buttons [name=epoch]").text(++epoch);
			cb && cb()
		})
	}

	elm.select(".buttons")
		.append("span")
		.text("p")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "p")
		.attr("min", 0)
		.attr("max", 1000)
		.attr("value", 1)
	elm.select(".buttons")
		.append("span")
		.text("q")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "q")
		.attr("min", 0)
		.attr("max", 1000)
		.attr("value", 1)

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			epoch = 0
			platform._plotter.reset()
			elm.select(".buttons [name=epoch]").text(0);
		})
	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", fitModel);
	let isRunning = false;
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			stepButton.property("disabled", isRunning);
			if (isRunning) {
				(function stepLoop() {
					if (isRunning) {
						fitModel(() => setTimeout(stepLoop, 0));
					}
				})();
			}
		});
	elm.select(".buttons")
		.append("span")
		.text(" Epoch: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "epoch");

	elm.select(".buttons")
		.append("span")
		.text("predict count")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "c")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 100)
		.on("change", fitModel)
}

export default function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Click "fit" to update.');
	div.append("div").classed("buttons", true);
	dispARMA(root, platform);
}
