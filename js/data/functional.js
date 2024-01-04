import { MultiDimensionalData } from './base.js'
import stringToFunction from '../expression.js'

const exprUsage = `
Variables:
  x: Data vector. x[0] means the first axis value.
  t: Index of the data
  n: Total number of the data
  d: Number of dimensions
Constants:
  pi: Pi (about 3.14159)
  e: Napier's constant (about 2.71828) 
Operations:
  +: Add/Positive
  -: Subtract/Negative
  *: Multiply
  /: Divide
  ^: Power
  //: Quotient
  %: Modulus
  !: Not
  ||: Or
  &&: And
  ==: Equal
  !=: Not equal
  <: Less
  <=: Less or equal
  >: Greater
  >=: Greater or equal
Functions:
  abs: Absolute
  ceil: Ceil
  floor: Floor
  round: Round
  sqrt: Square root
  cbrt: Qubic root
  sin: Sine
  cos: Cosine
  tan: Tangent
  asin: Arcsine
  acos: Arccosine
  atan: Arctangent
  tanh: Hyperbolic tangent
  exp: Exponential
  log: Logarithm
  sign: Sign
  rand: Random value in [0, 1)
  randn: Random value from normal distribution
  cond: Switch values with a condition. cond(condition, when truthy, when falsy)
`

