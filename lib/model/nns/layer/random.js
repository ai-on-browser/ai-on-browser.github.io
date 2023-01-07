import Layer from './base.js'
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

/**
 * Random layer
 */
export default class RandomLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number | number[] | string} config.size Size of output
	 * @param {number} [config.mean=0] Mean of values
	 * @param {number} [config.variance=1] Variance of values
	 */
	constructor({ size, mean = 0, variance = 1, ...rest }) {
		super(rest)
		this._size = size
		this._mean = mean
		this._variance = variance
		this._rows = 1
	}

	bind({ n }) {
		this._rows = n
	}

	calc() {
		if (typeof this._size === 'string') {
			const sizes = this.graph.getNode(this._size).lastOutputSize
			if (sizes.length === 2) {
				return Matrix.randn(sizes[0], sizes[1], this._mean, this._variance)
			}
			return Tensor.randn(sizes, this._mean, this._variance)
		}
		if (Array.isArray(this._size)) {
			return Tensor.randn([this._rows, ...this._size], this._mean, this._variance)
		}
		return Matrix.randn(this._rows, this._size, this._mean, this._variance)
	}

	grad() {}

	toObject() {
		return {
			type: 'random',
			size: this._size,
		}
	}
}

RandomLayer.registLayer()
