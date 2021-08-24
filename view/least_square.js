import LeastSquares from '../model/least_square.js'
import stringToFunction from '../js/expression.js'
import EnsembleBinaryModel from '../js/ensemble.js'

const combination_repetition = (n, k) => {
	const c = []
	const a = Array(k).fill(0)
	while (a[a.length - 1] < n) {
		c.push(a.concat())
		for (let i = a.length - 1; i >= 0; i--) {
			a[i]++
			if (a[i] < n) {
				for (let k = i + 1; k < a.length; k++) {
					a[k] = a[i]
				}
				break
			}
		}
	}
	return c
}

export class BasisFunctions {
	constructor(platform) {
		this._platform = platform
		this._f = []
		this._name = Math.random().toString(32).substring(2)
	}

	get functions() {
		return this._f.map(expr => stringToFunction(expr))
	}

	terminate() {
		this._e?.remove()
	}

	apply(x) {
		const n = x.length
		const m = x[0].length
		const f = this.functions

		const xh = new Matrix(n, f.length + m + 1)
		for (let i = 0; i < n; i++) {
			xh.set(i, 0, 1)
			for (let k = 0; k < m; k++) {
				xh.set(i, k + 1, x[i][k])
			}
			for (let k = 0; k < f.length; k++) {
				xh.set(i, k + m + 1, f[k]({ x: x[i] }))
			}
		}
		return xh
	}

	makeHtml(r) {
		if (!this._e) {
			this._e = r.append('div').attr('id', `ls_model_${this._name}`)
		} else {
			this._e.selectAll('*').remove()
		}
		const createPreset = () => {
			const preset = this._e.select('[name=preset]').property('value')
			this._f.length = 0
			presetElm.selectAll('.ls_params').style('display', 'none')
			if (preset === 'linear') {
			} else if (preset === 'polynomial') {
				polyElm.style('display', null)
				const p = +polyElm.select('[name=p]').property('value')
				if (p > 1) {
					for (let k = 2; k <= p; k++) {
						const cb = combination_repetition(this._platform.datas.dimension, k)
						for (const ptn of cb) {
							const power = Array(this._platform.datas.dimension).fill(0)
							for (const i of ptn) {
								power[i]++
							}
							let e = ''
							let sep = ''
							for (let d = 0; d < power.length; d++) {
								if (power[d] === 1) {
									e += sep + `x[${d}]`
									sep = '*'
								} else if (power[d] > 1) {
									e += sep + `x[${d}]^${power[d]}`
									sep = '*'
								}
							}
							this._f.push(e)
						}
					}
				}
			}
			createTerms()
		}
		const presetElm = this._e.append('div')
		presetElm.append('span').text('preset')
		presetElm
			.append('select')
			.attr('name', 'preset')
			.on('change', createPreset)
			.selectAll('option')
			.data(['linear', 'polynomial'])
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
		const polyElm = presetElm.append('span').classed('ls_params', true)
		polyElm.style('display', 'none')
		polyElm.append('span').text(' p ')
		polyElm
			.append('input')
			.attr('type', 'number')
			.attr('name', 'p')
			.attr('min', 1)
			.attr('max', 10)
			.attr('value', 2)
			.on('change', createPreset)

		const exprs = this._e.append('span')
		const createTerms = () => {
			exprs.selectAll('*').remove()
			exprs.append('span').text(' f(x) = a0')
			for (let d = 0; d < this._platform.datas?.dimension; d++) {
				exprs.append('span').text(` + a${d + 1}*x[${d}]`)
			}
			for (let i = 0; i < this._f.length; i++) {
				exprs.append('span').text(` + a${i + this._platform.datas?.dimension + 1}*`)
				exprs
					.append('input')
					.attr('type', 'text')
					.attr('name', `expr${i}`)
					.attr('value', (this._f[i] ||= 'x[0] ^ 2'))
					.attr('size', 8)
					.on('change', () => {
						this._f[i] = exprs.select(`[name=expr${i}]`).property('value')
					})
				exprs
					.append('input')
					.attr('type', 'button')
					.attr('value', 'x')
					.on('click', () => {
						this._f.splice(i, 1)
						createTerms()
					})
			}
			exprs.append('span').text(' ')
			exprs
				.append('input')
				.attr('type', 'button')
				.attr('value', '+')
				.on('click', () => {
					this._f.push(null)
					createTerms()
				})
		}
		createTerms()
	}
}

var dispLeastSquares = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty) => {
			let model
			if (platform.task === 'CF') {
				const method = elm.select('[name=method]').property('value')
				model = new EnsembleBinaryModel(LeastSquares, method)
			} else {
				model = new LeastSquares()
			}
			model.fit(basisFunctions.apply(tx).toArray(), ty)

			platform.predict((px, pred_cb) => {
				let pred = model.predict(basisFunctions.apply(px).toArray())
				pred_cb(pred)
			}, 2)
		})
	}

	if (platform.task === 'CF') {
		elm.append('select')
			.attr('name', 'method')
			.selectAll('option')
			.data(['oneone', 'onerest'])
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
	}
	const basisFunctions = new BasisFunctions(platform)
	basisFunctions.makeHtml(elm)

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLeastSquares(platform.setting.ml.configElement, platform)
	platform.setting.ml.detail = `
The model form is
$$
f(X) = \\sum_{k=1}^m a_k g_k(X) + \\epsilon
$$

In the least-squares setting, the loss function can be written as
$$
L(W) = \\| f(X) - y \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
Therefore, the optimum parameter $ \\hat{a} $ is estimated as
$$
\\hat{a} = \\left( G^T G \\right)^{-1} G^T y
$$
where $ G_{ij} = g_i(x_j) $.
`
}
