import Tensor from '../../../util/tensor.js'
import Layer, { NeuralnetworkLayerException } from './base.js'

/**
 * Global max pool layer
 */
export default class GlobalMaxPoolLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.channel_dim] Dimension of the channel
	 */
	constructor({ channel_dim = -1, ...rest }) {
		super(rest)
		this._channel_dim = channel_dim
		if (this._channel_dim !== -1 && this._channel_dim !== 1) {
			throw new NeuralnetworkLayerException('Invalid channel dimension.')
		}
	}

	_index(i, c, k) {
		return this._channel_dim === -1 ? [i, ...k, c] : [i, c, ...k]
	}

	calc(x) {
		this._i = x
		const traceSize = x.sizes.slice(1)
		const outSize = Array(x.sizes.length).fill(1)
		outSize[0] = x.sizes[0]
		if (this._channel_dim === -1) {
			outSize[x.dimension - 1] = x.sizes[x.dimension - 1]
			traceSize.pop()
		} else if (this._channel_dim === 1) {
			outSize[1] = x.sizes[1]
			traceSize.splice(0, 1)
		}
		const channels = this._channel_dim === -1 ? x.sizes[x.dimension - 1] : x.sizes[1]
		this._o = new Tensor(outSize)
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let c = 0; c < channels; c++) {
				const idx = Array(x.dimension - 2).fill(0)
				let maxval = -Infinity
				do {
					const v = x.at(this._index(i, c, idx))
					if (maxval < v) {
						maxval = v
					}
					for (let k = 0; k < idx.length; k++) {
						idx[k]++
						if (idx[k] < traceSize[k]) {
							break
						}
						idx[k] = 0
					}
				} while (idx.some(v => v > 0))
				this._o.set(this._index(i, c, Array(x.dimension - 2).fill(0)), maxval)
			}
		}
		return this._o
	}

	grad(bo) {
		this._bo = bo
		this._bi = new Tensor(this._i.sizes)
		const traceSize = this._i.sizes.slice(1)
		if (this._channel_dim === -1) {
			traceSize.pop()
		} else if (this._channel_dim === 1) {
			traceSize.splice(0, 1)
		}
		const channels = this._channel_dim === -1 ? this._i.sizes[this._i.dimension - 1] : this._i.sizes[1]
		for (let i = 0; i < this._i.sizes[0]; i++) {
			for (let c = 0; c < channels; c++) {
				const idx = Array(this._i.dimension - 2).fill(0)
				let maxval = -Infinity
				let maxidx = null
				do {
					const v = this._i.at(this._index(i, c, idx))
					if (maxval < v) {
						maxval = v
						maxidx = idx.concat()
					}
					for (let k = 0; k < idx.length; k++) {
						idx[k]++
						if (idx[k] < traceSize[k]) {
							break
						}
						idx[k] = 0
					}
				} while (idx.some(v => v > 0))
				this._bi.set(this._index(i, c, maxidx), this._bo.at(this._index(i, c, idx)))
			}
		}
		return this._bi
	}

	toObject() {
		return {
			type: 'global_max_pool',
			channel_dim: this._channel_dim,
		}
	}
}

GlobalMaxPoolLayer.registLayer()
