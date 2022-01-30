import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class RandomLayer extends Layer {
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
			return Matrix.randn(sizes[0], sizes[1], this._mean, this._variance)
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
