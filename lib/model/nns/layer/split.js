import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class SplitLayer extends Layer {
	constructor({ axis = 1, size, ...rest }) {
		super(rest)
		this._axis = axis
		this._size = size
	}

	calc(x) {
		let c = 0
		this._o = []
		if (typeof this._size === 'number') {
			const s = x.sizes[this._axis] / this._size
			for (let i = 0; i < this._size; i++) {
				const n = Math.round((i + 1) * s)
				this._o.push(x.slice(c, n, this._axis))
				c = n
			}
		} else {
			for (let i = 0; i < this._size.length; i++) {
				this._o.push(x.slice(c, c + this._size[i], this._axis))
				c += this._size[i]
			}
		}
		return this._o
	}

	grad(...bo) {
		for (let i = 0; i < this._o.length; i++) {
			if (!bo[i]) {
				bo[i] = Matrix.zeros(this._o[i].rows, this._o[i].cols)
			}
		}
		let bi = bo[0]
		for (let i = 1; i < bo.length; i++) {
			bi = bi.concat(bo[i], this._axis)
		}
		return bi
	}

	toObject() {
		return {
			type: 'split',
			axis: this._axis,
			size: this._size,
		}
	}
}

SplitLayer.registLayer()
