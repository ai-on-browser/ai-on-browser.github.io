importScripts('../../js/math.js');

self.model = null;

self.addEventListener('message', function(e) {
	const data = e.data;
	if (data.mode == 'init') {
		self.model = new Lasso(data.in_dim, data.out_dim, data.lambda, data.method || "CD");
	} else if (data.mode == 'fit') {
		const x = new Matrix(data.x.length, data.x[0].length, data.x);
		const y = new Matrix(data.y.length, data.y[0].length, data.y);
		for (let i = 0; i < data.iteration; i++) {
			self.model.fit(x, y);
		}
		self.postMessage(null);
	} else if (data.mode == 'predict') {
		const x = new Matrix(data.x.length, data.x[0].length, data.x);
		self.postMessage(self.model.predict(x).value);
	} else if (data.mode == 'importance') {
		self.postMessage(self.model.importance().toArray())
	}
}, false);

class Lasso {
	// see http://satopirka.com/2017/10/lasso%E3%81%AE%E7%90%86%E8%AB%96%E3%81%A8%E5%AE%9F%E8%A3%85--%E3%82%B9%E3%83%91%E3%83%BC%E3%82%B9%E3%81%AA%E8%A7%A3%E3%81%AE%E6%8E%A8%E5%AE%9A%E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0-/
	// see https://qiita.com/fujiisoup/items/f2fe3b508763b0cc6832
	constructor(in_dim, out_dim, lambda = 0.1, method = "CD") {
		this._w = Matrix.randn(in_dim + 1, out_dim);
		this._lambda = lambda;
		this._method = method;
	}

	_soft_thresholding(x, l) {
		x.map(v => (v < -l) ? v + l : (v > l) ? v - l : 0);
	}

	_calc_b0(x, y) {
		let wei = this._w.copy();
		for (let j = 0; j < wei.cols; j++) {
			wei.set(wei.rows - 1, j, 0);
		}
		let xw = x.dot(wei);
		xw.isub(y);
		let b0 = xw.sum(0);
		b0.div(x.rows);
		this._w.set(this._w.rows - 1, 0, b0);
	}

	fit(x, y) {
		x = x.resize(x.rows, x.cols + 1, 1);

		if (this._method === "ISTA") {
			let xx = x.tDot(x);
			xx.map(v => Math.abs(v));
			xx = xx.sum(0);
			let mx = Math.max.apply(null, xx.value);
			const L = mx / this._lambda;
			let new_w = x.dot(this._w);
			new_w.isub(y);
			new_w = x.tDot(new_w);
			new_w.div(this._lambda * L);

			this._w.add(new_w);
			this._soft_thresholding(this._w, 1 / L);
		} else if (this._method === "CD") {
			for (let i = 0; i < this._w.rows; i++) {
				let xi = x.col(i);
				let wei = this._w.copy();
				for (let j = 0; j < this._w.cols; j++) {
					wei.set(i, j, 0);
				}
				wei = x.dot(wei);
				wei.isub(y);

				let d = xi.tDot(wei);
				this._soft_thresholding(d, this._lambda);
				d.div(xi.tDot(xi));

				this._w.set(i, 0, d);
			}
		} else if (this._method === "LARS") {
		}
		//this._calc_b0(x, y);
	}

	predict(x) {
		x = x.resize(x.rows, x.cols + 1, 1);
		return x.dot(this._w);
	}

	importance() {
		return this._w.resize(this._w.rows - 1, this._w.cols)
	}
}

