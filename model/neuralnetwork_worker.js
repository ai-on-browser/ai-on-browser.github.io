importScripts('../js/math.js');

self.model = {};
self.epoch = {};

self.addEventListener('message', function(e) {
	const data = e.data;
	if (data.mode == 'init') {
		const id = Math.random().toString(32).substring(2);
		self.model[id] = new NeuralNetwork(data.layers);
		self.epoch[id] = 0;
		self.postMessage(id);
	} else if (data.mode == 'fit') {
		const samples = data.x.length;
		if (samples == 0) {
			self.postMessage(null);
			return;
		}

		let x;
		if (Array.isArray(x)) {
			x = Matrix.fromArray(data.x);
		} else {
			x = {};
			for (const k of Object.keys(data.x)) {
				x[k] = Matrix.fromArray(data.x[k]);
			}
		}
		const t = Matrix.fromArray(data.y);

		const loss = self.model[data.id].fit(x, t, data.iteration, data.rate);
		self.epoch[data.id] += data.iteration;
		self.postMessage({
			epoch: self.epoch[data.id],
			loss: loss,
		});
	} else if (data.mode == 'predict') {
		const samples = data.x.length;
		if (samples == 0) {
			self.postMessage([]);
			return;
		}

		let x;
		if (Array.isArray(x)) {
			x = Matrix.fromArray(data.x);
		} else {
			x = {};
			for (const k of Object.keys(data.x)) {
				x[k] = Matrix.fromArray(data.x[k]);
			}
		}
		const y = self.model[data.id].calc(x, data.out);
		if (Array.isArray(y)) {
			self.postMessage(y.toArray());
		} else {
			for (const k of Object.keys(y)) {
				y[k] = y[k].toArray();
			}
			self.postMessage(y);
		}
	}
}, false);

function NeuralnetworkException(message, value) {
	this.message = message;
	this.value = value;
	this.name = NeuralnetworkException;
}

class NeuralNetwork {
	constructor(layers) {
		this._layers = [];
		for (const l of layers) {
			const cl = new NeuralnetworkLayers[l.type](l);
			cl.name = l.name;
			cl.parent = [];
			if (l.input) {
				for (const i of l.input) {
					const tl = this._layers.filter(l => i === l.name);
					cl.parent.push({
						layer: tl[0],
						index: this._layers.indexOf(tl[0])
					});
				}
			} else {
				const pid = this._layers.length - 1;
				if (pid >= 0) {
					cl.parent.push({
						layer: this._layers[pid],
						index: pid
					});
				}
			}
			this._layers.push(cl);
		}
	}

	calc(x, out) {
		for (const l of this._layers) {
			l.bind(x);
		}
		const o = [];
		const r = {};
		for (let i = 0; i < this._layers.length; i++) {
			const l = this._layers[i];
			o[i] = l.calc(...l.parent.map(p => o[p.index]));
			if (out && out.indexOf(l.name) >= 0) {
				r[l.name] = o[i];
				if (Object.keys(r).length === out.length) {
					return r;
				}
			}
		}
		if (out) return r;
		return o[o.length - 1];
	}

	grad(bo) {
		const bi = [];
		for (let i = 0; i < this._layers.length; bi[i++] = []);
		bi[bi.length - 1].push(bo);
		for (let i = this._layers.length - 1; i >= 0; i--) {
			const l = this._layers[i];
			const bo = l.grad(...bi[i]);
			if (Array.isArray(bo)) {
				l.parent.forEach((p, k) => bi[p.index].push(bo[k]));
			} else {
				l.parent.forEach(p => bi[p.index].push(bo));
			}
		}
		return bi[0][0];
	}

	update(learning_rate) {
		for (let i = 0; i < this._layers.length; i++) {
			this._layers[i].update(learning_rate);
		}
	}

	fit(x, t, epoch = 1, learning_rate = 0.1) {
		let e;
		while (epoch-- > 0) {
			const y = this.calc(x);
			e = y.copySub(t);
			e.div(2);
			this.grad(e);
			this.update(learning_rate);
		}
		e.mult(e);
		e = e.mean(1);
		e.map(Math.sqrt);
		return e.mean();
	}
}

const NeuralnetworkLayers = {};

class Layer {
	bind(x) {}

	calc(x) {
		throw new NeuralnetworkException("Not impleneted", this)
	}

	grad(bo) {
		throw new NeuralnetworkException("Not impleneted", this)
	}

	update(rate) {
		throw new NeuralnetworkException("Not impleneted", this)
	}
}

