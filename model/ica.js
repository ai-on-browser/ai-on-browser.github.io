import { PCA } from './pca.js'

class ICA {
	// https://www.slideshare.net/sfchaos/numpy-scipy-9039097
	constructor() {
		this._w = null
		this._alpha = 0.1
	}

	fit(x) {
		const d = x.cols
		const c = x.cols
		const n = x.rows
		if (!this._w) {
			this._w = Matrix.zeros(c, c)
		}
		x = x.copySub(x.mean(0))
		const pca = new PCA()
		pca.fit(x)
		const z = pca.predict(x)
		const eps = 1.0e-12
		const r = []

		for (let i = 0; i < d; i++) {
			let w = Matrix.randn(c, 1)
			if (i > 0) {
				const wi = this._w.select(0, null, i, null)
				const k = wi.dot(w)
				wi.mult(k.t)
				w.sub(wi.sum(0).t)
			}
			w.div(w.norm())

			let maxCount = 1.0e+4
			while (maxCount-- > 0) {
				const wx = z.dot(w)
				const gwx = wx.copyMap(v => Math.tanh(v * this._alpha))
				const xgwx = z.copyMult(gwx)
				const v1 = xgwx.mean(0).t
				const g_wx = wx.copyMap(v => this._alpha * (1 - Math.tanh(this._alpha * v) ** 2))
				const v2 = w.copyMult(g_wx.mean())
				const w1 = v1.copySub(v2)
				if (i > 0) {
					const wi = this._w.row(r)
					const k = wi.dot(w1)
					wi.mult(k.t)
					w1.sub(wi.sum(0).t)
				}
				w1.div(w1.norm())

				const e = w.copyMult(w1)
				if (Math.abs(Math.abs(e.sum()) - 1) < eps) {
					break
				}
				w = w1
			}
			this._w.set(i, 0, w.t)
			r.push(i)
		}
	}

	predict(x, rd = 0) {
		let w = this._w.t
		if (rd > 0 && rd < w.cols) {
			w = w.resize(w.rows, rd)
		}
		return x.dot(w);
	}
}

var dispICA = function(elm, platform) {
	const setting = platform.setting
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			platform.plot(
				(tx, ty, px, pred_cb) => {
					const x_mat = Matrix.fromArray(px);
					const dim = setting.dimension;
					const model = new ICA()
					model.fit(x_mat)
					let y = model.predict(x_mat, dim);
					pred_cb(y.toArray());
				}
			);
		});
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Next, click "Fit" button.'
	dispICA(platform.setting.ml.configElement, platform);
}

