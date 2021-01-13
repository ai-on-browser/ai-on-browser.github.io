importScripts('../../js/math.js');

self.model = null;

self.addEventListener('message', function(e) {
	const data = e.data;
	if (data.mode == 'init') {
		self.model = new ElasticNet(data.in_dim, data.out_dim, data.lambda, data.alpha);
	} else if (data.mode == 'fit') {
		data.alpha && (self.model._alpha = data.alpha);
		const x = new Matrix(data.x.length, data.x[0].length, data.x);
		const y = new Matrix(data.y.length, data.y[0].length, data.y);
		for (let i = 0; i < data.iteration; i++) {
			self.model.fit(x, y);
		}
		self.postMessage(null);
	} else if (data.mode == 'predict') {
		const x = new Matrix(data.x.length, data.x[0].length, data.x);
		let p = self.model.predict(x);
		self.postMessage(self.model.predict(x).value);
	} else if (data.mode == 'importance') {
		self.postMessage(self.model.importance().toArray())
	}
}, false);

class ElasticNet {
	// see "Regularization and variable selection via the elastic net" H. Zou, T. Hastie. (2005)
	constructor(in_dim, out_dim, lambda = 0.1, alpha = 0.5, method = "CD") {
		this._w = Matrix.randn(in_dim + 1, out_dim);
		this._method = method;
		this._lambda = lambda;
		this._alpha = alpha;
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
		const l1 = this._lambda * this._alpha;
		const l2 = this._lambda * (1 - this._alpha);
		x = x.resize(x.rows, x.cols + 1, 1);

		const p = x.cols;

		x = x.concat(Matrix.eye(p, p, Math.sqrt(l2)), 0);
		x.div(Math.sqrt(1 + l2));
		y = y.concat(Matrix.zeros(p, y.cols), 0);

		this._w.mult(Math.sqrt(1 + l2));
		const lambda = l1 / Math.sqrt(1 + l2);

		if (this._method == "ISTA") {
			let xx = x.tDot(x);
			xx.map(v => Math.abs(v));
			let mx = Math.max.apply(null, xx.sum(0).value);
			const L = mx / lambda;
			let new_w = x.dot(this._w);
			new_w.isub(y);
			new_w = x.t.dot(new_w);
			new_w.div(lambda * L);
			new_w.add(this._w);
			this._soft_thresholding(new_w, 1 / L);

			this._w = new_w;
		} else if (this._method == "CD") {
			for (let i = 0; i < this._w.rows; i++) {
				let xi = x.col(i);
				let wei = this._w.copy();
				for (let j = 0; j < this._w.cols; j++) {
					wei.set(i, j, 0);
				}
				wei = x.dot(wei);
				wei.isub(y);

				let d = xi.tDot(wei);
				this._soft_thresholding(d, lambda);
				d.div(xi.tDot(xi));

				this._w.set(i, 0, d);
			}
		}
		this._w.div(Math.sqrt(1 + l2));
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

