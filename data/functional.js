import { MultiDimensionalData } from './base.js'

const exprUsage = `
Variables:
  x: x-axis value
  y: y-axis value (if the dimension is greater than 1)
  z: z-axis value (if the dimension is greater than 2)
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
	rand: Math.random
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
		if (['x', 'y', 'z'].indexOf(token) >= 0) {
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
				if (lt instanceof OP && lt.p > op.p) {
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

const execute = (rpn, x) => {
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
	constructor(setting, r) {
		super(setting, r)
		this._n = 100

		this._x = []
		this._y = []
		this._p = []

		this._defaultrange = [[0, 10]]
		this._range = [[0, 10]]
		this._padding = [10, 10]

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
			}
		}

		const initValues = () => {
			const fun = elm.select("[name=preset]").property("value")
			this._range = (this._presets[fun].range || this._defaultrange).map(r => r.concat())
			for (let i = 0; i < this._d; i++) {
				elm.select("[name=" + this._axisNames[i] + "] [name=min]").property("value", this._range[i][0])
				elm.select("[name=" + this._axisNames[i] + "] [name=max]").property("value", this._range[i][1])
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
			elm.select("span[name=expr]").text(` f(${an.join(',')}) = `)
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
			.style("margin-left", "1em")
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
		presetElm.append("span")
			.text("Preset")
			.style("margin-left", "1em")
		presetElm.append("select")
			.attr("name", "preset")
			.on("change", () => {
				const fun = elm.select("[name=preset]").property("value")
				if (this._presets[fun].dim) {
					initDim(this._presets[fun].dim)
				}
				initValues()
				this._createData()
			})
			.selectAll("option")
			.data(Object.keys(this._presets))
			.enter()
			.append("option")
			.attr("value", d => d)
			.text(d => d)
		elm.append("span")
			.attr("name", "expr")
			.text(" f(x) = ")
			.attr("title", exprUsage)
			.style("margin-left", "1em")
		elm.append("input")
			.attr("type", "text")
			.attr("name", "expr")
			.attr("value", "x")
			.attr("title", exprUsage)
			.on("change", () => {
				const expr = elm.select("input[name=expr]").property("value")
				this._rpn = construct(expr)
				this._createData()
			})
		this._rpn = construct("x")
		elm.append("span").text(" Domain ")
		const domainElm = elm.append("div").style("display", "inline-block")
		for (let i = 0; i < this._axisNames.length; i++) {
			const name = this._axisNames[i]
			const e = domainElm.append("div")
				.attr("name", name)
			if (i > 0) {
				e.append("select")
					.on("change", () => {
						const t = e.select("select").property("value")
						if (t === "func") {
							e.select('[name=range]').style("display", "none")
							e.select('[name=func]').style("display", null)
							const expr = e.select("input[name=dep_expr]").property("value")
							const rpn = construct(expr)
							this._depRpn[i] = rpn
						} else {
							e.select('[name=range]').style("display", null)
							e.select('[name=func]').style("display", "none")
							this._depRpn[i] = null
						}
						this._createData()
					})
					.selectAll("option")
					.data(["range", "func"])
					.enter()
					.append("option")
					.attr("value", d => d)
					.text(d => d)
			}
			const re = e.append("span").attr("name", "range")
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
			if (i > 0) {
				e.style("display", "none")

				const de = e.append("span").attr("name", "func").style("display", "none")
				de.append("span").text(`f(${this._axisNames.slice(0, i).join(',')}) = `)
				de.append("input")
					.attr("type", "text")
					.attr("name", "dep_expr")
					.attr("value", "x + rand()")
					.on("change", () => {
						const expr = e.select("input[name=dep_expr]").property("value")
						const rpn = construct(expr)
						this._depRpn[i] = rpn
						this._createData()
					})
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

		this._tf = this.setting.svg.append("g")
			.classed("true-function", true)
			.append("path")
			.attr("stroke", "blue")
			.attr("stroke-opacity", 0.3)
			.attr("fill-opacity", 0)
		this._createData()
	}

	get series() {
		return this._p.map(p => [p.at[1]])
	}

	get availTask() {
		if (this._d === 1) {
			return ['RG', 'IN', 'SM', 'TP', 'CP']
		} else {
			return ['RG']
		}
	}

	get domain() {
		return this._range
	}

	_fitData(x) {
		return x.map((v, i) => v * (this._range[i][1] - this._range[i][0]) + this._range[i][0])
	}

	_createData() {
		const elm = this.setting.data.configElement

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
		for (let k = 1; k < this._d; k++) {
			if (this._depRpn[k]) {
				this._range[k] = [Infinity, -Infinity]
				for (let i = 0; i < this._n; i++) {
					const v = execute(this._depRpn[k], this._x[i].slice(0, k))
					this._x[i][k] = v
					this._range[k][0] = Math.min(this._range[k][0], v)
					this._range[k][1] = Math.max(this._range[k][1], v)
				}
			}
		}

		this._y = this._x.map(x => execute(this._rpn, x))

		const tn = 100
		const tx = []
		const tp = Array(this._d).fill(0)
		do {
			tx.push(this._fitData(tp.map(v => v / tn)))
			for (let i = 0; i < this._d; i++) {
				tp[i]++
				if (tp[i] < tn) break
				tp[i] = 0
			}
		} while (tp.reduce((s, v) => s + v, 0) > 0);
		const t = tx.map(v => execute(this._rpn, v))

		let t_max = -Infinity
		let t_min = Infinity
		for (let i = 0; i < t.length; i++) {
			t_max = Math.max(t[i], t_max)
			t_min = Math.min(t[i], t_min)
		}
		const s = Math.min(0.5, (t_max - t_min) / 4)
		for (let i = 0; i < this._n; i++) {
			this._y[i] += (Math.random() - 0.5) * (Math.random()) * s * 2
		}
		if (this._d === 1) {
			const line = d3.line().x(d => d[0]).y(d => d[1])
			this._tf.attr("d", line(t.map((v, i) => this._modPlot(tx[i], v))))
		}
		this._manager.platform.render && this._manager.platform.render()
		this._make_selector(this._axisNames.slice(0, this._d))
		this._plot()
	}

	_modPlot(x, y) {
		const width = this._manager.platform.width
		const height = this._manager.platform.height
		const px = (x[0] - this._range[0][0]) / (this._range[0][1] - this._range[0][0]) * width
		let py
		if (this._d === 1) {
			const r = [Math.min(...this._y), Math.max(...this._y)]
			py = (height - this._padding[1] * 2) * (y - r[0]) / (r[1] - r[0]) + this._padding[1]
		} else {
			py = (x[1] - this._range[1][0]) / (this._range[1][1] - this._range[1][0]) * height
		}
		return [px, py]
	}

	at(i) {
		return Object.defineProperties({}, {
			x: {
				get: () => this._x[i],
				set: v => {
					this._x[i] = v.slice(0, this._d)
					this._p[i].at = this._modPlot(v, this._y[i])
				}
			},
			y: {
				get: () => this._y[i],
				set: v => {
					this._p[i].category = v
				}
			},
			point: {
				get: () => this._p[i]
			}
		})
	}

	terminate() {
		super.terminate()
		this.setting.svg.select("g.true-function").remove()
	}
}

