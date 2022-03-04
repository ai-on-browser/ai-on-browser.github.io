import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class VariableLayer extends Layer {
	constructor({ size, l2_decay = 0, l1_decay = 0, value = null, ...rest }) {
		super(rest)
		this._size = size
		this._v = value ? Matrix.fromArray(value) : typeof size !== 'string' ? Matrix.randn(size[0], size[1]) : null
		this._l2_decay = l2_decay
		this._l1_decay = l1_decay
		this._n = 1
	}

	bind({ n }) {
		this._n = n
	}

	calc() {
		if (!this._v) {
			const sizes = this.graph.getNode(this._size).lastOutputSize
			this._v = Matrix.randn(sizes[0], sizes[1])
		}
		return this._v
	}

	grad(bo) {
		this._bo = bo
	}

	update(optimizer) {
		const d = Matrix.div(this._bo, this._n)
		if (this._l2_decay > 0 || this._l1_decay > 0) {
			for (let i = 0; i < this._v.rows; i++) {
				for (let j = 0; j < this._v.cols; j++) {
					const v = this._v.at(i, j)
					d.addAt(i, j, v * this._l2_decay + Math.sign(v) * this._l1_decay)
				}
			}
		}
		this._v.sub(optimizer.delta('v', d))
	}

	toObject() {
		return {
			type: 'variable',
			size: this._size,
			l2_decay: this._l2_decay,
			l1_decay: this._l1_decay,
			value: this._v.toArray(),
		}
	}
}

VariableLayer.registLayer()
