import Layer from './base.js'

export default class ClipLayer extends Layer {
	constructor({ min = null, max = null, ...rest }) {
		super(rest)
		this._min = min
		this._max = max
	}

	calc(x) {
		const o = x.copy()
		o.map(v => {
			if (this._min !== null && v < this._min) {
				return this._min
			} else if (this._max !== null && v > this._max) {
				return this._max
			}
			return v
		})
		return o
	}

	grad(bo) {
		return bo
	}

	toObject() {
		return {
			type: 'clip',
			min: this._min,
			max: this._max,
		}
	}
}

ClipLayer.registLayer()
