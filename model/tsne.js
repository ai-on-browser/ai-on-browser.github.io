class tSNE {
	// https://www.slideshare.net/TakayukiYagi1/tsne
	// https://blog.albert2005.co.jp/2015/12/02/tsne/
	// https://lvdmaaten.github.io/publications/papers/JMLR_2008.pdf
	constructor(datas, rd = 1) {
		this._x = datas;
		this._epoch = 0;
		this._rd = rd;
		this._learning_rate = 200;
		this._perplexity = 30;
		this._y = [];
		for (let i = 0; i < datas.length; i++) {
			this._y[i] = []
			for (let k = 0; k < rd; k++) {
				this._y[i][k] = normal_random(0, 1.0e-4)[0]
			}
		}
	}

	fit() {
		const x = this._x;
		const y = this._y;
		const n = x.length;
		const pj_i = [];
		const norms = []
		for (let i = 0; i < n; norms[i++] = Array(n).fill(0));
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				norms[i][j] = norms[j][i] = x[i].reduce((a, v, k) => a + (v - x[j][k]) ** 2, 0)
			}
		}
		for (let i = 0; i < n; i++) {
			let sigma = 1.0
			let lowsigma = 0, highsigma = null;
			const tol = 1.0e-8;
			let pi = Array(n).fill(0)
			let count = 1.0e+4
			while (1) {
				let s = 0;
				const sgm = 2 * sigma ** 2;
				pi[i] = 0;
				for (let j = 0; j < n; j++) {
					if (i === j) continue;
					s += pi[j] = Math.exp(-norms[i][j] / sgm);
				}
				let entropy = 0;
				for (let j = 0; j < n; j++) {
					pi[j] /= s;
					if (pi[j] > tol) {
						entropy -= pi[j] * Math.log2(pi[j])
					}
				}
				if (!isFinite(sigma)) {
					break
				}
				const perp = 2 ** entropy
				if (Math.abs(perp - this._perplexity) < tol) {
					break
				} else if (perp < this._perplexity) {
					lowsigma = sigma
					sigma = (highsigma === null) ? sigma * 2 : (sigma + highsigma) / 2
				} else {
					highsigma = sigma
					sigma = (sigma + lowsigma) / 2;
				}
			}
			pj_i.push(pi)
		}

		const p = [];
		for (let i = 0; i < n; p[i++] = Array(n));
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				p[i][j] = p[j][i] = (pj_i[i][j] + pj_i[j][i]) / (2 * n)
			}
		}

		const qtmp = [];
		let qden = 0;
		for (let i = 0; i < n; qtmp[i++] = Array(n));
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				const v = 1 / (1 + y[i].reduce((a, v, k) => a + (v - y[j][k]) ** 2, 0))
				qtmp[i][j] = qtmp[j][i] = v;
				if (i !== j) qden += v * 2;
			}
		}
		const q = qtmp.map(r => r.map(v => v / qden));

		const d = this._rd;
		const dy = []
		for (let i = 0; i < n; i++) {
			dy[i] = Array(d).fill(0);
			for (let j = 0; j < n; j++) {
				if (j === i) continue;
				const c = (p[i][j] - q[i][j]) * qtmp[i][j]
				for (let k = 0; k < d; k++) {
					dy[i][k] += c * (y[i][k] - y[j][k])
				}
			}
		}
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < d; k++) {
				y[i][k] -= dy[i][k] * 4 * this._learning_rate;
			}
		}
		this._epoch += 1;

		return new Matrix(n, d, this._y);
	}
}

var dispTSNE = function(elm, platform) {
	const setting = platform.setting;
	const width = platform.width;
	const height = platform.height;

	let model = null;
	let isRunning = false;

	const fitModel = (cb) => {
		if (model === null) {
			cb && cb()
			return
		}
		platform.plot((tx, ty, px, pred_cb) => {
				let y = model.fit();
				pred_cb(y.toArray());

				cb && cb()
			}
		);
	};

	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		platform.init()
		const dim = setting.dimension;
		model = new tSNE(platform.datas.x, dim);
	}).step(fitModel).epoch()
	return () => {
		slbConf.stop()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Fit" button.'
	platform.setting.terminate = dispTSNE(platform.setting.ml.configElement, platform);
}