export default class FunctionalData extends MultiDimensionalData {
	constructor(manager) {
		super(manager)
		this._n = 100

		this._x = []
		this._y = []

		this._defaultrange = [[0, 10]]
		this._range = [[0, 10]]

		this._axisDomains = []
		this._depRpn = []

		const _this = this
		this._presets = {
			linear: { expr: 'x[0]' },
			sin: { expr: 'sin(x[0])' },
			tanh: {
				expr: 'tanh(x[0])',
				get range() {
					const r = []
					for (let i = 0; i < _this._d; i++) {
						r[i] = [-5, 5]
					}
					return r
				},
			},
			gaussian: {
				get expr() {
					return _this._d === 1 ? 'exp(-(x[0] ^ 2) / 2)' : '4 * exp(-(x[0] ^ 2 + x[1] ^ 2) / 2)'
				},
				get range() {
					if (_this._d === 1) return [[-5, 5]]
					else if (_this._d === 2)
						return [
							[-3, 3],
							[-3, 3],
						]
					return [
						[-3, 3],
						[-3, 3],
						[-3, 3],
					]
				},
			},
			expdist: { expr: '0.5 * exp(-0.5 * x[0])', dim: 1 },
			plaid: {
				get expr() {
					if (_this._d === 1) return 'abs(floor(x[0])) % 2 + 1'
					else if (_this._d === 2) return '(abs(floor(x[0])) + abs(floor(x[1]))) % 2 + 1'
					return '(abs(floor(x[0])) + abs(floor(x[1])) + abs(floor(x[2]))) % 2 + 1'
				},
				get range() {
					if (_this._d === 1) return [[-2, 2]]
					else if (_this._d === 2)
						return [
							[-2, 2],
							[-2, 2],
						]
					return [
						[-2, 2],
						[-2, 2],
						[-2, 2],
					]
				},
			},
			spiral: {
				expr: '(abs(1 * atan(x[1] / x[0]) - sqrt(x[0] ^ 2 + x[1] ^ 2)) % 4 < 2) + 1',
				range: [
					[-5, 5],
					[-5, 5],
				],
				dim: 2,
			},
			swiss_roll: {
				expr: 't / 50',
				range: ['t / 40 * sin(t / 40)', 't / 40 * cos(t / 40)', [-2, 2]],
				dim: 2,
			},
			trefoil_knot: {
				expr: '4 * sin(t / n * 2 * pi) +  4',
				range: [
					'sin(t / n * 2 * pi) + 2 * sin(4 * t / n * pi)',
					'cos(t / n * 2 * pi) - 2 * cos(4 * t / n * pi)',
					'-sin(6 * t / n * pi)',
				],
				dim: 3,
			},
			'Möbius strip': {
				expr: 'sin(t / n * pi) * 5 + 1',
				range: [
					'((t % (n // 100) / (n // 100 - 1) * 2 - 1) * cos(t / n * pi) + 2) * cos(2 * t / n * pi)',
					'((t % (n // 100) / (n // 100 - 1) * 2 - 1) * cos(t / n * pi) + 2) * sin(2 * t / n * pi)',
					'(t % (n // 100) / (n // 100 - 1) * 2 - 1) * sin(t / n * pi) + 2',
				],
				dim: 3,
			},
			'Klein bottle': {
				expr: 'sin(t / n * pi) * 5 + 1',
				range: [
					'cos(t // floor(sqrt(n)) / floor(sqrt(n)) * pi) * cos(t % floor(sqrt(n)) / floor(sqrt(n)) * 2 * pi) - sin(t // floor(sqrt(n)) / floor(sqrt(n)) * pi) * sin(t % floor(sqrt(n)) / floor(sqrt(n)) * 4 * pi)',
					'sin(t // floor(sqrt(n)) / floor(sqrt(n)) * pi) * cos(t % floor(sqrt(n)) / floor(sqrt(n)) * 2 * pi) + cos(t // floor(sqrt(n)) / floor(sqrt(n)) * pi) * sin(t % floor(sqrt(n)) / floor(sqrt(n)) * 4 * pi)',
					'cos(t // floor(sqrt(n)) / floor(sqrt(n)) * 2 * pi) * (1 + 0.1 * sin(t % floor(sqrt(n)) / floor(sqrt(n)) * 2 * pi))',
					'sin(t // floor(sqrt(n)) / floor(sqrt(n)) * 2 * pi) * (1 + 0.1 * sin(t % floor(sqrt(n)) / floor(sqrt(n)) * 2 * pi))',
				],
				dim: 4,
			},
			saddle: {
				expr: 'x[2]',
				range: [[-1, 1], [-1, 1], 'x[0] ^ 2 - x[1] ^ 2'],
				dim: 3,
			},
		}

		const initValues = () => {
			const fun = this.preset
			this._range = (this._presets[fun].range || this._defaultrange).map(r => r.concat())
			this._range.length = this._d
			for (let i = 0; i < this._d; i++) {
				if (!this._range[i]) {
					this._range[i] = this._defaultrange[i]
				}
				if (Array.isArray(this._range[i])) {
					this._axisDomains[i].range = this._range[i]
				} else {
					this._axisDomains[i].expr = this._range[i]
				}
			}
			expr.value = this._presets[fun].expr
			this._rpn = stringToFunction(this._presets[fun].expr)
		}
		const initDim = d => {
			this._d = d
			dim.value = d
			this._defaultrange = []
			for (let i = 0; i < this._d; this._defaultrange[i++] = [0, 10]);
			domainElm.replaceChildren()
			this._axisDomains = []
			for (let i = 0; i < this._d; i++) {
				const e = document.createElement('div')
				domainElm.appendChild(e)
				const _this = this
				this._axisDomains[i] = {
					set expr(value) {
						eslct.value = 'func'
						e.querySelectorAll('.axis-domain').forEach(e => (e.style.display = 'none'))
						de.style.display = null
						depexpr.value = value
						_this._depRpn[i] = stringToFunction(value)
					},
					set range(value) {
						eslct.value = 'range'
						e.querySelectorAll('.axis-domain').forEach(e => (e.style.display = 'none'))
						re.style.display = null
						emin.value = _this._range[i][0] = value[0]
						emax.value = _this._range[i][1] = value[1]
						_this._depRpn[i] = null
					},
				}
				const eslct = document.createElement('select')
				eslct.onchange = () => {
					const t = eslct.value
					e.querySelectorAll('.axis-domain').forEach(e => (e.style.display = 'none'))
					e.querySelector(`[name=${t}]`).style.display = null
					if (t === 'func') {
						this._depRpn[i] = stringToFunction(depexpr.value)
					} else {
						this._depRpn[i] = null
						this._range[i][0] = +emin.value
						this._range[i][1] = +emax.value
					}
					this._createData()
				}
				for (const name of ['range', 'func']) {
					const opt = document.createElement('option')
					opt.value = opt.innerText = name
					eslct.appendChild(opt)
				}
				e.appendChild(eslct)

				const re = document.createElement('span')
				re.setAttribute('name', 'range')
				re.classList.add('axis-domain')
				e.appendChild(re)
				const emin = document.createElement('input')
				emin.type = 'number'
				emin.max = 1000
				emin.min = -1000
				emin.value = 0
				emin.onchange = () => {
					this._range[i][0] = +emin.value
					this._createData()
				}
				re.appendChild(emin)
				re.append(`<= x[${i}] <=`)
				const emax = document.createElement('input')
				emax.type = 'number'
				emax.max = 1000
				emax.min = -100
				emax.value = 10
				emax.onchange = () => {
					this._range[i][1] = +emax.value
					this._createData()
				}
				re.appendChild(emax)

				const de = document.createElement('span')
				de.setAttribute('name', 'func')
				de.classList.add('axis-domain')
				de.style.display = 'none'
				e.appendChild(de)
				de.append(` x[${i}] = `)
				if (i === 0) {
					de.append('f(t) = ')
				} else if (i === 1) {
					de.append('f(t, x[0]) = ')
				} else if (i === 2) {
					de.append('f(t, x[0], x[1]) = ')
				} else {
					de.append(`f(t, x[0], ..., x[${i - 1}]) = `)
				}
				const depexpr = document.createElement('input')
				depexpr.type = 'text'
				depexpr.value = 'rand()'
				depexpr.onchange = () => {
					this._depRpn[i] = stringToFunction(depexpr.value)
					this._createData()
				}
				de.appendChild(depexpr)
			}
			if (this._tf) {
				this._tf.style.display = this._d === 1 ? null : 'none'
			}
			dataNumber.value = this._n = this._d === 1 ? 100 : 500
			this.setting.vue.$forceUpdate()
		}

		const elm = this.setting.data.configElement
		const dimelm = document.createElement('div')
		elm.appendChild(dimelm)
		const dim = document.createElement('input')
		dim.type = 'number'
		dim.name = 'dim'
		dim.min = 1
		dim.max = 10
		dim.value = this._d = 1
		dim.onchange = () => {
			initDim(+dim.value)
			Promise.resolve().then(() => {
				initValues()
				this._createData()
			})
		}
		dimelm.append('Dimension', dim)

		const presetElm = document.createElement('div')
		elm.appendChild(presetElm)
		this._setPreset = preset => {
			presetSlct.value = preset
			if (this._presets[preset].dim && this._presets[preset].dim !== this._d) {
				initDim(this._presets[preset].dim)
			}
			Promise.resolve().then(() => {
				initValues()
				this._createData()
			})
		}
		const presetSlct = document.createElement('select')
		presetSlct.name = 'preset'
		presetSlct.onchange = () => {
			this._setPreset(presetSlct.value)
			this.setting.vue.pushHistory()
		}
		for (const preset of Object.keys(this._presets)) {
			const opt = document.createElement('option')
			opt.value = opt.innerText = preset
			presetSlct.appendChild(opt)
		}
		presetElm.append('Preset', presetSlct)

		const exprLbl = document.createElement('span')
		exprLbl.title = exprUsage
		exprLbl.innerText = ' f(t, x) = '
		elm.appendChild(exprLbl)
		const expr = document.createElement('input')
		expr.type = 'text'
		expr.value = this._presets.linear.expr
		expr.title = exprUsage
		expr.onchange = () => {
			this._rpn = stringToFunction(expr.value)
			this._createData()
		}
		elm.appendChild(expr)

		this._rpn = stringToFunction(this._presets.linear.expr)
		const domainElm = document.createElement('div')
		domainElm.style.display = 'inline-block'
		elm.append(' Domain ', domainElm)

		const dataNumber = document.createElement('input')
		dataNumber.type = 'number'
		dataNumber.max = 1000
		dataNumber.min = 1
		dataNumber.value = 100
		dataNumber.onchange = () => {
			this._n = +dataNumber.value
			this._createData()
		}
		elm.append(' Number ', dataNumber)
		const errScale = document.createElement('input')
		errScale.type = 'number'
		errScale.name = 'error_scale'
		errScale.min = 0
		errScale.max = 10
		errScale.step = 0.1
		errScale.value = 0.1
		errScale.onchange = () => {
			this._createData()
		}
		elm.append(' Noise ', errScale)

		initDim(this._d)
		this._createData()
	}

