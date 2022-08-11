import { NeuralnetworkException } from '../../neuralnetwork.js'
import Layer from './base.js'
import Tensor from '../../../util/tensor.js'

export default class MaxPoolLayer extends Layer {
	constructor({ kernel, stride = null, padding = null, channel_dim = -1, ...rest }) {
		super(rest)
		this._kernel = kernel
		this._stride = stride || kernel
		this._padding = padding || 0
		this._channel_dim = channel_dim
		if (this._channel_dim !== -1 && this._channel_dim !== 1) {
			throw new NeuralnetworkException('Invalid channel dimension.')
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
			throw new NeuralnetworkException('Invalid kernel size', [this, x])
		}
		if (!Array.isArray(this._stride)) {
			this._stride = Array(x.dimension - 2).fill(this._stride)
		}
		if (x.dimension !== this._stride.length + 2) {
			throw new NeuralnetworkException('Invalid stride size', [this, x])
		}
		if (!Array.isArray(this._padding)) {
			this._padding = Array.from({ length: x.dimension - 2 }, () => [this._padding, this._padding])
		} else if (!Array.isArray(this._padding[0])) {
			this._padding = this._padding.map(p => [p, p])
		}
		if (x.dimension !== this._padding.length + 2) {
			throw new NeuralnetworkException('Invalid padding size', [this, x])
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
					let maxval = -Infinity
					do {
						const p = idx.map((v, i) =>
							Math.max(
								0,
								Math.min(x.sizes[i + koff] - 1, v * this._stride[i] - this._padding[i][0] + offset[i])
							)
						)
						const v = x.at(this._index(i, c, p))
						if (maxval < v) {
							maxval = v
						}
						for (let k = 0; k < offset.length; k++) {
							offset[k]++
							if (offset[k] < this._kernel[k]) {
								break
							}
							offset[k] = 0
						}
					} while (offset.some(v => v > 0))
					this._o.set(this._index(i, c, idx), maxval)
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
					let maxval = -Infinity
					let maxidx = null
					do {
						const p = idx.map((v, i) =>
							Math.max(
								0,
								Math.min(
									this._i.sizes[i + koff] - 1,
									v * this._stride[i] - this._padding[i][0] + offset[i]
								)
							)
						)
						const v = this._i.at(this._index(i, c, p))
						if (maxval < v) {
							maxval = v
							maxidx = p
						}
						for (let k = 0; k < offset.length; k++) {
							offset[k]++
							if (offset[k] < this._kernel[k]) {
								break
							}
							offset[k] = 0
						}
					} while (offset.some(v => v > 0))

					this._bi.operateAt(this._index(i, c, maxidx), v => v + this._bo.at(this._index(i, c, idx)))
					for (let k = 0; k < idx.length; k++) {
						idx[k]++
						if (idx[k] < this._o.sizes[k + 1]) {
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
			type: 'max_pool',
			kernel: this._kernel,
			stride: this._stride,
			padding: this._padding,
			channel_dim: this._channel_dim,
		}
	}
}

MaxPoolLayer.registLayer()
