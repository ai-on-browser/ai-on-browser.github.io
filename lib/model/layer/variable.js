import Layer from './base.js'
import { Matrix } from '../../util/math.js'

export default class VariableLayer extends Layer {
	constructor({ size, l2_decay = 0, l1_decay = 0, ...rest }) {
		super(rest)
		this._size = size
		this._v = Matrix.randn(size[0], size[1])
		this._l2_decay = l2_decay
		this._l1_decay = l1_decay
		this._n = 1
	}

	bind({ n }) {
		this._n = n
	}

	calc() {
		return this._v
	}

	grad(bo) {
		this._bo = bo
	}

	update() {
		const d = this._bo.copyDiv(this._n)
		if (this._l2_decay > 0 || this._l1_decay > 0) {
			for (let i = 0; i < this._v.rows; i++) {
				for (let j = 0; j < this._v.cols; j++) {
					const v = this._v.at(i, j)
					d.addAt(i, j, v * this._l2_decay + Math.sign(v) * this._l1_decay)
				}
			}
		}
		this._v.sub(this._opt.delta('v', d))
	}

	get_params() {
		return {
			v: this._v,
		}
	}

	set_params(param) {
		this._v = param.v.copy()
	}
}
