import Tensor from '../../../util/tensor.js'
import Layer, { NeuralnetworkLayerException } from './base.js'

/**
 * Average pool layer
 */
export default class AveragePoolLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number | number[]} config.kernel Size of kernel
	 * @param {number | number[]} [config.stride] Step of stride
	 * @param {number | number[]} [config.padding] size of padding
	 * @param {number} [config.channel_dim] Dimension of the channel
	 */
	constructor({ kernel, stride = null, padding = null, channel_dim = -1, ...rest }) {
		super(rest)
		this._kernel = kernel
		this._stride = stride || kernel
		this._padding = padding || 0
		this._channel_dim = channel_dim
		if (this._channel_dim !== -1 && this._channel_dim !== 1) {
			throw new NeuralnetworkLayerException('Invalid channel dimension.')
		}
	}

	_index(i, c, k) {
		return this._channel_dim === -1 ? [i, ...k, c] : [i, c, ...k]
	}

	calc(x) {
		if (!Array.isArray(this._kernel)) {
			this._kernel = Array(x.dimension - 2).fill(this._kernel)
		}
		if (x.dimension !== this._kernel.length + 2) {
			throw new NeuralnetworkLayerException('Invalid kernel size', [this, x])
		}
		if (!Array.isArray(this._stride)) {
			this._stride = Array(x.dimension - 2).fill(this._stride)
		}
		if (x.dimension !== this._stride.length + 2) {
			throw new NeuralnetworkLayerException('Invalid stride size', [this, x])
		}
		if (!Array.isArray(this._padding)) {
			this._padding = Array.from({ length: x.dimension - 2 }, () => [this._padding, this._padding])
		} else if (!Array.isArray(this._padding[0])) {
			this._padding = this._padding.map(p => [p, p])
		}
		if (x.dimension !== this._padding.length + 2) {
			throw new NeuralnetworkLayerException('Invalid padding size', [this, x])
		}
		this._i = x
		const koff = this._channel_dim === -1 ? 1 : 2
		const outSize = [
			x.sizes[0],
			...this._kernel.map(
				(k, d) =>
					Math.ceil(
						Math.max(0, x.sizes[d + koff] + this._padding[d][0] + this._padding[d][1] - k) / this._stride[d]
					) + 1
			),
		]
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
					let sumval = 0
					let count = 0
					do {
						const p = idx.map((v, i) => v * this._stride[i] - this._padding[i][0] + offset[i])
						if (p.every((v, i) => 0 <= v && v < x.sizes[i + koff])) {
							sumval += x.at(this._index(i, c, p))
							count++
						}
						for (let k = 0; k < offset.length; k++) {
							offset[k]++
							if (offset[k] < this._kernel[k]) {
								break
							}
							offset[k] = 0
						}
					} while (offset.some(v => v > 0))
					this._o.set(this._index(i, c, idx), sumval / count)
					for (let k = 0; k < idx.length; k++) {
						idx[k]++
						if (idx[k] < outSize[k + koff]) {
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
					const ps = []
					do {
						const p = idx.map((v, i) => v * this._stride[i] - this._padding[i][0] + offset[i])
						if (p.every((v, i) => 0 <= v && v < this._i.sizes[i + koff])) {
							ps.push(p)
						}
						for (let k = 0; k < offset.length; k++) {
							offset[k]++
							if (offset[k] < this._kernel[k]) {
								break
							}
							offset[k] = 0
						}
					} while (offset.some(v => v > 0))

					for (const p of ps) {
						this._bi.operateAt(
							this._index(i, c, p),
							v => v + this._bo.at(this._index(i, c, idx)) / ps.length
						)
					}
					for (let k = 0; k < idx.length; k++) {
						idx[k]++
						if (idx[k] < this._o.sizes[k + koff]) {
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
			type: 'average_pool',
			kernel: this._kernel,
			stride: this._stride,
			padding: this._padding,
			channel_dim: this._channel_dim,
		}
	}
}

AveragePoolLayer.registLayer()
