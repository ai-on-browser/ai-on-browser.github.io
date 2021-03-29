function NeuralnetworkException(message, value) {
	this.message = message;
	this.value = value;
	this.name = NeuralnetworkException;
}

class NeuralNetwork {
	constructor(layers, loss, optimizer = "sgd") {
		this._request_layer = layers;
		this._layers = [];
		if (layers.filter(l => l.type === 'output').length === 0) {
			layers.push({type: 'output'})
		}
		if (loss) {
			layers.push({type: loss})
		}
		const const_numbers = new Set();
		for (const l of layers) {
			if (l.input && Array.isArray(l.input)) {
				for (let i = 0; i < l.input.length; i++) {
					if (typeof l.input[i] === 'number') {
						const_numbers.add(l.input[i]);
						l.input[i] = `__const_number_${l.input[i]}`;
					}
				}
			}
		}
		if (const_numbers.size) {
			layers[0].input = [];
		}
		this._optimizer = optimizer
		if (optimizer === "adam") {
			this._opt = new AdamOptimizer()
		} else if (optimizer === "momentum") {
			this._opt = new MomentumOptimizer()
		} else if (optimizer === "rmsprop") {
			this._opt = new RMSPropOptimizer()
		} else {
			this._opt = new SGDOptimizer()
		}
		for (const cn of const_numbers) {
			const cl = new NeuralnetworkLayers.const({value: cn, size: 1, input: []})
			cl.network = this;
			cl.name = `__const_number_${cn}`
			cl.parent = [];
			this._layers.push(cl);
		}
		for (const l of layers) {
			const cl = new NeuralnetworkLayers[l.type]({...l, optimizer: this._opt.manager()});
			cl.network = this;
			cl.name = l.name;
			cl.parent = [];
			cl.input = l.input;
			if (l.input) {
				if (typeof l.input === 'string') {
					l.input = [l.input];
				}
				for (const i of l.input) {
					const subscriptRegexp = /\[([0-9]+)\]$/;
					const m = i && i.match(subscriptRegexp);
					const subscript = m ? +m[1] : null;
					const name = m ? i.slice(0, -m[0].length) : i;
					const tl = this._layers.filter(l => name === l.name);
					cl.parent.push({
						layer: tl[0],
						index: this._layers.indexOf(tl[0]),
						subscript: subscript
					});
				}
			} else {
				const pid = this._layers.length - 1;
				if (pid >= 0) {
					cl.parent.push({
						layer: this._layers[pid],
						index: pid,
						subscript: null
					});
				}
			}
			this._layers.push(cl);
		}
	}

	copy() {
		const cp = new NeuralNetwork(this._request_layer, null, this._optimizer);
		for (let i = 0; i < this._layers.length; i++) {
			cp._layers[i].set_params(this._layers[i].get_params());
		}
		return cp;
	}

	calc(x, t, out, options = {}) {
		let data_size = 0
		if (Array.isArray(x)) {
			x = Tensor.fromArray(x);
			if (x.dimension === 2) {
				x = x.toMatrix()
			}
			data_size = x.sizes[0];
		} else if (!(x instanceof Matrix || x instanceof Tensor)) {
			for (const k of Object.keys(x)) {
				x[k] = Tensor.fromArray(x[k]);
				if (x[k].dimension === 2) {
					x[k] = x[k].toMatrix()
				}
				data_size = x[k].sizes[0];
			}
		} else {
			data_size = x.sizes[0];
		}

		for (const l of this._layers) {
			l.bind({input: x, supervisor: t, n: data_size, ...options});
		}
		const o = [];
		const r = {};
		for (let i = 0; i < this._layers.length; i++) {
			const l = this._layers[i];
			o[i] = l.calc(...l.parent.map(p => p.subscript !== null ? o[p.index][p.subscript] : o[p.index]));
			if (out && out.indexOf(l.name) >= 0) {
				r[l.name] = o[i];
				if (Object.keys(r).length === out.length) {
					return r;
				}
			}
			if (!t && l instanceof NeuralnetworkLayers.output) {
				if (out) return r;
				return o[i];
			}
		}
		if (out) return r;
		return o[o.length - 1];
	}

