import { NeuralnetworkException } from '../../neuralnetwork.js'
import Layer from './base.js'
import Tensor from '../../../util/tensor.js'

export default class ConvLayer extends Layer {
	constructor({
		kernel,
		channel = null,
		stride = null,
		padding = null,
		w = null,
		activation = null,
		l2_decay = 0,
		l1_decay = 0,
		activation_params = {},
		channel_dim = -1,
		...rest
	}) {
		super(rest)
		this._in_channel = null
		this._out_channel = channel
		this._kernel = kernel
		this._stride = stride || 1
		this._padding = padding || 0
		this._w = null
		if (w) {
			this._w = Tensor.fromArray(w)
			this._in_channel = this._w.sizes[0]
			if (!this._out_channel) {
				this._out_channel = this._w.sizes[this._w.dimension - 1]
			}
		}
		this._activation = activation
		if (activation) {
			this._activation_func = Layer.fromObject({ type: activation, ...activation_params })
		}
		this._l2_decay = l2_decay
		this._l1_decay = l1_decay
		this._channel_dim = channel_dim
		if (this._channel_dim !== -1 && this._channel_dim !== 1) {
			throw new NeuralnetworkException('Invalid channel dimension.')
		}
	}

	_index(i, c, k) {
		return this._channel_dim === -1 ? [i, ...k, c] : [i, c, ...k]
	}

	calc(x) {
		if (x.dimension <= 2) {
			throw new NeuralnetworkException('Invalid input.')
		}
		if (!Array.isArray(this._kernel)) {
			this._kernel = Array(x.dimension - 2).fill(this._kernel)
		}
		if (x.dimension !== this._kernel.length + 2) {
			throw new NeuralnetworkException('Invalid kernel size', [this, x])
		}
		if (!this._w) {
			this._in_channel = x.sizes[this._channel_dim === -1 ? x.dimension - 1 : 1]
			if (!this._out_channel) {
				this._out_channel = this._in_channel * 2
			}
			this._w = Tensor.randn([this._in_channel, ...this._kernel, this._out_channel])
		}
		this._i = x
		const koff = this._channel_dim === -1 ? 1 : 2
		const outSize = [
			x.sizes[0],
			...this._kernel.map(
				(k, d) => Math.ceil(Math.max(0, x.sizes[d + koff] + this._padding * 2 - k) / this._stride) + 1
			),
		]
		if (this._channel_dim === -1) {
			outSize.push(this._out_channel)
		} else if (this._channel_dim === 1) {
			outSize.splice(1, 0, this._out_channel)
		}
		this._o = new Tensor(outSize)
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let b = 0; b < this._out_channel; b++) {
				const idx = Array(this._kernel.length).fill(0)
				do {
					let v = 0
					const p = Array(this._kernel.length).fill(0)
					do {
						const pi = p.map((t, k) => idx[k] * this._stride - this._padding + t)
						if (pi.every((t, k) => 0 <= t && t < x.sizes[k + koff])) {
							for (let c = 0; c < this._in_channel; c++) {
								v += x.at(this._index(i, c, pi)) * this._w.at(c, ...p, b)
							}
						}
						for (let k = 0; k < p.length; k++) {
							p[k]++
							if (p[k] < this._kernel[k]) {
								break
							}
							p[k] = 0
						}
					} while (p.some(v => v > 0))
					this._o.set(this._index(i, b, idx), v)
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
		if (this._activation_func) {
			return this._activation_func.calc(this._o)
		}
		return this._o
	}

	grad(bo) {
		this._bo = bo
		if (this._activation_func) {
			this._bo = this._activation_func.grad(bo)
		}
		this._bi = new Tensor(this._i.sizes)
		this._dw = new Tensor(this._w.sizes)
		const koff = this._channel_dim === -1 ? 1 : 2
		for (let i = 0; i < this._i.sizes[0]; i++) {
			for (let b = 0; b < this._out_channel; b++) {
				const idx = Array(this._kernel.length).fill(0)
				do {
					const p = Array(this._kernel.length).fill(0)
					do {
						const pi = p.map((t, k) => idx[k] * this._stride - this._padding + t)
						if (pi.every((t, k) => 0 <= t && t < this._i.sizes[k + koff])) {
							for (let c = 0; c < this._in_channel; c++) {
								this._bi.operateAt(
									this._index(i, c, pi),
									v => v + this._w.at(c, ...p, b) * this._bo.at(this._index(i, b, idx))
								)
								this._dw.operateAt(
									[c, ...p, b],
									v => v + this._i.at(this._index(i, c, pi)) * this._bo.at(this._index(i, b, idx))
								)
							}
						}
						for (let k = 0; k < p.length; k++) {
							p[k]++
							if (p[k] < this._kernel[k]) {
								break
							}
							p[k] = 0
						}
					} while (p.some(v => v > 0))
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

	update(optimizer) {
		this._dw.reshape(this._dw.sizes[0], this._dw.length / this._dw.sizes[0])
		const d = optimizer.delta('w', this._dw.toMatrix())
		for (let i = 0; i < this._w.length; i++) {
			this._w.value[i] -= d.value[i]
		}
	}

	toObject() {
		return {
			type: 'conv',
			w: this._w?.toArray(),
			channel: this._out_channel,
			kernel: this._kernel,
			stride: this._stride,
			padding: this._padding,
			activation: this._activation,
			l2_decay: this._l2_decay,
			l1_decay: this._l1_decay,
			activation_params: this._activation_func?.toObject(),
			channel_dim: this._channel_dim,
		}
	}
}

ConvLayer.registLayer()
