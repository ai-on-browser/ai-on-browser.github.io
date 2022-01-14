import { Matrix } from '../../util/math.js'
import Layer from './base.js'
export { default as Layer, LossLayer, FlowLayer } from './base.js'

const buildLayer = (name, calcFunc, gradFunc) => {
	class TempLayer extends Layer {
		calc(x) {
			this._i = x
			this._o = calcFunc(x)
			return this._o
		}

		grad(bo) {
			const bi = gradFunc(this._i, this._o)
			bi.mult(bo)
			return bi
		}
	}
	TempLayer.registLayer(name)
}

const simpleLayers = {
	abs: {
		calc: x => x.copyMap(Math.abs),
		grad: (i, o) => i.copyMap(v => (v < 0 ? -1 : 1)),
	},
	acos: {
		calc: x => x.copyMap(Math.acos),
		grad: (i, o) => i.copyMap(v => -1 / (Math.sqrt(1 - v ** 2) + 1.0e-4)),
	},
	acosh: {
		calc: x => x.copyMap(Math.acosh),
		grad: (i, o) => i.copyMap(v => 1 / (Math.sqrt(v ** 2 - 1) + 1.0e-4)),
	},
	asin: {
		calc: x => x.copyMap(Math.asin),
		grad: (i, o) => i.copyMap(v => 1 / (Math.sqrt(1 - v ** 2) + 1.0e-4)),
	},
	asinh: {
		calc: x => x.copyMap(Math.asinh),
		grad: (i, o) => i.copyMap(v => 1 / Math.sqrt(1 + v ** 2)),
	},
	atan: {
		calc: x => x.copyMap(Math.atan),
		grad: (i, o) => i.copyMap(v => 1 / (1 + v ** 2)),
	},
	atanh: {
		calc: x => x.copyMap(Math.atanh),
		grad: (i, o) => i.copyMap(v => 1 / (1 - v ** 2)),
	},
	cos: {
		calc: x => x.copyMap(Math.cos),
		grad: (i, o) => i.copyMap(v => -Math.sin(v)),
	},
	cosh: {
		calc: x => x.copyMap(Math.cosh),
		grad: (i, o) => i.copyMap(Math.sinh),
	},
	exp: {
		calc: x => x.copyMap(Math.exp),
		grad: (i, o) => o.copy(),
	},
	log: {
		calc: x => x.copyMap(Math.log),
		grad: (i, o) => i.copyMap(v => 1 / v),
	},
	negative: {
		calc: x => x.copyMult(-1),
		grad: (i, o) => new Matrix(1, 1, -1),
	},
	relu: {
		calc: x => x.copyMap(v => (v > 0 ? v : 0)),
		grad: (i, o) => o.copyMap(v => (v > 0 ? 1 : 0)),
	},
	sin: {
		calc: x => x.copyMap(Math.sin),
		grad: (i, o) => i.copyMap(Math.cos),
	},
	sinh: {
		calc: x => x.copyMap(Math.sinh),
		grad: (i, o) => i.copyMap(Math.cosh),
	},
	softsign: {
		calc: x => x.copyMap(v => v / (1 + Math.abs(v))),
		grad: (i, o) => i.copyMap(v => 1 / (1 + Math.abs(v)) ** 2),
	},
	sqrt: {
		calc: x => x.copyMap(Math.sqrt),
		grad: (i, o) => o.copyMap(v => 1 / (2 * v)),
	},
	square: {
		calc: x => x.copyMult(x),
		grad: (i, o) => i.copyMult(2),
	},
	tan: {
		calc: x => x.copyMap(Math.tan),
		grad: (i, o) => i.copyMap(v => 1 / Math.cos(v) ** 2),
	},
	tanh: {
		calc: x => x.copyMap(Math.tanh),
		grad: (i, o) => o.copyMap(v => 1 - v ** 2),
	},
}

for (const name of Object.keys(simpleLayers)) {
	buildLayer(name, simpleLayers[name].calc, simpleLayers[name].grad)
}

export * from './add.js'
export * from './additive_coupling.js'
export * from './argmax.js'
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
export * from './lstm.js'
export * from './matmul.js'
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
export * from './sub.js'
export * from './sum.js'
export * from './supervisor.js'
export * from './transpose.js'
export * from './variable.js'
export * from './variance.js'