	grad(e) {
		const bi = [];
		let bi_input = null;
		for (let i = 0; i < this._layers.length; bi[i++] = []);
		bi[bi.length - 1] = [new Matrix(1, 1, 1)];
		for (let i = this._layers.length - 1; i >= 0; i--) {
			const l = this._layers[i];
			if (e) {
				if (l instanceof NeuralnetworkLayers.output) {
					bi[i] = [e];
					e = null;
				} else {
					continue;
				}
			}
			if (bi[i].length === 0) continue;
			let bo = l.grad(...bi[i]);
			if (!Array.isArray(bo)) {
				bo = Array(l.parent.length).fill(bo);
			}
			l.parent.forEach((p, k) => {
				if (!bo[k]) return;
				const subidx = p.subscript || 0;
				if (!bi[p.index][subidx]) {
					bi[p.index][subidx] = bo[k].copy();
				} else {
					bi[p.index][subidx].add(bo[k]);
				}
			});
			if (l instanceof NeuralnetworkLayers.input) {
				bi_input = bi[i][0]
			}
		}
		return bi_input;
	}

	update(learning_rate) {
		this._opt.learningRate = learning_rate
		for (let i = 0; i < this._layers.length; i++) {
			this._layers[i].update();
		}
	}

	fit(x, t, epoch = 1, learning_rate = 0.1, batch_size = null, options = {}) {
		if (Array.isArray(x)) {
			x = Tensor.fromArray(x);
			if (x.dimension === 2) {
				x = x.toMatrix()
			}
		} else if (!(x instanceof Matrix || x instanceof Tensor)) {
			for (const k of Object.keys(x)) {
				x[k] = Tensor.fromArray(x[k]);
				if (x[k].dimension === 2) {
					x[k] = x[k].toMatrix()
				}
			}
		}
		t = Matrix.fromArray(t);

		let e;
		while (epoch-- > 0) {
			if (batch_size) {
				for (let i = 0; i < t.rows; i += batch_size) {
					const last = Math.min(t.rows, i + batch_size)
					let xi
					if (x instanceof Matrix || x instanceof Tensor) {
						xi = (x instanceof Matrix) ? x.sliceRow(i, last) : x.slice(i, last)
					} else {
						xi = {}
						for (const k of Object.keys(x)) {
							xi[k] = (x[k] instanceof Matrix) ? x[k].sliceRow(i, last) : x[k].slice(i, last)
						}
					}
					e = this.calc(xi, t.sliceRow(i, last), null, options)
					this.grad()
					this.update(learning_rate)
				}
			} else {
				e = this.calc(x, t, null, options);
				this.grad();
				this.update(learning_rate);
			}
		}
		return e.value;
	}
}

class SGDOptimizer {
	constructor(lr) {
		this._learningrate = lr
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() { return this_._learningrate },
			delta(key, value) {
				return value.copyMult(this.lr)
			}
		}
	}
}

class MomentumOptimizer {
	constructor(lr, beta = 0.9) {
		this._learningrate = lr
		this._beta = beta
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() { return this_._learningrate },
			params: {},
			delta(key, value) {
				if (!this.params[key]) {
					this.params[key] = value
					return value.copyMult(this.lr)
				}
				const v = this.params[key].copyMult(this_._beta)
				v.add(value.copyMult(1 - this_._beta))
				this.params[key] = v
				return v.copyMult(this.lr)
			}
		}
	}
}

class RMSPropOptimizer {
	constructor(lr, beta = 0.999) {
		this._learningrate = lr
		this._beta = beta
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() { return this_._learningrate },
			params: {},
			delta(key, value) {
				if (!this.params[key]) {
					this.params[key] = value.copyMult(value)
					return value.copyMult(this.lr)
				}
				const v = this.params[key].copyMult(this_._beta)
				v.add(value.copyMap(x => (1 - this_._beta) * x * x))
				this.params[key] = v
				return value.copyMult(v.copyMap(x => this.lr / Math.sqrt(x + 1.0e-12)))
			}
		}
	}
}

class AdamOptimizer {
	constructor(lr = 0.001, beta1 = 0.9, beta2 = 0.999) {
		this._learningrate = lr
		this._beta1 = beta1
		this._beta2 = beta2
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() { return this_._learningrate },
			params: {},
			delta(key, value) {
				if (!this.params[key]) {
					this.params[key] = {
						v: value,
						s: value.copyMult(value)
					}
					return value.copyMult(this.lr)
				}
				const v = this.params[key].v.copyMult(this_._beta1)
				v.add(value.copyMult(1 - this_._beta1))
				const s = this.params[key].s.copyMult(this_._beta2)
				s.add(value.copyMap(x => (1 - this_._beta2) * x * x))
				this.params[key] = {v, s}
				return v.copyMult(s.copyMap(x => this.lr / Math.sqrt(x + 1.0e-12)))
			}
		}
	}
}

const NeuralnetworkLayers = {};

class Layer {
	constructor({optimizer = null}) {
		this._opt = optimizer
	}

