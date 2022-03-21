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
				const e = elm.select(`[name=x${i}]`)
				e.selectAll('.axis-domain').style('display', 'none')
				if (!this._range[i]) {
					this._range[i] = this._defaultrange[i]
				}
				if (Array.isArray(this._range[i])) {
					this._axisDomains[i].range = this._range[i]
				} else {
					this._axisDomains[i].expr = this._range[i]
				}
			}
			elm.select('input[name=expr]').property('value', this._presets[fun].expr)
			this._rpn = stringToFunction(this._presets[fun].expr)
		}
		const initDim = d => {
			this._d = d
			elm.select('[name=dim]').property('value', d)
			this._defaultrange = []
			for (let i = 0; i < this._d; this._defaultrange[i++] = [0, 10]);
			domainElm.selectAll('*').remove()
			this._axisDomains = []
			for (let i = 0; i < this._d; i++) {
				const e = domainElm.append('div').attr('name', `x${i}`)
				const _this = this
				this._axisDomains[i] = {
					set expr(value) {
						e.select('select').property('value', 'func')
						e.selectAll('.axis-domain').style('display', 'none')
						e.select('[name=func]').style('display', null)
						e.select('input[name=dep_expr]').property('value', value)
						_this._depRpn[i] = stringToFunction(value)
					},
					set range(value) {
						e.select('select').property('value', 'range')
						e.selectAll('.axis-domain').style('display', 'none')
						e.select('[name=range]').style('display', null)
						e.select('[name=min]').property('value', (_this._range[i][0] = value[0]))
						e.select('[name=max]').property('value', (_this._range[i][1] = value[1]))
						_this._depRpn[i] = null
					},
				}
				e.append('select')
					.on('change', () => {
						const t = e.select('select').property('value')
						e.selectAll('.axis-domain').style('display', 'none')
						e.select(`[name=${t}]`).style('display', null)
						if (t === 'func') {
							const expr = e.select('input[name=dep_expr]').property('value')
							this._depRpn[i] = stringToFunction(expr)
						} else {
							this._depRpn[i] = null
							this._range[i][0] = +e.select('[name=min]').property('value')
							this._range[i][1] = +e.select('[name=max]').property('value')
						}
						this._createData()
					})
					.selectAll('option')
					.data(['range', 'func'])
					.enter()
					.append('option')
					.attr('value', d => d)
					.text(d => d)
				const re = e.append('span').attr('name', 'range').classed('axis-domain', true)
				re.append('input')
					.attr('type', 'number')
					.attr('name', 'min')
					.attr('max', 1000)
					.attr('min', -1000)
					.attr('value', 0)
					.on('change', () => {
						this._range[i][0] = +re.select('[name=min]').property('value')
						this._createData()
					})
				re.append('span').text(`<= x[${i}] <=`)
				re.append('input')
					.attr('type', 'number')
					.attr('name', 'max')
					.attr('max', 1000)
					.attr('min', -1000)
					.attr('value', 10)
					.on('change', () => {
						this._range[i][1] = +re.select('[name=max]').property('value')
						this._createData()
					})

				const de = e.append('span').attr('name', 'func').style('display', 'none').classed('axis-domain', true)
				de.append('span').text(` x[${i}] = `)
				if (i === 0) {
					de.append('span').text('f(t) = ')
				} else if (i === 1) {
					de.append('span').text('f(t, x[0]) = ')
				} else if (i === 2) {
					de.append('span').text('f(t, x[0], x[1]) = ')
				} else {
					de.append('span').text(`f(t, x[0], ..., x[${i - 1}]) = `)
				}
				de.append('input')
					.attr('type', 'text')
					.attr('name', 'dep_expr')
					.attr('value', 'rand()')
					.on('change', () => {
						const expr = e.select('input[name=dep_expr]').property('value')
						this._depRpn[i] = stringToFunction(expr)
						this._createData()
					})
			}
			this._tf.style('display', this._d === 1 ? null : 'none')
			elm.select('[name=number]').property('value', (this._n = this._d === 1 ? 100 : 500))
			this.setting.vue.$forceUpdate()
		}

		const elm = this.setting.data.configElement
		elm.append('div')
			.text('Dimension')
			.append('input')
			.attr('type', 'number')
			.attr('name', 'dim')
			.attr('min', 1)
			.attr('max', 10)
			.attr('value', (this._d = 1))
			.on('change', () => {
				initDim(+elm.select('[name=dim]').property('value'))
				Promise.resolve().then(() => {
					initValues()
					this._createData()
				})
			})
		const presetElm = elm.append('div')
		this._setPreset = preset => {
			elm.select('[name=preset]').property('value', preset)
			if (this._presets[preset].dim && this._presets[preset].dim !== this._d) {
				initDim(this._presets[preset].dim)
			}
			Promise.resolve().then(() => {
				initValues()
				this._createData()
			})
		}
		presetElm.append('span').text('Preset')
		presetElm
			.append('select')
			.attr('name', 'preset')
			.on('change', () => {
				const fun = elm.select('[name=preset]').property('value')
				this._setPreset(fun)
				this.setting.vue.pushHistory()
			})
			.selectAll('option')
			.data(Object.keys(this._presets))
			.enter()
			.append('option')
			.attr('value', d => d)
			.text(d => d)
		elm.append('span').attr('name', 'expr').text(' f(t, x) = ').attr('title', exprUsage)
		elm.append('input')
			.attr('type', 'text')
			.attr('name', 'expr')
			.attr('value', this._presets.linear.expr)
			.attr('title', exprUsage)
			.on('change', () => {
				const expr = elm.select('input[name=expr]').property('value')
				this._rpn = stringToFunction(expr)
				this._createData()
			})
		this._rpn = stringToFunction(this._presets.linear.expr)
		elm.append('span').text(' Domain ')
		const domainElm = elm.append('div').style('display', 'inline-block')

		elm.append('span').text(' Number ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'number')
			.attr('max', 1000)
			.attr('min', 1)
			.attr('value', 100)
			.on('change', () => {
				this._n = +elm.select('[name=number]').property('value')
				this._createData()
			})
		elm.append('span').text(' Noise ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'error_scale')
			.attr('step', 0.1)
			.attr('value', 0.1)
			.attr('min', 0)
			.attr('max', 10)
			.on('change', () => {
				this._createData()
			})

		this._tf = this.setting.svg
			.append('g')
			.classed('true-function', true)
			.append('path')
			.attr('stroke', 'blue')
			.attr('stroke-opacity', 0.3)
			.attr('fill-opacity', 0)
		initDim(this._d)
		this._createData()
	}

	get _isSeries() {
		return ['SM', 'TP', 'CP'].indexOf(this._manager.platform.task) >= 0
	}

	get columnNames() {
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
		if (['CF'].indexOf(this._manager.platform.task) >= 0) {
			return this._y.map(v => Math.round(v))
		} else {
			return this._y
		}
	}

	get availTask() {
		if (this._d === 1) {
			return ['RG', 'IN', 'TF', 'SM', 'TP', 'CP']
		} else {
			return ['RG', 'IN', 'CF', 'AD', 'DR', 'FS']
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
		return elm.select('[name=preset]').property('value')
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
		const errorScale = +elm.select('input[name=error_scale]').property('value')

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
			if (this._d === 1) {
				const line = d3
					.line()
					.x(d => d[0])
					.y(d => d[1])
				this._tf.attr('d', line(p.map(v => this._manager.platform._renderer.toPoint(v))))
			}
		})
	}

	at(i) {
		return Object.defineProperties(
			{},
			{
				x: {
					get: () => this._x[i],
					set: v => {
						this._x[i] = v.slice(0, this._d)
						this._manager.platform.render()
					},
				},
				y: {
					get: () => this._y[i],
					set: v => {
						this._y[i] = v
						this._manager.platform.render()
					},
				},
				point: {
					get: () => this.points[i],
				},
			}
		)
	}

	terminate() {
		super.terminate()
		this.setting.svg.select('g.true-function').remove()
	}
}
