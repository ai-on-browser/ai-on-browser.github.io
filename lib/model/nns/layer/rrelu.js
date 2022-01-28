import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class RReluLayer extends Layer {
	constructor({ l = 1.0 / 8, u = 1.0 / 3, r = null, ...rest }) {
		super(rest)
		this._l = l
		this._u = u
		this._r = r ? Matrix.fromArray(r) : null
	}

	calc(x) {
		if (!this._r) {
			this._r = Matrix.random(1, x.cols, this._l, this._u)
		}
		this._i = x
		this._o = x.copy()
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				if (this._o.at(i, j) < 0) {
					this._o.multAt(i, j, this._r.at(0, j))
				}
			}
		}
		return this._o
	}

	grad(bo) {
		const bi = bo.copy()
		for (let i = 0; i < bi.rows; i++) {
			for (let j = 0; j < bi.cols; j++) {
				if (this._i.at(i, j) < 0) {
					bi.multAt(i, j, this._r.at(0, j))
				}
			}
		}
		return bi
	}

	toObject() {
		return {
			type: 'rrelu',
			l: this._l,
			u: this._u,
			r: this._r?.toArray(),
		}
	}
}

RReluLayer.registLayer('rrelu')
