
function NeuralnetworkException(message, value) {
	this.message = message;
	this.value = value;
	this.name = NeuralnetworkException;
}

class NeuralNetwork {
	constructor(layers) {
		this._layers = [];
		for (const l of layers) {
			let cl = new NeuralnetworLayers[l.type](l);
			this._layers.push(cl);
		}
	}

	calc(x) {
		for (const l of this._layers) {
			x = l.calc(x);
		}
		return x;
	}

	fit(x, t, epoch = 1, learning_rate = 0.1) {
		while (epoch-- > 0) {
			const y = this.calc(x);
			let e = y.copySub(t);
			e.div(2);
			for (let i = this._layers.length - 1; i >= 0; i--) {
				e = this._layers[i].grad(e);
				this._layers[i].update(learning_rate);
			}
		}
	}
}

const NeuralnetworLayers = {};

class Layer {
	calc(x) {
		throw NeuralnetworkException("Not impleneted", this)
	}

	grad(bo) {
		throw NeuralnetworkException("Not impleneted", this)
	}

	update(rate) {
		throw NeuralnetworkException("Not impleneted", this)
	}
}

NeuralnetworLayers['full'] = class FullyConnected extends Layer {
	constructor({in_size, out_size}) {
		super();
		this._w = Matrix.randn(in_size, out_size);
		this._b = Matrix.randn(1, out_size);
		this._l2_decay = 0;
	}

	calc(x) {
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
		this._w.sub(dw);
		const db = this._bo.sum(0);
		db.mult(rate / this._i.rows);
		this._b.sub(db);
	}
}

class ActivationLayer extends Layer {
	update(rate) {}
}

NeuralnetworLayers['linear'] = class LinearLayer extends ActivationLayer {
	calc(x) {
		return x;
	}

	grad(bo) {
		return bo;
	}
}

NeuralnetworLayers['sigmoid'] = class SigmoidLayer extends ActivationLayer {
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

NeuralnetworLayers['tanh'] = class TanhLayer extends ActivationLayer {
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

NeuralnetworLayers['polynomial'] = class PolynomialLayer extends ActivationLayer {
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

NeuralnetworLayers['softsign'] = class SoftsignLayer extends ActivationLayer {
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

NeuralnetworLayers['softplus'] = class SoftplusLayer extends ActivationLayer {
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

NeuralnetworLayers['abs'] = class AbsLayer extends ActivationLayer {
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

NeuralnetworLayers['relu'] = class ReluLayer extends ActivationLayer {
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

NeuralnetworLayers['leaky_relu'] = class LeakyReluLayer extends ActivationLayer {
	constructor({a = 0.1}) {
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

NeuralnetworLayers['softmax'] = class SoftmaxLayer extends ActivationLayer {
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

