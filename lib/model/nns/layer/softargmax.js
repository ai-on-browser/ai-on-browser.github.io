import Matrix from '../../../util/matrix.js'
import Layer from './base.js'

/**
 * Softargmax layer
 */
export default class SoftargmaxLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.beta] beta
	 */
	constructor({ beta = 10000, ...rest }) {
		super(rest)
		this._beta = beta
	}

	calc(x) {
		this._i = x
		this._o = Matrix.map(this._i, v => this._beta * v)
		this._o.sub(this._o.max(1))
		this._o.map(Math.exp)
		this._o.div(this._o.sum(1))
		const idx = Matrix.zeros(1, this._o.cols)
		for (let i = 0; i < idx.cols; i++) {
			idx.set(0, i, i)
		}
		return Matrix.mult(this._o, idx).sum(1)
	}

	grad(bo) {
		this._bo = new Matrix(this._o.rows, this._o.cols)
		for (let j = 0; j < this._o.cols; j++) {
			this._bo.set(0, j, Matrix.mult(bo, j))
		}
		const o = this._i.copy()
		o.sub(o.max(1))
		o.map(Math.exp)
		o.div(o.sum(1))
		this._bi = new Matrix(this._o.rows, this._o.cols)
		for (let k = 0; k < this._bo.rows; k++) {
			for (let i = 0; i < this._bo.cols; i++) {
				const oki = o.at(k, i)
				let bki = 0
				for (let j = 0; j < this._bo.cols; j++) {
					const v = i === j ? 1 - oki : -oki
					bki += o.at(k, j) * v * this._bo.at(k, j)
				}
				this._bi.set(k, i, bki)
			}
		}
		return this._bi
	}

	toObject() {
		return {
			type: 'softargmax',
			beta: this._beta,
		}
	}
}

SoftargmaxLayer.registLayer()
