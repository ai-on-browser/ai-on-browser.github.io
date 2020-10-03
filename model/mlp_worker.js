importScripts('../js/math.js');

self.model = null;
self.type = null;
self.epoch = 0;

self.addEventListener('message', function(e) {
	const data = e.data;
	if (data.mode == 'init') {
		self.type = data.type;
		let activation = data.activation.map(a => {
			let activation_name = Array.isArray(a) ? a[0] : a;
			let activation_args = Array.isArray(a) ? a.slice(1) : [];
			return Activation[activation_name](...activation_args);
		});
		if (self.type == "classifier") activation.push(Activation["softmax"]());
		self.model = new MLP(data.size, activation, data.l2_decay || 0, data.sparse || []);
		self.epoch = 0;
	} else if (data.mode == 'fit') {
		const samples = data.x.length;
		if (samples == 0) {
			self.postMessage(null);
			return;
		}

		const x = new Matrix(samples, data.x[0].length, data.x);
		let y = null;
		if (self.type == "classifier") {
			y = new Matrix(samples, self.model._classes);
			data.y.forEach((t, i) => y.set(i, t[0], 1));
		} else {
			y = new Matrix(samples, self.model._classes, data.y);
		}

		self.model.fit(x, y, data.iteration, data.rate, data.batch || 0, data.rho || 0);
		self.epoch += data.iteration;
		self.postMessage(self.epoch);
	} else if (data.mode == 'predict') {
		const samples = data.x.length;
		if (samples == 0) {
			self.postMessage([]);
			return;
		}

		const x = new Matrix(samples, data.x[0].length, data.x);
		let a = self.model.predict(x);
		let res = null;
		if (self.type == "classifier") {
			res = a.argmax(1).value;
		} else {
			res = a.toArray();
		}
		self.postMessage(res);
	} else if (data.mode == 'forward') {
		const samples = data.x.length;
		if (samples == 0) {
			self.postMessage([]);
			return;
		}

		const x = new Matrix(samples, data.x[0].length, data.x);
		let a = self.model._forward(x);
		a = a.map(m => m.toArray());
		self.postMessage(a);
	}
}, false);

const Activation = {
	"linear": () => ({
		"call": (x, dst) => x.copy(dst),
		"grad": (x, y) => Matrix.ones(y.rows, y.cols)
	}),
	"polynomial": (n = 2) => ({
		"call": (x, dst) => x.copyMap(v => v ** n, dst),
		"grad": (x, y, dst) => x.copyMap(v => n * v ** (n - 1), dst)
	}),
	"sigmoid": (a = 1) => ({
		"call": (x, dst) => x.copyMap(v => 1 / (1 + Math.exp(-a * v)), dst),
		"grad": (x, y, dst) => y.copyMap(v => v * (1 - v), dst)
	}),
	"tanh": () => ({
		"call": (x, dst) => x.copyMap(v => Math.tanh(v), dst),
		"grad": (x, y, dst) => x.copyMap(v => 1 / (Math.cosh(x) ** 2), dst)
	}),
	"softsign": () => ({
		"call": (x, dst) => x.copyMap(v => v / (1 + Math.abs(v)), dst),
		"grad": (x, y, dst) => x.copyMap(v => 1 / ((1 + Math.abs(v)) ** 2), dst)
	}),
	"softplus": () => ({
		"call": (x, dst) => x.copyMap(v => Math.log(1 + Math.exp(v)), dst),
		"grad": (x, y, dst) => x.copyMap(v => 1 / (1 + Math.exp(-v)), dst)
	}),
	"abs": () => ({
		"call": (x, dst) => x.copyMap(v => Math.abs(v), dst),
		"grad": (x, y, dst) => y.copyMap(v => (v < 0) ? -1 : 1, dst)
	}),
	"relu": () => ({
		"call": (x, dst) => x.copyMap(v => (v > 0) ? v : 0, dst),
		"grad": (x, y, dst) => y.copyMap(v => (v > 0) ? 1 : 0, dst)
	}),
	"leaky_relu": (a = 0.1) => ({
		"call": (x, dst) => x.copyMap(v => (v > 0) ? v : v * a, dst),
		"grad": (x, y, dst) => y.copyMap(v => (v > 0) ? 1 : a, dst)
	}),
	"softmax": () => ({
		"call": (x) => {
			let r = x.copyMap(Math.exp);
			r.div(r.sum(1));
			return r;
		},
		"grad": (x, y) => x
	})
}

