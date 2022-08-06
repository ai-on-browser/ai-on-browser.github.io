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
	}

	calc(x) {
		if (x.dimension <= 2) {
			throw NeuralnetworkException('Invalid input.')
		}
		if (!Array.isArray(this._kernel)) {
			this._kernel = Array(x.dimension - 2).fill(this._kernel)
		}
		if (x.dimension !== this._kernel.length + 2) {
			throw new NeuralnetworkException('Invalid kernel size', [this, x])
		}
		if (!this._w) {
			this._in_channel = x.sizes[x.dimension - 1]
			if (!this._out_channel) {
				this._out_channel = this._in_channel * 2
			}
			this._w = Tensor.randn([this._in_channel, ...this._kernel, this._out_channel])
		}
		this._i = x
		const outSize = [
			x.sizes[0],
			...this._kernel.map((k, d) => Math.ceil((x.sizes[d + 1] + this._padding * 2 - k) / this._stride) + 1),
			this._out_channel,
		]
		this._o = new Tensor(outSize)
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let b = 0; b < this._out_channel; b++) {
				const idx = Array(this._kernel.length).fill(0)
				do {
					let v = 0
					const p = Array(this._kernel.length).fill(0)
					do {
						const pi = p.map((t, k) => idx[k] * this._stride - this._padding + t)
						if (pi.every((t, k) => 0 <= t && t < x.sizes[k + 1])) {
							for (let c = 0; c < this._in_channel; c++) {
								v += x.at(i, ...pi, c) * this._w.at(c, ...p, b)
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
					this._o.set([i, ...idx, b], v)
					for (let k = 0; k < idx.length; k++) {
						idx[k]++
						if (idx[k] < outSize[k + 1]) {
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
		for (let i = 0; i < this._i.sizes[0]; i++) {
			for (let b = 0; b < this._out_channel; b++) {
				const idx = Array(this._kernel.length).fill(0)
				do {
					let v = 0
					const p = Array(this._kernel.length).fill(0)
					do {
						const pi = p.map((t, k) => idx[k] * this._stride - this._padding + t)
						if (pi.every((t, k) => 0 <= t && t < this._i.sizes[k + 1])) {
							for (let c = 0; c < this._in_channel; c++) {
								const v = this._bi.at(i, ...pi, c)
								this._bi.set([i, ...pi, c], v + this._w.at(c, ...p, b) * bo.at(i, ...idx, b))
								const wv = this._dw.at(c, ...p, b)
								this._dw.set([c, ...p, b], wv + this._i.at(i, ...pi, c) * this._bo.at(i, ...idx, b))
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
					this._o.set([i, ...idx, b], v)
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
		}
	}
}

ConvLayer.registLayer()