NeuralnetworkLayers['input'] = class InputLayer extends Layer {
	constructor({name = null}) {
		super()
		this._name = name;
	}

	bind(x) {
		if (x instanceof Matrix) {
			this._o = x;
		} else if (x && x[this._name]) {
			this._o = x[this._name];
		} else {
			throw new NeuralnetworkException("Invalid input.", [this, x])
		}
	}

	calc(x) {
		return this._o;
	}

	grad(bo) {}

	update(rate) {}
}

NeuralnetworkLayers['include'] = class IncludeLayer extends Layer {
	constructor({id, input_name = null, train = true}) {
		super();
		this._id = id;
		this._input_name = input_name;
		this._model = self.model[id];
		this._train = train;
		this._org_i = null;
	}

	bind(x) {
		this._org_i = x;
	}

	calc(x) {
		if (!(this._org_i instanceof Matrix) && this._input_name) {
			const org_x = x;
			x = this._org_i;
			x[this._input_name] = org_x;
		}
		return this._model.calc(x);
	}

	grad(bo) {
		return this._model.grad(bo);
	}

	update(rate) {
		if (this._train) {
			this._model.update(rate);
		}
	}
}

NeuralnetworkLayers['full'] = class FullyConnected extends Layer {
	constructor({in_size = null, out_size, l2_decay = 0, l1_decay = 0}) {
		super();
		this._in_size = in_size;
		this._out_size = out_size;
		this._w = null;
		this._b = Matrix.randn(1, out_size);
		this._l2_decay = l2_decay;
		this._l1_decay = l1_decay;
	}

	calc(x) {
		if (!this._w) {
			this._w = Matrix.randn(x.cols, this._out_size);
		}
		this._i = x;
		this._o = x.dot(this._w);
		this._o.add(this._b);
		return this._o;
	}

	grad(bo) {
		this._bo = bo;
		this._bi = bo.dot(this._w.t);
		return this._bi;
	}

	update(rate) {
		const dw = this._i.tDot(this._bo);
		dw.mult(rate / this._i.rows);
		if (this._l2_decay > 0) {
			for (let i = 0; i < dw.rows; i++) {
				for (let j = 0; j < dw.cols; j++) {
					dw.addAt(i, j, this._w.at(i, j) * rate * this._l1_decay);
				}
			}
		}
		if (this._l1_decay > 0) {
			for (let i = 0; i < dw.rows; i++) {
				for (let j = 0; j < dw.cols; j++) {
					dw.addAt(i, j, Math.sign(this._w.at(i, j) >= 0) * rate * this._l1_decay);
				}
			}
		}
		this._w.sub(dw);
		const db = this._bo.sum(0);
		db.mult(rate / this._i.rows);
		this._b.sub(db);
	}
}

NeuralnetworkLayers['dropout'] = class DropoutLayer extends Layer {
	constructor({drop_rate = 0.5}) {
		this._drop_rate = drop_rate;
	}

	_shuffle(n) {
		const arr = Array(n);
		for (let i = 0; i < n; r[i++] = i);
		for (let i = n - 1; i > 0; i--) {
			let r = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[r]] = [arr[r], arr[i]];
		}
		return arr.slice(0, (Math.max(1, Math.floor(n * this._drop_rate))));
	}

	calc(x) {
		this._drop_index = this._shuffle(x.cols);
		const o = x.copy();
		for (let i = 0; i < x.rows; i++) {
			for (const j of this._drop_index) {
				o.set(i, j, 0);
			}
		}
		return o;
	}

	grad(bo) {
		const bi = bo.copy();
		for (let i = 0; i < x.rows; i++) {
			for (const j of this._drop_index) {
				bi.set(i, j, 0);
			}
		}
		return bi;
	}
}

class ActivationLayer extends Layer {
	update(rate) {}
}

NeuralnetworkLayers['linear'] = class LinearLayer extends ActivationLayer {
	calc(x) {
		return x;
	}

	grad(bo) {
		return bo;
	}
}

NeuralnetworkLayers['sigmoid'] = class SigmoidLayer extends ActivationLayer {
	constructor({a = 1}) {
		super();
		this._a = a;
	}

	calc(x) {
		this._o = x.copyMap(v => 1 / (1 + Math.exp(-this._a * v)));
		return this._o;
	}

	grad(bo) {
		const bi = this._o.copyMap(v => v * (1 - v));
		bi.mult(bo);
		return bi;
	}
}

