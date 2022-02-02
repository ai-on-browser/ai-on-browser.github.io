import Matrix from '../../../util/matrix.js'
import NeuralNetwork from '../../neuralnetwork.js'
import { FlowLayer } from './base.js'

export default class AdditiveCoupling extends FlowLayer {
	constructor({ d = null, net = null, ...rest }) {
		super(rest)
		this._d = d
		this._m = net == null ? null : net instanceof NeuralNetwork ? net : NeuralNetwork.fromObject(net)
	}

	calc(x) {
		if (!this._d) {
			this._d = Math.floor(x.cols / 2)
		}
		if (!this._m) {
			this._m = NeuralNetwork.fromObject(
				[
					{ type: 'input' },
					{ type: 'full', out_size: 20, activation: 'leaky_relu' },
					{ type: 'full', out_size: x.cols - this._d, activation: 'leaky_relu' },
				],
				null,
				'adam'
			)
		}
		this._o = x.copy()
		const a = Matrix.zeros(...x.sizes)
		a.set(0, this._d, this._m.calc(x.slice(0, this._d, 1)))
		this._o.add(a)
		return this._o
	}

	inverse(y) {
		this._o = y.copy()
		const a = Matrix.zeros(...y.sizes)
		a.set(0, this._d, this._m.calc(y.slice(0, this._d, 1)))
		this._o.sub(a)
		return this._o
	}

	jacobianDeterminant() {
		return 1
	}

	grad(bo) {
		const bi = bo.copy()
		const a = Matrix.zeros(...bo.sizes)
		const bm = this._m.grad(bo.slice(this._d, null, 1))
		a.set(0, 0, bm)
		bi.add(a)
		return bi
	}

	update(optimizer) {
		this._m.update(optimizer.lr)
	}

	toObject() {
		return {
			type: 'additive_coupling',
			net: this._m?.toObject(),
		}
	}
}

AdditiveCoupling.registLayer()