class MLP {
	constructor(sizes, activation = [Activation.sigmoid()], l2_decay = 0, sparse = [], rho = 0) {
		this._features = sizes[0];
		this._classes = sizes[sizes.length - 1];
		this._layers = sizes.length;
		this._W = [];
		this._b = [];
		for (let i = 0; i < this._layers - 1; i++) {
			this._W.push(Matrix.randn(sizes[i], sizes[i + 1]));
			this._b.push(Matrix.zeros(1, sizes[i + 1]));
		}
		this._a = activation;
		this._l2_decay = l2_decay;
		this._sparse = sparse;
		this._rho = rho;
		this._sparse_beta = 0.01;
		this._loss_grad = (y, t) => {
			return y.copySub(t);
		};
	}

	_output(x) {
		let a = x;
		for (let i = 0; i < this._layers - 1; i++) {
			a = a.dot(this._W[i]);
			a.add(this._b[i]);
			this._a[i] && this._a[i].call(a, a);
		}
		return a;
	}

	_forward(x) {
		let ret = [x];
		let a = x;
		for (let i = 0; i < this._layers - 1; i++) {
			a = a.dot(this._W[i]);
			a.add(this._b[i]);
			ret.push(a);
			a = (this._a[i] && (a = this._a[i].call(a))) || a;
			ret.push(a);
		}
		return ret;
	}

	_backward(y, t, rho) {
		let e = this._loss_grad(y[y.length - 1], t);
		let ret = [e];

		for (let i = this._layers - 2; i > 0; i--) {
			e = e.dot(this._W[i].t);
			e.mult(this._a[i - 1].grad(y[i * 2 - 1], y[i * 2]));
			if (rho > 0 && this._sparse[i]) {
				// see https://web.stanford.edu/class/cs294a/sparseAutoencoder.pdf
				let rho_hat = y[i * 2].mean(0);
				let rho_e = rho_hat.copyIdiv(-rho);
				rho_e.add(rho_hat.copyIsub(1).copyIdiv(1 - rho));
				rho_e.mult(this._sparse_beta);
				e.add(rho_e);
			}
			ret.push(e);
		}
		//e = e.dot(this._W[0].t);
		//ret.push(e);
		ret.push(null);
		ret.reverse();

		return ret;
	}

	fit(x, y, epoch = 1, rate = 0.1, batch = 0, rho = 0) {
		let perm = [];
		if (batch > 0 && batch < x.rows) {
			for (let i = 0; i < x.rows; perm.push(i++));
			shuffle(perm);
			for (let i = 0; i < batch; perm.push(perm[i++]));
		}

		let x0 = x;
		let y0 = y;
		for (let n = 0; n < epoch; n++) {
			if (perm.length > 0) {
				let p = (n * batch) % x.rows;
				x0 = x.row(perm.slice(p, p + batch));
				y0 = y.row(perm.slice(p, p + batch));
			}
			let fp = this._forward(x0);
			let bp = this._backward(fp, y0, rho);
			let samples = x0.rows;

			for (let i = 0; i < this._layers - 1; i++) {
				let dw = fp[i * 2].tDot(bp[i + 1]);
				dw.mult(rate / samples);
				if (this._l2_decay) dw.add(this._W[i].copyMult(rate * this._l2_decay));
				this._W[i].sub(dw);

				let db = bp[i + 1].sum(0);
				db.mult(rate / samples);
				if (this._l2_decay) db.add(this._b[i].copyMult(rate * this._l2_decay));
				this._b[i].sub(db);
			}
		}
	}

	predict(x) {
		return this._output(x);
	}
}

