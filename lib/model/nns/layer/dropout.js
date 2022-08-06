import Layer from './base.js'
import Matrix from '../../../util/matrix.js'
import { NeuralnetworkException } from '../../neuralnetwork.js'

export default class DropoutLayer extends Layer {
	constructor({ drop_rate = 0.5, ...rest }) {
		super(rest)
		this._drop_rate = drop_rate
	}

	_shuffle(n) {
		const arr = Array.from({ length: n }, (_, i) => i)
		for (let i = n - 1; i > 0; i--) {
			let r = Math.floor(Math.random() * (i + 1))
			;[arr[i], arr[r]] = [arr[r], arr[i]]
		}
		return arr.slice(0, Math.max(1, Math.floor(n * this._drop_rate)))
	}

	calc(x) {
		if (!(x instanceof Matrix)) {
			throw NeuralnetworkException('Invalid input.')
		}
		this._drop_index = this._shuffle(x.cols)
		const o = x.copy()
		for (let i = 0; i < x.rows; i++) {
			for (const j of this._drop_index) {
				o.set(i, j, 0)
			}
		}
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		for (let i = 0; i < bo.rows; i++) {
			for (const j of this._drop_index) {
				bi.set(i, j, 0)
			}
		}
		return bi
	}

	toObject() {
		return {
			type: 'dropout',
			drop_rate: this._drop_rate,
		}
	}
}

DropoutLayer.registLayer()
