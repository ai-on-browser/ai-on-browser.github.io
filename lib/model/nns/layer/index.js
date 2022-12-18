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
		value: name.split('_').reduce((s, nm) => s + nm[0].toUpperCase() + nm.substring(1).toLowerCase(), '') + 'Layer',
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
	bent_identity: {
		calc: v => (Math.sqrt(v ** 2 + 1) - 1) / 2 + v,
		grad: (i, o) => i / (2 * Math.sqrt(i ** 2 + 1)) + 1,
	},
	ceil: {
		calc: Math.ceil,
		grad: (i, o) => 1,
	},
	cloglog: {
		calc: v => 1 - Math.exp(-Math.exp(v)),
		grad: (i, o) => Math.exp(i) * (1 - o),
	},
	cloglogm: {
		calc: v => 1 - 2 * Math.exp(-0.7 * Math.exp(v)),
		grad: (i, o) => 1.4 * Math.exp(i - 0.7 * Math.exp(i)),
	},
	cos: {
		calc: Math.cos,
		grad: (i, o) => -Math.sin(i),
	},
	cosh: {
		calc: Math.cosh,
		grad: (i, o) => Math.sinh(i),
	},
	elish: {
		calc: v => (v >= 0 ? v : Math.exp(v) - 1) / (1 + Math.exp(-v)),
		grad: (i, o) => ((i >= 0 ? 1 : Math.exp(i)) + o * Math.exp(-i)) / (1 + Math.exp(-i)),
	},
	elliott: {
		calc: v => v / (2 * (1 + Math.abs(v))) + 0.5,
		grad: (i, o) => 1 / (2 * (1 + Math.abs(i)) ** 2),
	},
	erf: {
		calc: v => {
			const p = 0.3275911
			const a1 = 0.254829592
			const a2 = -0.284496736
			const a3 = 1.421413741
			const a4 = -1.453152027
			const a5 = 1.061405429

			const sign = v < 0 ? -1 : 1
			const t = 1 / (1 + p * Math.abs(v))
			const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-v * v)
			return sign * erf
		},
		grad: (i, o) => (2 * Math.exp(-(i ** 2))) / Math.sqrt(Math.PI),
	},
	exp: {
		calc: Math.exp,
		grad: (i, o) => o,
	},
	floor: {
		calc: Math.floor,
		grad: (i, o) => 1,
	},
	geru: {
		calc: v => {
			const erf = v => {
				const p = 0.3275911
				const a1 = 0.254829592
				const a2 = -0.284496736
				const a3 = 1.421413741
				const a4 = -1.453152027
				const a5 = 1.061405429

				const sign = v < 0 ? -1 : 1
				const t = 1 / (1 + p * Math.abs(v))
				const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-v * v)
				return sign * erf
			}
			return (v * (1 + erf(v / Math.sqrt(2)))) / 2
		},
		grad: (i, o) => (i === 0 ? 0 : o / i) + (i * Math.exp(-((i / Math.sqrt(2)) ** 2))) / Math.sqrt(2 * Math.PI),
	},
	hard_elish: {
		calc: v => Math.max(0, Math.min(1, (v + 1) / 2)) * (v >= 0 ? v : Math.exp(v) - 1),
		grad: (i, o) => (i <= -1 ? 0 : i >= 1 ? (i >= 0 ? 1 : Math.exp(i)) : i >= 0 ? i : ((1 + i) * Math.exp(i)) / 2),
	},
	hard_swish: {
		calc: v => (v <= -3 ? 0 : 3 <= v ? v : (v * (v + 3)) / 6),
		grad: (i, o) => (i <= -3 ? 0 : 3 <= i ? 1 : (2 * i + 3) / 6),
	},
	lisht: {
		calc: v => v * Math.tanh(v),
		grad: (i, o) => Math.tanh(i) + i * (1 - Math.tanh(i) ** 2),
	},
	log: {
		calc: Math.log,
		grad: (i, o) => 1 / i,
	},
	loglog: {
		calc: v => Math.exp(-Math.exp(-v)),
		grad: (i, o) => Math.exp(-i) * o,
	},
	logsigmoid: {
		calc: v => Math.log(1 / (1 + Math.exp(-v))),
		grad: (i, o) => 1 / (1 + Math.exp(i)),
	},
	mish: {
		calc: v => v * Math.tanh(Math.log(1 + Math.exp(v))),
		grad: (i, o) =>
			(Math.exp(i) * (4 * (i + 1) + 4 * Math.exp(2 * i) + Math.exp(3 * i) + Math.exp(i) * (4 * i + 6))) /
			(2 * Math.exp(i) + Math.exp(2 * i) + 2) ** 2,
	},
	negative: {
		calc: v => -v,
		grad: (i, o) => -1,
	},
	relu: {
		calc: v => (v > 0 ? v : 0),
		grad: (i, o) => (i > 0 ? 1 : 0),
	},
	resech: {
		calc: v => v / Math.cosh(v),
		grad: (i, o) => 1 / Math.cosh(i) - o * Math.tanh(i),
	},
	reu: {
		calc: v => (v > 0 ? v : v * Math.exp(v)),
		grad: (i, o) => (i > 0 ? 1 : Math.exp(i) + o),
	},
	rootsig: {
		calc: v => v / (1 + Math.sqrt(1 + v ** 2)),
		grad: (i, o) => 1 / (Math.sqrt(i ** 2 + 1) + i ** 2 + 1),
	},
	round: {
		calc: Math.round,
		grad: (i, o) => 1,
	},
	sign: {
		calc: Math.sign,
		grad: (i, o) => 1,
	},
	silu: {
		calc: v => v / (1 + Math.exp(-v)),
		grad: (i, o) => 1 / (1 + Math.exp(-i)) + o * (1 - o / i),
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
	ssigmoid: {
		calc: v => 4 / (1 + Math.exp(-v)) - 2,
		grad: (i, o) => (4 * Math.exp(-i)) / (1 + Math.exp(-i)) ** 2,
	},
	tan: {
		calc: Math.tan,
		grad: (i, o) => 1 / Math.cos(i) ** 2,
	},
	tanh: {
		calc: Math.tanh,
		grad: (i, o) => 1 - o ** 2,
	},
	tanhexp: {
		calc: v => v * Math.tanh(Math.exp(v)),
		grad: (i, o) => Math.tanh(Math.exp(i)) - i * Math.exp(i) * (Math.tanh(Math.exp(i)) ** 2 - 1),
	},
	tanhshrink: {
		calc: v => v - Math.tanh(v),
		grad: (i, o) => Math.tanh(i) ** 2,
	},
}

