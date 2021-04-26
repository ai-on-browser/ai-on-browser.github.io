import { MultiDimensionalData } from './base.js'

const exprUsage = `
Variables:
  x: x-axis value
  y: y-axis value (if the dimension is greater than 1)
  z: z-axis value (if the dimension is greater than 2)
  t: Index of the data
Constants:
  pi: PI
  e: E
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
`

class OP {
	constructor(name, priority, func) {
		this.name = name
		this.p = priority
		this.f = func
	}

	get length() {
		return this.f.length
	}
}

const uops = {
	'+': new OP('+', 4, v => v),
	'-': new OP('-', 4, v => -v),
	'!': new OP('!', 4, v => !v ? 1 : 0)
}

const bops = {
	'||': new OP('||', -2, (a, b) => a || b ? 1 : 0),
	'&&': new OP('&&', -1, (a, b) => a || b ? 1 : 0),
	'==': new OP('==', 0, (a, b) => a === b ? 1 : 0),
	'!=': new OP('!=', 0, (a, b) => a !== b ? 1 : 0),
	'<': new OP('<', 0, (a, b) => a < b ? 1 : 0),
	'<=': new OP('<=', 0, (a, b) => a <= b ? 1 : 0),
	'>': new OP('>', 0, (a, b) => a > b ? 1 : 0),
	'>=': new OP('>=', 0, (a, b) => a >= b ? 1 : 0),
	'-': new OP('-', 1, (a, b) => a - b),
	'+': new OP('+', 1, (a, b) => a + b),
	'*': new OP('*', 2, (a, b) => a * b),
	'/': new OP('/', 2, (a, b) => a / b),
	'%': new OP('%', 2, (a, b) => a % b),
	'^': new OP('^', 3, (a, b) => a ** b),
}

const funcs = {
	abs: Math.abs,
	ceil: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	sqrt: Math.sqrt,
	cbrt: Math.cbrt,
	sin: Math.sin,
	cos: Math.cos,
	tan: Math.tan,
	asin: Math.asin,
	acos: Math.acos,
	atan: Math.atan,
	tanh: Math.tanh,
	exp: Math.exp,
	log: Math.log,
	sign: Math.sign,
	rand: Math.random,
	randn: () => Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
}

const consts = {
	pi: Math.PI,
	e: Math.E
}

const tokenTable = [
	...Object.keys(bops),
	...Object.keys(uops),
	'(', ')', ',',
]
tokenTable.sort((a, b) => b.length - a.length)

const tokenize = e => {
	let p = 0
	const tk = []

	const isToken = s => {
		for (const op of tokenTable) {
			if (op === e.slice(p + s, p + s + op.length)) {
				return op
			}
		}
		return null
	}

	while (p < e.length) {
		if (e[p] === ' ') {
			p++
			continue
		}
		const op = isToken(0)
		if (op) {
			p += op.length
			tk.push(op)
			continue
		}

		let i = 1
		for (; i < e.length - p; i++) {
			if (e[p + i] === ' ' || isToken(i)) {
				break
			}
		}
		tk.push(e.slice(p, p + i))
		p += i
	}
	return tk
}

const construct = e => {
	const tokens = tokenize(e)

	const rpn = []
	const stack = []
	let lastExpr = false
	for (const token of tokens) {
		if (['x', 'y', 'z', 't'].indexOf(token) >= 0) {
			rpn.push(token)
			lastExpr = true
		} else if (consts[token]) {
			rpn.push(consts[token])
			lastExpr = true
		} else if (funcs[token]) {
			stack.push(token)
			lastExpr = false
		} else if (uops[token] || bops[token]) {
			if (lastExpr && !bops[token] || !lastExpr && !uops[token]) {
				throw `Invalid operation '${token}'.`
			}
			const op = lastExpr ? bops[token] : uops[token]
			while (true) {
				const lt = stack[stack.length - 1]
				if (lt instanceof OP && lt.p >= op.p) {
					rpn.push(stack.pop())
				} else {
					break
				}
			}
			stack.push(op)
			lastExpr = false
		} else if (token === ',') {
			while (true) {
				if (stack.length === 0) {
					throw 'Invalid parenthesis'
				}
				if (stack[stack.length - 1] === '(') {
					break
				}
				rpn.push(stack.pop())
			}
			lastExpr = false
		} else if (token === '(') {
			stack.push(token)
			lastExpr = false
		} else if (token === ')') {
			while (true) {
				const lt = stack.pop()
				if (!lt) {
					throw 'Invalid parenthesis'
				}
				if (lt === '(') {
					if (funcs[stack[stack.length - 1]]) {
						rpn.push(stack.pop())
					}
					break
				}
				rpn.push(lt)
			}
			lastExpr = true
		} else {
			rpn.push(+token)
			lastExpr = true
		}
	}

	while (stack.length > 0) {
		rpn.push(stack.pop())
	}
	return rpn
}

