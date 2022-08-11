import Tensor from '../../../util/tensor.js'
import Layer from './base.js'
export { default as Layer, LossLayer, FlowLayer } from './base.js'

const buildLayer = (name, calcFunc, gradFunc) => {
	class TempLayer extends Layer {
		calc(x) {
			this._i = x
			this._o = x.copy()
			this._o.map(calcFunc)
			return this._o
		}

		grad(bo) {
			const bi = new Tensor(bo.sizes)
			for (let i = 0; i < bi.length; i++) {
				bi.value[i] = bo.value[i] * gradFunc(this._i.value[i], this._o.value[i])
			}
			if (bi.dimension === 2) {
				return bi.toMatrix()
			}
			return bi
		}
	}
	Object.defineProperty(TempLayer, 'name', {
		value: name[0].toUpperCase() + name.substring(1).toLowerCase() + 'Layer',
	})
	TempLayer.registLayer(name)
}

const simpleLayers = {
	abs: {
		calc: Math.abs,
		grad: (i, o) => (i < 0 ? -1 : 1),
	},
	acos: {
		calc: Math.acos,
		grad: (i, o) => -1 / (Math.sqrt(1 - i ** 2) + 1.0e-4),
	},
	acosh: {
		calc: Math.acosh,
		grad: (i, o) => 1 / (Math.sqrt(i ** 2 - 1) + 1.0e-4),
	},
	asin: {
		calc: Math.asin,
		grad: (i, o) => 1 / (Math.sqrt(1 - i ** 2) + 1.0e-4),
	},
	asinh: {
		calc: Math.asinh,
		grad: (i, o) => 1 / Math.sqrt(1 + i ** 2),
	},
	atan: {
		calc: Math.atan,
		grad: (i, o) => 1 / (1 + i ** 2),
	},
	atanh: {
		calc: Math.atanh,
		grad: (i, o) => 1 / (1 - i ** 2),
	},
	cos: {
		calc: Math.cos,
		grad: (i, o) => -Math.sin(i),
	},
	cosh: {
		calc: Math.cosh,
		grad: (i, o) => Math.sinh(i),
	},
	exp: {
		calc: Math.exp,
		grad: (i, o) => o,
	},
	log: {
		calc: Math.log,
		grad: (i, o) => 1 / i,
	},
	negative: {
		calc: v => -v,
		grad: (i, o) => -1,
	},
	relu: {
		calc: v => (v > 0 ? v : 0),
		grad: (i, o) => (i > 0 ? 1 : 0),
	},
	sin: {
		calc: Math.sin,
		grad: (i, o) => Math.cos(i),
	},
	sinh: {
		calc: Math.sinh,
		grad: (i, o) => Math.cosh(i),
	},
	softsign: {
		calc: v => v / (1 + Math.abs(v)),
		grad: (i, o) => 1 / (1 + Math.abs(i)) ** 2,
	},
	sqrt: {
		calc: Math.sqrt,
		grad: (i, o) => 1 / (2 * o),
	},
	square: {
		calc: v => v ** 2,
		grad: (i, o) => i * 2,
	},
	tan: {
		calc: Math.tan,
		grad: (i, o) => 1 / Math.cos(i) ** 2,
	},
	tanh: {
		calc: Math.tanh,
		grad: (i, o) => 1 - o ** 2,
	},
}

for (const name of Object.keys(simpleLayers)) {
	buildLayer(name, simpleLayers[name].calc, simpleLayers[name].grad)
}

export * from './add.js'
export * from './additive_coupling.js'
export * from './argmax.js'
export * from './averagepool.js'
export * from './batch_normalization.js'
export * from './clip.js'
export * from './concat.js'
export * from './cond.js'
export * from './const.js'
export * from './conv.js'
export * from './detach.js'
export * from './div.js'
export * from './dropout.js'
export * from './elu.js'
export * from './flatten.js'
export * from './full.js'
export * from './gaussian.js'
export * from './gru.js'
export * from './huber.js'
export * from './include.js'
export * from './input.js'
export * from './leaky_relu.js'
export * from './less.js'
export * from './linear.js'
export * from './lppool.js'
export * from './lrn.js'
export * from './lstm.js'
export * from './matmul.js'
export * from './maxpool.js'
export * from './mean.js'
export * from './mse.js'
export * from './mult.js'
export * from './onehot.js'
export * from './output.js'
export * from './power.js'
export * from './prelu.js'
export * from './random.js'
export * from './reshape.js'
export * from './reverse.js'
export * from './rnn.js'
export * from './rrelu.js'
export * from './sigmoid.js'
export * from './softargmax.js'
export * from './softmax.js'
export * from './softplus.js'
export * from './sparse.js'
export * from './split.js'
export * from './std.js'
export * from './sub.js'
export * from './sum.js'
export * from './supervisor.js'
export * from './transpose.js'
export * from './variable.js'
export * from './variance.js'
