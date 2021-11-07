import Layer from './base.js'

export default class ConcatLayer extends Layer {
	constructor({ axis = 1, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(...x) {
		let m = x[0]
		let c = x[0].sizes[this._axis]
		this._sizes = [0, c]
		for (let i = 1; i < x.length; i++) {
			m = m.concat(x[i], this._axis)
			this._sizes.push((c += x[i].sizes[this._axis]))
		}
		return m
	}

	grad(bo) {
		const bi = []
		for (let i = 0; i < this._sizes.length - 1; i++) {
			bi.push(bo.slice(this._sizes[i], this._sizes[i + 1], this._axis))
		}
		return bi
	}

	toObject() {
		return {
			type: 'concat',
			axis: this._axis,
		}
	}
}

ConcatLayer.registLayer()
