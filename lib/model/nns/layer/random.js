import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class RandomLayer extends Layer {
	constructor({ size, ...rest }) {
		super(rest)
		this._size = size
		this._rows = 1
	}

	bind({ n }) {
		this._rows = n
	}

	calc() {
		if (typeof this._size === 'string') {
			const sizes = this.graph.nodes[this._size].lastOutputSize
			return Matrix.randn(sizes[0], sizes[1])
		}
		return Matrix.randn(this._rows, this._size)
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
