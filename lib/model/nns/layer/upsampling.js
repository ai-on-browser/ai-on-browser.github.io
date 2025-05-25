import Layer, { NeuralnetworkLayerException } from './base.js'
import Tensor from '../../../util/tensor.js'

/**
 * Max pool layer
 */
export default class UpSamplingLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number | number[]} config.size Size of kernel
	 * @param {number} [config.channel_dim] Dimension of the channel
	 */
	constructor({ size, channel_dim = -1, ...rest }) {
		super(rest)
		this._size = size
		this._channel_dim = channel_dim
		if (this._channel_dim !== -1 && this._channel_dim !== 1) {
			throw new NeuralnetworkLayerException('Invalid channel dimension.')
		}
	}

	_index(i, c, k) {
		return this._channel_dim === -1 ? [i, ...k, c] : [i, c, ...k]
	}

	calc(x) {
		if (!Array.isArray(this._size)) {
			this._size = Array(x.dimension - 2).fill(this._size)
		}
		if (x.dimension !== this._size.length + 2) {
			throw new NeuralnetworkLayerException('Invalid size', [this, x])
		}
		this._i = x
		const koff = this._channel_dim === -1 ? 1 : 2
		const outSize = [x.sizes[0], ...this._size.map((k, d) => x.sizes[d + koff] * k)]
		if (this._channel_dim === -1) {
			outSize.push(x.sizes[x.dimension - 1])
		} else if (this._channel_dim === 1) {
			outSize.splice(1, 0, x.sizes[1])
		}
		const channels = this._channel_dim === -1 ? x.sizes[x.dimension - 1] : x.sizes[1]
		this._o = new Tensor(outSize)
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let c = 0; c < channels; c++) {
				const idx = Array(x.dimension - 2).fill(0)
				do {
					const offset = Array(x.dimension - 2).fill(0)
					do {
						const p = idx.map((v, i) => v * this._size[i] + offset[i])
						this._o.set(this._index(i, c, p), x.at(this._index(i, c, idx)))
						for (let k = 0; k < offset.length; k++) {
							offset[k]++
							if (offset[k] < this._size[k]) {
								break
							}
							offset[k] = 0
						}
					} while (offset.some(v => v > 0))
					for (let k = 0; k < idx.length; k++) {
						idx[k]++
						if (idx[k] < this._i.sizes[k + koff]) {
							break
						}
						idx[k] = 0
					}
				} while (idx.some(v => v > 0))
			}
		}
		return this._o
	}

	grad(bo) {
		this._bo = bo
		this._bi = new Tensor(this._i.sizes)
		const koff = this._channel_dim === -1 ? 1 : 2
		const channels = this._channel_dim === -1 ? this._i.sizes[this._i.dimension - 1] : this._i.sizes[1]
		for (let i = 0; i < this._i.sizes[0]; i++) {
			for (let c = 0; c < channels; c++) {
				const idx = Array(this._i.dimension - 2).fill(0)
				do {
					const offset = Array(this._i.dimension - 2).fill(0)
					let sum = 0
					do {
						const p = idx.map((v, i) => v * this._size[i] + offset[i])
						sum += this._bo.at(this._index(i, c, p))
						for (let k = 0; k < offset.length; k++) {
							offset[k]++
							if (offset[k] < this._size[k]) {
								break
							}
							offset[k] = 0
						}
					} while (offset.some(v => v > 0))

					this._bi.set(this._index(i, c, idx), sum)
					for (let k = 0; k < idx.length; k++) {
						idx[k]++
						if (idx[k] < this._i.sizes[k + koff]) {
							break
						}
						idx[k] = 0
					}
				} while (idx.some(v => v > 0))
			}
		}
		return this._bi
	}

	toObject() {
		return {
			type: 'up_sampling',
			size: this._size,
			channel_dim: this._channel_dim,
		}
	}
}

UpSamplingLayer.registLayer()