	get _isSeries() {
		return ['SM', 'TP', 'CP'].includes(this._manager.platform.task)
	}

	get columnNames() {
		if (this._isSeries) {
			return []
		}
		const axises = []
		for (let i = 0; i < this._d; i++) {
			axises.push(`x[${i}]`)
		}
		return axises
	}

	get x() {
		return this._isSeries ? [] : this._x
	}

	get y() {
		if (['CF', 'RL'].includes(this._manager.platform.task)) {
			return this._y.map(v => Math.round(v))
		} else {
			return this._y
		}
	}

	get availTask() {
		if (this._d === 1) {
			return ['RG', 'IN', 'RL', 'TF', 'SM', 'TP', 'CP']
		} else {
			return ['RG', 'IN', 'CF', 'RL', 'AD', 'DR', 'FS']
		}
	}

	get dimension() {
		return this._isSeries ? 0 : this._d
	}

	get domain() {
		return this._range
	}

	get preset() {
		const elm = this.setting.data.configElement
		return elm.querySelector('[name=preset]').value
	}

	get params() {
		return {
			preset: this.preset,
		}
	}

	set params(params) {
		if (params.preset) {
			this._setPreset(params.preset)
		}
	}

	_fitData(x) {
		return x.map((v, i) => v * (this._range[i][1] - this._range[i][0]) + this._range[i][0])
	}