	bind(x) {}

	calc(x) {
		throw new NeuralnetworkException("Not impleneted", this)
	}

	grad(bo) {
		throw new NeuralnetworkException("Not impleneted", this)
	}

	update() {}

	get_params() {
		return null;
	}

	set_params(param) {}
}

NeuralnetworkLayers.input = class InputLayer extends Layer {
	constructor({name = null, ...rest}) {
		super(rest)
		this._name = name;
	}

	bind({input}) {
		if (input instanceof Matrix || input instanceof Tensor) {
			this._o = input;
		} else if (input && input[this._name]) {
			this._o = input[this._name];
		} else {
			throw new NeuralnetworkException("Invalid input.", [this, input])
		}
	}

	calc() {
		return this._o;
	}

	grad(bo) {}
}

NeuralnetworkLayers.output = class OutputLayer extends Layer {
	calc(x) {
		return x;
	}

	grad(bo) {
		return bo;
	}
}

NeuralnetworkLayers.supervisor = class InputLayer extends Layer {
	bind({supervisor}) {
		if (supervisor instanceof Matrix) {
			this._o = supervisor;
		}
	}

	calc() {
		return this._o;
	}

	grad(bo) {}
}

NeuralnetworkLayers.include = class IncludeLayer extends Layer {
	constructor({id, input_to = null, train = true, ...rest}) {
		super(rest);
		this._id = id;
		this._input_to = input_to;
		this._model = self.model[id];
		this._train = train;
		this._org_i = null;
		this._org_t = null;
	}

	bind({input, supervisor}) {
		this._org_i = input;
		this._org_t = supervisor;
	}

	calc(x) {
		if (!(this._org_i instanceof Matrix) && this._input_to) {
			const org_x = x;
			x = this._org_i;
			x[this._input_to] = org_x;
		}
		return this._model.calc(x);
	}

	grad(bo) {
		return this._model.grad(bo);
	}

	update() {
		if (this._train) {
			this._model.update(this._opt.lr);
		}
	}
}

NeuralnetworkLayers.const = class ConstLayer extends Layer {
	constructor({value, ...rest}) {
		super(rest);
		this._value = value;
	}

	calc() {
		return new Matrix(1, 1, this._value)
	}

	grad(bo) {}
}

NeuralnetworkLayers.random = class RandomLayer extends Layer {
	constructor({size, ...rest}) {
		super(rest);
		this._size = size;
		this._rows = 1;
	}

	bind({n}) {
		this._rows = n;
	}

	calc() {
		return Matrix.randn(this._rows, this._size);
	}

	grad(bo) {}
}

NeuralnetworkLayers.variable = class VariableLayer extends Layer {
	constructor({size, l2_decay = 0, l1_decay = 0, ...rest}) {
		super(rest)
		this._size = size
		this._v = Matrix.randn(size[0], size[1]);
		this._l2_decay = l2_decay
		this._l1_decay = l1_decay
		this._n = 1;
	}

	bind({n}) {
		this._n = n;
	}

	calc() {
		return this._v;
	}

	grad(bo) {
		this._bo = bo;
	}

	update() {
		const d = this._bo.copyDiv(this._n);
		if (this._l2_decay > 0 || this._l1_decay > 0) {
			for (let i = 0; i < this._v.rows; i++) {
				for (let j = 0; j < this._v.cols; j++) {
					const v = this._v.at(i, j)
					d.addAt(i, j, v * this._l2_decay + Math.sign(v) * this._l1_decay);
				}
			}
		}
		this._v.sub(this._opt.delta('v', d))
	}

	get_params() {
		return {
			v: this._v
		}
	}

	set_params(param) {
		this._v = param.v.copy();
	}
}

NeuralnetworkLayers.full = class FullyConnected extends Layer {
	constructor({in_size = null, out_size, activation = null, l2_decay = 0, l1_decay = 0, ...rest}) {
		super(rest);
		this._in_size = in_size;
		this._out_size = out_size;
		this._w = null;
		this._b = Matrix.randn(1, out_size);
		if (activation) {
			this._activation_func = new NeuralnetworkLayers[activation](rest)
		}
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
		if (this._activation_func) {
			return this._activation_func.calc(this._o);
		}
		return this._o;
	}

	grad(bo) {
		this._bo = bo;
		if (this._activation_func) {
			this._bo = this._activation_func.grad(bo);
		}
		this._bi = this._bo.dot(this._w.t);
		return this._bi;
	}

	update() {
		const dw = this._i.tDot(this._bo);
		dw.div(this._i.rows);
		if (this._l2_decay > 0 || this._l1_decay > 0) {
			for (let i = 0; i < dw.rows; i++) {
				for (let j = 0; j < dw.cols; j++) {
					const v = this._w.at(i, j)
					dw.addAt(i, j, v * this._l2_decay + Math.sign(v) * this._l1_decay);
				}
			}
		}
		this._w.sub(this._opt.delta('w', dw));
		const db = this._bo.sum(0);
		db.div(this._i.rows);
		this._b.sub(this._opt.delta('b', db));
	}

	get_params() {
		return {
			w: this._w,
			b: this._b
		}
	}

	set_params(param) {
		this._w = param.w.copy();
		this._b = param.b.copy();
	}
}