NeuralnetworkLayers['tanh'] = class TanhLayer extends ActivationLayer {
	calc(x) {
		this._i = x;
		return x.copyMap(Math.tanh);
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / (Math.cosh(v) ** 2));
		bi.mult(bo);
		return bi;
	}
}

NeuralnetworkLayers['polynomial'] = class PolynomialLayer extends ActivationLayer {
	constructor({n = 2}) {
		super();
		this._n = n;
	}

	calc(x) {
		this._i = x;
		return x.copyMap(v => v ** this._n)
	}

	grad(bo) {
		const bi = this._i.copyMap(v => this._n * v ** (this._n - 1));
		bi.mult(bo);
		return bi;
	}
}

NeuralnetworkLayers['softsign'] = class SoftsignLayer extends ActivationLayer {
	calc(x) {
		this._i = x;
		return x.copyMap(v => v / (1 + Math.abs(v)));
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / ((1 + Math.abs(v)) ** 2));
		bi.mult(bo);
		return bi;
	}
}

NeuralnetworkLayers['softplus'] = class SoftplusLayer extends ActivationLayer {
	calc(x) {
		this._i = x;
		return x.copyMap(v => Math.log(1 + Math.exp(v)));
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / (1 + Math.exp(-v)));
		bi.mult(bo);
		return bi;
	}
}

NeuralnetworkLayers['abs'] = class AbsLayer extends ActivationLayer {
	calc(x) {
		this._o = x.copyMap(Math.abs);
		return this._o;
	}

	grad(bo) {
		const bi = this._o.copyMap(v => (v < 0) ? -1 : 1);
		bi.mult(bo);
		return bi;
	}
}

NeuralnetworkLayers['relu'] = class ReluLayer extends ActivationLayer {
	calc(x) {
		this._o = x.copyMap(v => (v > 0) ? v : 0);
		return this._o;
	}

	grad(bo) {
		const bi = this._o.copyMap(v => (v > 0) ? 1 : 0);
		bi.mult(bo);
		return bi;
	}
}

NeuralnetworkLayers['leaky_relu'] = class LeakyReluLayer extends ActivationLayer {
	constructor({a = 0.1}) {
		super()
		this._a = a;
	}

	calc(x) {
		this._o = x.copyMap(v => (v > 0) ? v : v * this._a);
		return this._o;
	}

	grad(bo) {
		const bi = this._o.copyMap(v => (v > 0) ? 1 : this._a);
		bi.mult(bo);
		return bi;
	}
}

NeuralnetworkLayers['softmax'] = class SoftmaxLayer extends ActivationLayer {
	calc(x) {
		this._o = x.copyMap(Math.exp);
		this._o.div(this._o.sum(1));
		return this._o;
	}

	grad(bo) {
		this._bi = new Matrix(bo.rows, bo.cols);
		for (let k = 0; k < bo.rows; k++) {
			for (let i = 0; i < bo.cols; i++) {
				const oki = this._o.at(k, i);
				let bki = 0;
				for (let j = 0; j < bo.cols; j++) {
					const v = (i === j) ? (1 - oki) : -oki;
					bki += this._o.at(k, j) * v * bo.at(k, j);
				}
				this._bi.set(k, i, bki);
			}
		}
		return this._bi;
	}
}

NeuralnetworkLayers['concat'] = class ConcatLayer extends ActivationLayer {
	constructor({axis = 1}) {
		super();
		this._axis = axis;
	}

	calc(...x) {
		let m = x[0];
		let c = x[0].size[this._axis];
		this._sizes = [0, c];
		for (let i = 1; i < x.length; i++) {
			m = m.concat(x[i], this._axis);
			this._sizes.push(c += x[i].size[this._axis]);
		}
		return m;
	}

	grad(bo) {
		const bi = [];
		for (let i = 0; i < this._sizes.length - 1; i++) {
			if (this._axis === 1) {
				bi.push(bo.select(0, this._sizes[i], null, this._sizes[i + 1]));
			} else {
				bi.push(bo.select(this._sizes[i], 0, this._sizes[i + 1], null));
			}
		}
		return bi;
	}
}

NeuralnetworkLayers['onehot'] = class OnehotLayer extends ActivationLayer {
	calc(x) {
		if (x.cols !== 1) {
			throw new NeuralnetworkException("Invalid input.", [this, x])
		}
		const values = [...new Set(x.value)];
		const o = Matrix.zeros(x.rows, values.length);
		for (let i = 0; i < x.rows; i++) {
			o.set(i, values.indexOf(x.at(i, 0)), 1)
		}
		return o;
	}

	grad(bo) {
		return bo.sum(1);
	}
}