	_createData() {
		const elm = this.setting.data.configElement
		const errorScale = +elm.querySelector('input[name=error_scale]').value

		this._x = []
		for (let i = 0; i < this._n; i++) {
			if (this._d === 1) {
				this._x.push(this._fitData([i / this._n]))
			} else {
				const v = []
				for (let k = 0; k < this._d; k++) {
					v[k] = Math.random()
				}
				this._x.push(this._fitData(v))
			}
		}
		for (let k = 0; k < this._d; k++) {
			if (this._depRpn[k]) {
				this._range[k] = [Infinity, -Infinity]
				for (let i = 0; i < this._n; i++) {
					const x = this._x[i].slice(0, k)
					const v = this._depRpn[k]({
						x: x,
						t: i,
						n: this._n,
						d: this._d,
					})
					this._x[i][k] = v
					this._range[k][0] = Math.min(this._range[k][0], v)
					this._range[k][1] = Math.max(this._range[k][1], v)
				}
			}
		}

		this._y = this._x.map((x, i) =>
			this._rpn({
				x: x,
				t: i,
				n: this._n,
				d: this._d,
			})
		)

		const p = this._x.map((x, i) => (this._isSeries ? [i, [this._y[i]]] : [x, this._y[i]]))

		for (let i = 0; i < this._n; i++) {
			this._y[i] += errorScale * Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
		}

		this._manager.onReady(() => {
			this._manager.platform.init()
			if (!this._tf && this._manager.platform.svg) {
				const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
				g.classList.add('true-function')
				this._manager.platform.svg.appendChild(g)
				this._tf = document.createElementNS('http://www.w3.org/2000/svg', 'path')
				this._tf.setAttribute('stroke', 'blue')
				this._tf.setAttribute('stroke-opacity', 0.3)
				this._tf.setAttribute('fill-opacity', 0)
				this._tf.style.display = this._d === 1 ? null : 'none'
				g.appendChild(this._tf)
			}
			if (this._tf && this._d === 1) {
				let d = ''
				for (let i = 0; i < p.length; i++) {
					const pi = this._manager.platform._renderer[0].toPoint(p[i])
					d += `${i === 0 ? 'M' : 'L'}${pi[0]},${pi[1]}`
				}
				this._tf.setAttribute('d', d)
			}
		})
	}

	terminate() {
		this._manager.platform.svg?.querySelector('g.true-function')?.remove()
		super.terminate()
	}
}