NeuralnetworkLayers.linear = class LinearLayer extends Layer {
	calc(x) {
		return x;
	}

	grad(bo) {
		return bo;
	}
}

NeuralnetworkLayers.negative = class NegativeLayer extends Layer {
	calc(x) {
		return x.copyMult(-1);
	}

	grad(bo) {
		return bo.copyMult(-1);
	}
}

NeuralnetworkLayers.sigmoid = class SigmoidLayer extends Layer {
	constructor({a = 1, ...rest}) {
		super(rest);
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

NeuralnetworkLayers.tanh = class TanhLayer extends Layer {
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

NeuralnetworkLayers.polynomial = class PolynomialLayer extends Layer {
	constructor({n = 2, ...rest}) {
		super(rest);
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

NeuralnetworkLayers.softsign = class SoftsignLayer extends Layer {
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

NeuralnetworkLayers.softplus = class SoftplusLayer extends Layer {
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

NeuralnetworkLayers.abs = class AbsLayer extends Layer {
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

NeuralnetworkLayers.relu = class ReluLayer extends Layer {
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

NeuralnetworkLayers.leaky_relu = class LeakyReluLayer extends Layer {
	constructor({a = 0.1, ...rest}) {
		super(rest)
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

NeuralnetworkLayers.softmax = class SoftmaxLayer extends Layer {
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

NeuralnetworkLayers.log = class LogLayer extends Layer {
	calc(x) {
		this._i = x;
		return x.copyMap(Math.log);
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / v);
		bi.mult(bo);
		return bi;
	}
}

NeuralnetworkLayers.exp = class ExpLayer extends Layer {
	calc(x) {
		this._o = x.copyMap(Math.exp);
		return this._o;
	}

	grad(bo) {
		return this._o.copyMult(bo);
	}
}

NeuralnetworkLayers.square = class SquareLayer extends Layer {
	calc(x) {
		this._i = x;
		return x.copyMult(x);
	}

	grad(bo) {
		const bi = this._i.copyMult(2);
		bi.mult(bo);
		return bi;
	}
}

NeuralnetworkLayers.sqrt = class Sqrt extends Layer {
	calc(x) {
		this._i = x;
		this._o = x.copyMap(Math.sqrt)
		return this._o;
	}

	grad(bo) {
		const bi = this._o.copyMap(v => 1 / (2 * v));
		bi.mult(bo);
		return bi;
	}
}

NeuralnetworkLayers.power = class PowerLayer extends Layer {
	constructor({n, ...rest}) {
		super(rest);
		this._n = n;
	}

	calc(x) {
		if (this._n === 1) {
			return x;
		}
		this._o1 = x.copy();
		for (let i = 1; i < this._n - 1; i++) {
			this._o1.mult(x);
		}
		return this._o1.copyMult(x);
	}

	grad(bo) {
		if (this._n === 1) {
			return bo;
		}
		const bi = this._o1.copyMult(this._n);
		bi.mult(bo);
		return bi;
	}
}

NeuralnetworkLayers.sparsity = class SparseLayer extends Layer {
	constructor({rho, beta, ...rest}) {
		super(rest)
		this._rho = rho
		this._beta = beta
	}

	bind({rho}) {
		this._rho = rho || this._rho
	}

	calc(x) {
		this._rho_hat = x.mean(0)
		return x
	}

	grad(bo) {
		const rho_e = this._rho_hat.copyIdiv(-this._rho)
		rho_e.add(this._rho_hat.copyIsub(1).copyIdiv(1 - this._rho))
		rho_e.mult(this._beta)
		return bo.copyAdd(rho_e)
	}
}

NeuralnetworkLayers.dropout = class DropoutLayer extends Layer {
	constructor({drop_rate = 0.5, ...rest}) {
		super(rest)
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

NeuralnetworkLayers.clip = class ClipLayer extends Layer {
	constructor({min = null, max = null, ...rest}) {
		super(rest);
		this._min = min;
		this._max = max;
	}

	calc(x) {
		const o = x.copy();
		o.map(v => {
			if (this._min !== null && v < this._min) {
				return this._min;
			} else if (this._max !== null && v > this._max) {
				return this._max;
			}
			return v;
		})
		return o;
	}

	grad(bo) {
		return bo;
	}
}

NeuralnetworkLayers.add = class AddLayer extends Layer {
	calc(...x) {
		this._sizes = x.map(m => m.sizes);
		let m = x[0].copy();
		for (let i = 1; i < x.length; i++) {
			m.add(x[i]);
		}
		return m;
	}

	grad(bo) {
		const boSize = bo.sizes
		return this._sizes.map(s => {
			const repeats = boSize.map((bs, i) => bs / s[i])
			if (repeats.every(r => r === 1)) {
				return bo
			}
			const m = Matrix.zeros(s[0], s[1])
			for (let i = 0; i < boSize[0]; i++) {
				for (let j = 0; j < boSize[1]; j++) {
					m.addAt(i % s[0], j % s[1], bo.at(i, j))
				}
			}
		})
	}
}

NeuralnetworkLayers.sub = class SubLayer extends Layer {
	calc(...x) {
		this._sizes = x.map(m => m.sizes);
		let m = x[0].copy();
		for (let i = 1; i < x.length; i++) {
			m.sub(x[i]);
		}
		return m;
	}

	grad(bo) {
		const boNeg = bo.copyMap(v => -v);
		return this._sizes.map((s, k) => {
			const t = (k === 0) ? bo : boNeg
			const repeats = t.sizes.map((ts, i) => ts / s[i])
			if (repeats.every(r => r === 1)) {
				return t
			}
			const m = Matrix.zeros(s[0], s[1])
			for (let i = 0; i < t.sizes[0]; i++) {
				for (let j = 0; j < t.sizes[1]; j++) {
					m.addAt(i % s[0], j % s[1], t.at(i, j))
				}
			}
		})
	}
}

NeuralnetworkLayers.mult = class MultLayer extends Layer {
	calc(...x) {
		this._i = x;
		let m = x[0].copy();
		for (let i = 1; i < x.length; i++) {
			m.mult(x[i]);
		}
		return m;
	}

	grad(bo) {
		return this._i.map((x, k) => {
			const s = x.sizes;
			const t = bo.copy();
			for (let j = 0; j < this._i.length; j++) {
				if (k === j) continue;
				t.mult(this._i[j]);
			}
			const repeats = t.sizes.map((ts, i) => ts / s[i])
			if (repeats.every(r => r === 1)) {
				return t
			}
			const m = Matrix.zeros(s[0], s[1])
			for (let i = 0; i < t.sizes[0]; i++) {
				for (let j = 0; j < t.sizes[1]; j++) {
					m.addAt(i % s[0], j % s[1], t.at(i, j))
				}
			}
		})
	}
}

NeuralnetworkLayers.div = class DivLayer extends Layer {
	calc(...x) {
		this._i = x;
		this._den = x[1].copy();
		for (let i = 2; i < x.length; i++) {
			this._den.mult(x[i]);
		}
		return x[0].copyDiv(this._den);
	}

	grad(bo) {
		const nNeg = this._i[0].copyMult(-1);
		nNeg.div(this._den);
		nNeg.div(this._den);
		nNeg.mult(bo);
		return this._i.map((x, k) => {
			const s = x.sizes;
			let t
			if (k === 0) {
				t = bo.copyDiv(this._den)
			} else {
				t = nNeg.copy()
				for (let j = 1; j < this._i.length; j++) {
					if (i === j) continue;
					t.mult(this._i[j]);
				}
			}
			const repeats = t.sizes.map((ts, i) => ts / s[i])
			if (repeats.every(r => r === 1)) {
				return t
			}
			const m = Matrix.zeros(s[0], s[1])
			for (let i = 0; i < t.sizes[0]; i++) {
				for (let j = 0; j < t.sizes[1]; j++) {
					m.addAt(i % s[0], j % s[1], t.at(i, j))
				}
			}
		})
	}
}

NeuralnetworkLayers.matmul = class MatmulLayer extends Layer {
	calc(...x) {
		this._i = x;
		let o = x[0]
		for (let i = 1; i < x.length; i++) {
			o = o.dot(x[i])
		}
		return o
	}

	grad(bo) {
		const bi = [];
		for (let i = 0; i < this._i.length; i++) {
			let m = null
			if (i === 0) {
				m = bo;
			} else {
				m = this._i[0];
				for (let k = 1; k < i; k++) {
					m = m.dot(this._i[k]);
				}
				m = m.tDot(bo);
			}
			for (let k = this._i.length - 1; k > i; k--) {
				m.dot(this._i[k].t)
			}
			bi.push(m);
		}
		return bi
	}
}

NeuralnetworkLayers.conv = class ConvLayer extends Layer {
	constructor({kernel, channel = null, stride = null, padding = null, activation = null, l2_decay = 0, l1_decay = 0, ...rest}) {
		super(rest);
		this._in_channel = null
		this._out_channel = channel
		this._kernel = kernel
		this._stride = stride || 1
		this._padding = padding || 0
		this._w = null;
		if (activation) {
			this._activation_func = new NeuralnetworkLayers[activation](rest)
		}
		this._l2_decay = l2_decay;
		this._l1_decay = l1_decay;
	}

	calc(x) {
		if (!Array.isArray(this._kernel)) {
			this._kernel = Array(x.dimension - 2).fill(this._kernel)
		}
		if (x.dimension !== this._kernel.length + 2) {
			throw new NeuralnetworkException("Invalid kernel size", [this, x])
		}
		if (!this._w) {
			this._in_channel = x.sizes[x.dimension - 1]
			if (!this._out_channel) {
				this._out_channel = this._in_channel * 2
			}
			this._w = Tensor.randn([this._in_channel, ...this._kernel, this._out_channel])
		}
		this._i = x;
		const outSize = [x.sizes[0], ...this._kernel.map((k, d) => Math.ceil((x.sizes[d + 1] + this._padding * 2) / this._stride) + 1 - k), this._out_channel]
		this._o = new Tensor(outSize)
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let c = 0; c < this._in_channel; c++) {
				for (let b = 0; b < this._out_channel; b++) {
					if (this._kernel.length === 2) {
						for (let m = 0; m < outSize[1]; m++) {
							for (let n = 0; n < outSize[2]; n++) {
								let v = 0
								for (let s = 0; s < this._kernel[0]; s++) {
									if (m - this._padding + s < 0 || m - this._padding + s >= x.sizes[1]) {
										continue
									}
									for (let t = 0; t < this._kernel[1]; t++) {
										if (n - this._padding + t < 0 || n - this._padding + t >= x.sizes[2]) {
											continue
										}
										v += x.at(i, m - this._padding + s, n - this._padding + t, c) * this._w.at(c, s, t, b)
									}
								}
								this._o.set([i, m, n, b], v)
							}
						}
					} else {
						throw new NeuralnetworkException("Invalid dimension.")
					}
				}
			}
		}
		if (this._activation_func) {
			return this._activation_func.calc(this._o);
		}
		return this._o;
	}

	grad(bo) {
		this._bo = bo
		if (this._activation_func) {
			this._bo = this._activation_func.grad(bo);
		}
		this._bi = new Tensor(this._i.sizes)
		for (let i = 0; i < this._i.sizes[0]; i++) {
			for (let c = 0; c < this._in_channel; c++) {
				for (let b = 0; b < this._out_channel; b++) {
					if (this._kernel.length === 2) {
						for (let m = 0; m < bo.sizes[1]; m++) {
							for (let n = 0; n < bo.sizes[2]; n++) {
								for (let s = 0; s < this._kernel[0]; s++) {
									if (m - this._padding + s < 0 || m - this._padding + s >= x.sizes[1]) {
										continue
									}
									for (let t = 0; t < this._kernel[1]; t++) {
										if (n - this._padding + t < 0 || n - this._padding + t >= x.sizes[2]) {
											continue
										}
										const v = this._bi.at(i, m - this._padding + s, n - this._padding + t, c)
										this._bi.set([i, m - this._padding + s, n - this._padding + t, c], v + this._w.at(c, s, t, b) * bo.at(i, m, n, b))
									}
								}
							}
						}
					} else {
						throw new NeuralnetworkException("Invalid dimension.")
					}
				}
			}
		}
		return this._bi
	}

	update() {
		const dw = new Tensor(this._w.sizes)
		for (let i = 0; i < this._i.sizes[0]; i++) {
			for (let c = 0; c < this._in_channel; c++) {
				for (let b = 0; b < this._out_channel; b++) {
					if (this._kernel.length === 2) {
						for (let m = 0; m < this._bo.sizes[1]; m++) {
							for (let n = 0; n < this._bo.sizes[2]; n++) {
								for (let s = 0; s < this._kernel[0]; s++) {
									if (m - this._padding + s < 0 || m - this._padding + s >= x.sizes[1]) {
										continue
									}
									for (let t = 0; t < this._kernel[1]; t++) {
										if (n - this._padding + t < 0 || n - this._padding + t >= x.sizes[2]) {
											continue
										}
										const v = dw.at(c, s, t, b)
										dw.set([c, s, t, b], v + this._i.at(i, m - this._padding + s, n - this._padding + t, c) * this._bo.at(i, m, n, b))
									}
								}
							}
						}
					} else {
						throw new NeuralnetworkException("Invalid dimension.")
					}
				}
			}
		}
		dw.reshape(dw.sizes[0], dw.length / dw.sizes[0])
		const d = this._opt.delta('w', dw.toMatrix())
		for (let i = 0; i < this._w.length; i++) {
			this._w.value[i] -= d.value[i]
		}
	}

	get_params() {
		return {
			w: this._w
		}
	}

	set_params(param) {
		this._w = param.w.copy()
	}
}

NeuralnetworkLayers.sum = class SumLayer extends Layer {
	constructor({axis = -1, ...rest}) {
		super(rest);
		this._axis = axis;
	}

	calc(x) {
		this._i = x;
		if (this._axis < 0) {
			return new Matrix(1, 1, x.sum());
		}
		return x.sum(this._axis);
	}

	grad(bo) {
		if (this._axis < 0) {
			return new Matrix(this._i.rows, this._i.cols, bo.value[0]);
		}
		return bo.copyRepeat(this._i.sizes[this._axis], this._axis);
	}
}

NeuralnetworkLayers.mean = class MeanLayer extends Layer {
	constructor({axis = -1, ...rest}) {
		super(rest);
		this._axis = axis;
	}

	calc(x) {
		this._i = x;
		if (this._axis < 0) {
			return new Matrix(1, 1, x.mean());
		}
		return x.mean(this._axis);
	}

	grad(bo) {
		if (this._axis < 0) {
			return new Matrix(this._i.rows, this._i.cols, bo.value[0] / this._i.length);
		}
		const bi = bo.copyRepeat(this._i.sizes[this._axis], this._axis);
		bi.div(this._i.sizes[this._axis]);
		return bi;
	}
}

NeuralnetworkLayers.variance = class VarLayer extends Layer {
	constructor({axis = -1, ...rest}) {
		super(rest);
		this._axis = axis;
	}

	calc(x) {
		this._i = x;
		this._m = x.mean(this._axis)
		if (this._axis < 0) {
			return new Matrix(1, 1, x.variance())
		}
		return x.variance(this._axis)
	}

	grad(bo) {
		if (this._axis < 0) {
			return this._i.copyMap(v => 2 * (v - this._m) / this._i.length)
		}
		const bi = this._i.copySub(this._m)
		bi.mult(2 / this._i.sizes[this._axis])
		bi.mult(bo)
		return bi
	}
}

NeuralnetworkLayers.reshape = class ReshapeLayer extends Layer {
	constructor({size, ...rest}) {
		super(rest)
		this._size = size
	}

	calc(x) {
		this._in_size = x.sizes.concat()
		this._out_size = [x.sizes[0], ...this._size]
		const o = x.copy()
		o.reshape(this._out_size)
		if (o instanceof Tensor && o.dimension === 2) {
			return o.toMatrix()
		}
		return o
	}

	grad(bo) {
		let bi = bo.copy()
		if (bi instanceof Matrix && this._in_size.length > 2) {
			bi = Tensor.fromArray(bi)
		}
		bi.reshape(this._in_size)
		return bi
	}
}

NeuralnetworkLayers.transpose = class TransposeLayer extends Layer {
	constructor({axis, ...rest}) {
		super(rest)
		this._axis = axis
	}

	calc(x) {
		return x.transpose(this._axis)
	}

	grad(bo) {
		const raxis = []
		for (let i = 0; i < this._axis.length; i++) {
			raxis.push(this._axis.indexOf(i))
		}
		return bo.transpose(raxis)
	}
}

NeuralnetworkLayers.flatten = class FlattenLayer extends Layer {
	calc(x) {
		this._in_size = x.sizes.concat()
		if (x instanceof Matrix) {
			return x
		}
		const c = x.copy()
		c.reshape(c.sizes[0], c.length / c.sizes[0])
		return c.toMatrix()
	}

	grad(bo) {
		if (this._in_size.length === 2) {
			return bo
		}
		const bi = Tensor.fromArray(bo.copy())
		bi.reshape(...this._in_size)
		return bi
	}
}

NeuralnetworkLayers.concat = class ConcatLayer extends Layer {
	constructor({axis = 1, ...rest}) {
		super(rest);
		this._axis = axis;
	}

	calc(...x) {
		let m = x[0];
		let c = x[0].sizes[this._axis];
		this._sizes = [0, c];
		for (let i = 1; i < x.length; i++) {
			m = m.concat(x[i], this._axis);
			this._sizes.push(c += x[i].sizes[this._axis]);
		}
		return m;
	}

	grad(bo) {
		const bi = [];
		for (let i = 0; i < this._sizes.length - 1; i++) {
			if (this._axis === 1) {
				bi.push(bo.sliceCol(this._sizes[i], this._sizes[i + 1]));
			} else {
				bi.push(bo.sliceRow(this._sizes[i], this._sizes[i + 1]));
			}
		}
		return bi;
	}
}

NeuralnetworkLayers.split = class SplitLayer extends Layer {
	constructor({axis = 1, size, ...rest}) {
		super(rest);
		this._axis = axis;
		this._size = size
	}

	calc(x) {
		let c = 0;
		const o = [];
		for (let i = 0; i < this._size.length; i++) {
			if (this._axis === 1) {
				o.push(x.sliceCol(c, c + this._size[i]))
			} else {
				o.push(x.sliceRow(c, c + this._size[i]))
			}
			c += this._size[i];
		}
		return o;
	}

	grad(...bo) {
		let bi = bo[0];
		for (let i = 1; i < bo.length; i++) {
			bi = bi.concat(bo[i], this._axis);
		}
		return bi;
	}
}

NeuralnetworkLayers.onehot = class OnehotLayer extends Layer {
	constructor({class_size = null, ...rest}) {
		super(rest);
		this._c = class_size
		this._values = []
	}

	calc(x) {
		if (x.cols !== 1) {
			throw new NeuralnetworkException("Invalid input.", [this, x])
		}
		const values = [...new Set(x.value)];
		if (!this._c) {
			this._c = values.length
		}
		for (let i = 0; i < values.length && this._values.length < this._c; i++) {
			if (this._values.indexOf(values[i]) < 0) {
				this._values.push(values[i])
			}
		}
		const o = Matrix.zeros(x.rows, this._c);
		for (let i = 0; i < x.rows; i++) {
			o.set(i, this._values.indexOf(x.at(i, 0)), 1)
		}
		return o;
	}

	grad(bo) {
		return bo.sum(1);
	}
}

NeuralnetworkLayers.less = class LessLayer extends Layer {
	calc(...x) {
		this._i = x;
		this._o = x[0].copy();
		this._o.map((v, i) => v < x[1].value[i])
		return this._o
	}

	// grad() {}
}

NeuralnetworkLayers.cond = class CondLayer extends Layer {
	calc(...x) {
		this._cond = x[0];
		const t = x[1];
		const f = x[2];
		this._o = new Matrix(this._cond.rows, this._cond.cols);
		this._o.map((v, i) => this._cond.value[i] ? t.value[i] : f.value[i]);
		return this._o;
	}

	grad(bo) {
		const bi = [null, bo.copy(), bo.copy()];
		this._cond.forEach((v, i) => v ? (bi[2].value[i] = 0) : (bi[1].value[i] = 0));
		return bi;
	}
}

NeuralnetworkLayers.loss = class LossLayer extends Layer {
	calc(x) {
		return x;
	}

	grad() {
		return new Matrix(1, 1, 1);
	}
}

NeuralnetworkLayers.mse = class MSELayer extends NeuralnetworkLayers.loss {
	bind({supervisor}) {
		this._t = supervisor;
	}

	calc(x) {
		this._i = x;
		const o = x.copySub(this._t);
		o.mult(o);
		return new Matrix(1, 1, o.mean());
	}

	grad() {
		const bi = this._i.copySub(this._t);
		bi.div(2);
		return bi;
	}
}

NeuralnetworkLayers.huber = class HuberLayer extends NeuralnetworkLayers.loss {
	bind({supervisor}) {
		this._t = supervisor;
	}

	calc(x) {
		this._i = x;
		const err = this._t.copySub(x);
		err.map(Math.abs);
		this._cond = new Matrix(err.rows, err.cols, err.value.map(v => v < 1.0))
		err.map((v, i) => this._cond.value[i] ? 0.5 * v * v : v - 0.5);
		return new Matrix(1, 1, err.sum());
	}

	grad() {
		this._bi = this._cond.copy();
		this._bi.map((c, i) => c ? this._i.value[i] - this._t.value[i] : Math.sign(this._i.value[i] - this._t.value[i]))
		return this._bi;
	}
}