const execute = (rpn, x, t) => {
	const n = rpn.length
	let k = n - 1

	const calc = () => {
		if (typeof rpn[k] === 'number') {
			return rpn[k--]
		} else if (rpn[k] === 'x') {
			k--
			return x[0]
		} else if (rpn[k] === 'y') {
			k--
			return x[1]
		} else if (rpn[k] === 'z') {
			k--
			return x[2]
		} else if (rpn[k] === 't') {
			k--
			return t
		}
		const f = rpn[k--]
		if (f instanceof OP) {
			const args = []
			for (let i = 0; i < f.length; i++) {
				args.unshift(calc())
			}
			return f.f(...args)
		}
		if (funcs[f]) {
			const an = funcs[f].length
			const args = []
			for (let i = 0; i < an; i++) {
				args.unshift(calc())
			}
			return funcs[f](...args)
		}
		return 0
	}
	return calc()
}

export default class FunctionalData extends MultiDimensionalData {
	constructor(manager) {
		super(manager)
		this._n = 100

		this._x = []
		this._y = []

		this._defaultrange = [[0, 10]]
		this._range = [[0, 10]]

		this._axisNames = ["x", "y", "z"]
		this._depRpn = []

		const _this = this
		this._presets = {
			linear: {
				expr: "x"
			},
			sin: {
				expr: "sin(x)"
			},
			tanh: {
				expr: "tanh(x)",
				get range() {
					const r = []
					for (let i = 0; i < _this._d; i++) {
						r[i] = [-5, 5]
					}
					return r
				}
			},
			gaussian: {
				get expr() {
					return _this._d === 1 ? "exp(-(x ^ 2) / 2)" : "4 * exp(-(x ^ 2 + y ^ 2) / 2)"
				},
				get range() {
					if (_this._d === 1) return [[-5, 5]]
					else if (_this._d === 2) return [[-3, 3], [-3, 3]]
					return [[-3, 3], [-3, 3], [-3, 3]]
				}
			},
			expdist: {
				expr: "0.5 * exp(-0.5 * x)",
				dim: 1
			},
			plaid: {
				get expr() {
					if (_this._d === 1) return "abs(floor(x)) % 2 + 1"
					else if (_this._d === 2) return "(abs(floor(x)) + abs(floor(y))) % 2 + 1"
					return "(abs(floor(x)) + abs(floor(y)) + abs(floor(z))) % 2 + 1"
				},
				get range() {
					if (_this._d === 1) return [[-2, 2]]
					else if (_this._d === 2) return [[-2, 2], [-2, 2]]
					return [[-2, 2], [-2, 2], [-2, 2]]
				}
			},
			spiral: {
				expr: "(abs(1 * atan(y / x) - sqrt(x ^ 2 + y ^ 2)) % 4 < 2) + 1",
				range: [[-5, 5], [-5, 5]],
				dim: 2
			},
			swiss_roll: {
				expr: "t / 50",
				range: ["t / 40 * sin(t / 40)", "t / 40 * cos(t / 40)", [-2, 2]],
				dim: 2
			}
		}

		const initValues = () => {
			const fun = this.preset
			this._range = (this._presets[fun].range || this._defaultrange).map(r => r.concat())
			this._range.length = this._d
			for (let i = 0; i < this._d; i++) {
				const e = elm.select("[name=" + this._axisNames[i] + "]")
				e.selectAll('.axis-domain').style("display", "none")
				if (!this._range[i]) {
					this._range[i] = this._defaultrange[i]
				}
				if (Array.isArray(this._range[i])) {
					this._axisDomains[i].range = this._range[i]
				} else {
					this._axisDomains[i].expr = this._range[i]
				}
			}
			elm.select("input[name=expr]").property("value", this._presets[fun].expr)
			this._rpn = construct(this._presets[fun].expr)
		}
		const initDim = (d) => {
			this._d = d
			elm.select("[name=dim]").property("value", d)
			this._defaultrange = []
			for (let i = 0; i < this._d; this._defaultrange[i++] = [0, 10]);
			const an = this._axisNames.slice(0, this._d)
			elm.select("span[name=expr]").text(` f(${['t', ...an].join(',')}) = `)
			for (let i = 0; i < this._axisNames.length; i++) {
				elm.select(`[name=${this._axisNames[i]}]`).style("display", i < this._d ? null : "none")
			}
			this._tf.style("display", this._d === 1 ? null : "none")
			elm.select("[name=number]").property("value", this._n = [100, 500, 500][this._d - 1])
			this.setting.ml.refresh()
			this.setting.vue.$forceUpdate()
		}

		const elm = this.setting.data.configElement
		elm.append("div")
			.text("Dimension")
			.append("input")
			.attr("type", "number")
			.attr("name", "dim")
			.attr("min", 1)
			.attr("max", 3)
			.attr("value", this._d = 1)
			.on("change", () => {
				initDim(+elm.select("[name=dim]").property("value"))
				initValues()
				this._createData()
			})
		const presetElm = elm.append("div")
		this._setPreset = preset => {
			elm.select("[name=preset]").property("value", preset)
			if (this._presets[preset].dim) {
				initDim(this._presets[preset].dim)
			}
			initValues()
			this._createData()
		}
		presetElm.append("span")
			.text("Preset")
		presetElm.append("select")
			.attr("name", "preset")
			.on("change", () => {
				const fun = elm.select("[name=preset]").property("value")
				this._setPreset(fun)
				this.setting.vue.pushHistory()
			})
			.selectAll("option")
			.data(Object.keys(this._presets))
			.enter()
			.append("option")
			.attr("value", d => d)
			.text(d => d)
		elm.append("span")
			.attr("name", "expr")
			.text(" f(t, x) = ")
			.attr("title", exprUsage)
		elm.append("input")
			.attr("type", "text")
			.attr("name", "expr")
			.attr("value", this._presets.linear.expr)
			.attr("title", exprUsage)
			.on("change", () => {
				const expr = elm.select("input[name=expr]").property("value")
				this._rpn = construct(expr)
				this._createData()
			})
		this._rpn = construct(this._presets.linear.expr)
		elm.append("span").text(" Domain ")
		const domainElm = elm.append("div").style("display", "inline-block")
		this._axisDomains = []
		for (let i = 0; i < this._axisNames.length; i++) {
			const name = this._axisNames[i]
			const e = domainElm.append("div")
				.attr("name", name)
			const _this = this
			this._axisDomains[i] = {
				set expr(value) {
					e.select("select").property("value", "func")
					e.selectAll('.axis-domain').style("display", "none")
					e.select('[name=func]').style("display", null)
					e.select("input[name=dep_expr]").property("value", value)
					_this._depRpn[i] = construct(value)
				},
				set range(value) {
					e.select("select").property("value", "range")
					e.selectAll('.axis-domain').style("display", "none")
					e.select('[name=range]').style("display", null)
					e.select('[name=min]').property("value", _this._range[i][0] = value[0])
					e.select('[name=max]').property("value", _this._range[i][1] = value[1])
					_this._depRpn[i] = null
				}
			}
			e.append("select")
				.on("change", () => {
					const t = e.select("select").property("value")
					e.selectAll('.axis-domain').style("display", "none")
					e.select(`[name=${t}]`).style("display", null)
					if (t === "func") {
						const expr = e.select("input[name=dep_expr]").property("value")
						this._depRpn[i] = construct(expr)
					} else {
						this._depRpn[i] = null
						this._range[i][0] = +e.select('[name=min]').property("value")
						this._range[i][1] = +e.select('[name=max]').property("value")
					}
					this._createData()
				})
				.selectAll("option")
				.data(["range", "func"])
				.enter()
				.append("option")
				.attr("value", d => d)
				.text(d => d)
			const re = e.append("span").attr("name", "range").classed("axis-domain", true)
			re.append("input")
				.attr("type", "number")
				.attr("name", 'min')
				.attr("max", 1000)
				.attr("min", -1000)
				.attr("value", 0)
				.on("change", () => {
					this._range[i][0] = +re.select('[name=min]').property("value")
					this._createData()
				})
			re.append("span").text(`<= ${name} <=`)
			re.append("input")
				.attr("type", "number")
				.attr("name", 'max')
				.attr("max", 1000)
				.attr("min", -1000)
				.attr("value", 10)
				.on("change", () => {
					this._range[i][1] = +re.select('[name=max]').property("value")
					this._createData()
				})

			const de = e.append("span").attr("name", "func").style("display", "none")
				.classed("axis-domain", true)
			de.append("span").text(`f(${['t', ...this._axisNames.slice(0, i)].join(',')}) = `)
			de.append("input")
				.attr("type", "text")
				.attr("name", "dep_expr")
				.attr("value", "rand()")
				.on("change", () => {
					const expr = e.select("input[name=dep_expr]").property("value")
					this._depRpn[i] = construct(expr)
					this._createData()
				})
			if (i > 0) {
				e.style("display", "none")
			}
		}
		elm.append("span").text(" Number ")
		elm.append("input")
			.attr("type", "number")
			.attr("name", "number")
			.attr("max", 1000)
			.attr("min", 1)
			.attr("value", 100)
			.on("change", () => {
				this._n = +elm.select("[name=number]").property("value")
				this._createData()
			})
		elm.append("span")
			.text(" Noise ")
		elm.append("input")
			.attr("type", "number")
			.attr("name", "error_scale")
			.attr("step", 0.1)
			.attr("value", 0.1)
			.attr("min", 0)
			.attr("max", 10)
			.on("change", () => {
				this._createData()
			})

		this._tf = this.setting.svg.append("g")
			.classed("true-function", true)
			.append("path")
			.attr("stroke", "blue")
			.attr("stroke-opacity", 0.3)
			.attr("fill-opacity", 0)
		this._createData()
	}

