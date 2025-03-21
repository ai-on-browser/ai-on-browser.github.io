import Layer from './base.js'

/**
 * Clip layer
 */
export default class ClipLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number | string} [config.min] Minimum value
	 * @param {number | string} [config.max] Maximum value
	 */
	constructor({ min = null, max = null, ...rest }) {
		super(rest)
		this._min = min
		this._max = max
	}

	get dependentLayers() {
		const layers = []
		if (typeof this._min === 'string') {
			layers.push(this._min)
		}
		if (typeof this._max === 'string') {
			layers.push(this._max)
		}
		return layers
	}

	calc(x) {
		const min = typeof this._min === 'string' ? this.graph.getNode(this._min).outputValue.toScaler() : this._min
		const max = typeof this._max === 'string' ? this.graph.getNode(this._max).outputValue.toScaler() : this._max
		const o = x.copy()
		o.map(v => {
			if (min !== null && v < min) {
				return min
			} else if (max !== null && v > max) {
				return max
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