for (const name of Object.keys(simpleLayers)) {
	buildLayer(name, simpleLayers[name].calc, simpleLayers[name].grad)
}

export * from './add.js'
export * from './additive_coupling.js'
export * from './apl.js'
export * from './aranda.js'
export * from './argmax.js'
export * from './averagepool.js'
export * from './batch_normalization.js'
export * from './bdaa.js'
export * from './blu.js'
export * from './brelu.js'
export * from './celu.js'
export * from './clip.js'
export * from './concat.js'
export * from './cond.js'
export * from './const.js'
export * from './conv.js'
export * from './crelu.js'
export * from './detach.js'
export * from './div.js'
export * from './dropout.js'
export * from './eelu.js'
export * from './elu.js'
export * from './erelu.js'
export * from './eswish.js'
export * from './felu.js'
export * from './flatten.js'
export * from './frelu.js'
export * from './full.js'
export * from './gaussian.js'
export * from './global_averagepool.js'
export * from './global_lppool.js'
export * from './global_maxpool.js'
export * from './gru.js'
export * from './hard_shrink.js'
export * from './hard_sigmoid.js'
export * from './hard_tanh.js'
export * from './hexpo.js'
export * from './huber.js'
export * from './include.js'
export * from './input.js'
export * from './isigmoid.js'
export * from './leaky_relu.js'
export * from './less.js'
export * from './linear.js'
export * from './lppool.js'
export * from './lrn.js'
export * from './lstm.js'
export * from './matmul.js'
export * from './maxpool.js'
export * from './mean.js'
export * from './mpelu.js'
export * from './mse.js'
export * from './mtlu.js'
export * from './mult.js'
export * from './nlrelu.js'
export * from './onehot.js'
export * from './output.js'
export * from './pau.js'
export * from './pdelu.js'
export * from './pelu.js'
export * from './plu.js'
export * from './power.js'
export * from './prelu.js'
export * from './preu.js'
export * from './psf.js'
export * from './ptanh.js'
export * from './ptelu.js'
export * from './random.js'
export * from './repu.js'
export * from './reshape.js'
export * from './reverse.js'
export * from './rnn.js'
export * from './rrelu.js'
export * from './rtrelu.js'
export * from './selu.js'
export * from './sigmoid.js'
export * from './slaf.js'
export * from './slu.js'
export * from './soft_shrink.js'
export * from './softargmax.js'
export * from './softmax.js'
export * from './softplus.js'
export * from './sparse.js'
export * from './split.js'
export * from './srelu.js'
export * from './srs.js'
export * from './stanh.js'
export * from './std.js'
export * from './sub.js'
export * from './sum.js'
export * from './supervisor.js'
export * from './swish.js'
export * from './taf.js'
export * from './thresholded_relu.js'
export * from './transpose.js'
export * from './variable.js'
export * from './variance.js'