	get series() {
		const s = super.series
		s.values = this._y.map(v => [v])
		return s
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
			return ['RG', 'IN', 'SM', 'TP', 'CP']
		} else {
			return ['RG', 'CF', 'AD', 'DR', 'FS']
		}
	}

	get domain() {
		return this._range
	}

	get preset() {
		const elm = this.setting.data.configElement
		return elm.select("[name=preset]").property("value")
	}

	get params() {
		return {
			preset: this.preset
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
		const errorScale = +elm.select("input[name=error_scale]").property("value")

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
					const v = execute(this._depRpn[k], this._x[i].slice(0, k), i)
					this._x[i][k] = v
					this._range[k][0] = Math.min(this._range[k][0], v)
					this._range[k][1] = Math.max(this._range[k][1], v)
				}
			}
		}

		this._y = this._x.map((x, i) => execute(this._rpn, x, i))

		const p = this._x.map((x, i) => [x, this._y[i]])

		for (let i = 0; i < this._n; i++) {
			this._y[i] += errorScale * Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
		}

		this._manager.waitReady(() => {
			this._manager.platform.render()
			this._renderer._make_selector(this._axisNames.slice(0, this._d))
			this._renderer.render()
			if (this._d === 1) {
				const line = d3.line().x(d => d[0]).y(d => d[1])
				this._tf.attr("d", line(p.map(v => this._renderer.toPoint(v))))
			}
		})
	}

	at(i) {
		return Object.defineProperties({}, {
			x: {
				get: () => this._x[i],
				set: v => {
					this._x[i] = v.slice(0, this._d)
					this._manager.platform.render()
				}
			},
			y: {
				get: () => this._y[i],
				set: v => {
					this._y[i] = v
					this._manager.platform.render()
				}
			},
			point: {
				get: () => this.points[i]
			}
		})
	}

	terminate() {
		super.terminate()
		this.setting.svg.select("g.true-function").remove()
	}
}

