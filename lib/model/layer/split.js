import Layer from './base.js'
import { Matrix } from '../../util/math.js'

export default class SplitLayer extends Layer {
	constructor({ axis = 1, size, ...rest }) {
		super(rest)
		this._axis = axis
		this._size = size
	}

	calc(x) {
		let c = 0
		this._o = []
		for (let i = 0; i < this._size.length; i++) {
			if (this._axis === 1) {
				this._o.push(x.sliceCol(c, c + this._size[i]))
			} else {
				this._o.push(x.sliceRow(c, c + this._size[i]))
			}
			c += this._size[i]
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
}
