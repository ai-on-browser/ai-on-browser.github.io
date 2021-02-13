import { BaseData } from './base.js'

const exprUsage = `
Variables:
  x: x-axis value
  y: y-axis value (if the dimension is 2)
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
Functions:
  abs: Absolute
  ceil: Ceil
  floor: Floor
  round: Round
  sqrt: Square root
  cbrt: Qubic root
  sin: Sin
  cos: Cosin
  tan: Tangent
  tanh: Hyperbolic tangent
  exp: Exponential
  log: Logarithm
  sign: Sign
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
	'-': new OP('-', 4, v => -v)
}

const bops = {
	'-': new OP('-', 1, (a, b) => a - b),
	'+': new OP('+', 1, (a, b) => a + b),
	'*': new OP('*', 2, (a, b) => a * b),
	'/': new OP('/', 2, (a, b) => a / b),
	'%': new OP('%', 2, (a, b) => a % b),
	'^': new OP('^', 3, (a, b) => a ** b)
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
	tanh: Math.tanh,
	exp: Math.exp,
	log: Math.log,
	sign: Math.sign,
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
		if (token === 'x' || token === 'y') {
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
				throw "Invalid operation."
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

export default class FunctionalData extends BaseData {
	constructor(setting, r) {
		super(setting, r)
		this._n = 100

		this._x = []
		this._y = []
		this._p = []

		this._defaultrange = [[0, 10]]
		this._range = [[0, 10]]
		this._padding = 50

		const _this = this
		this._funcs = {
			linear: {
				expr: "x"
			},
			sin: {
				expr: "sin(x)"
			},
			tanh: {
				expr: "tanh(x)",
				get range() {
					return _this._d === 1 ? [[-5, 5]] : [[-5, 5], [-5, 5]]
				}
			},
			gaussian: {
				get expr() {
					return _this._d === 1 ? "exp(-(x ^ 2) / 2)" : "4 * exp(-(x ^ 2 + y ^ 2) / 2)"
				},
				get range() {
					return _this._d === 1 ? [[-5, 5]] : [[-3, 3], [-3, 3]]
				}
			},
			expdist: {
				expr: "0.5 * exp(-0.5 * x)"
			}
		}

		const initValues = () => {
			const fun = elm.select("[name=function]").property("value")
			this._range = (this._funcs[fun].range || this._defaultrange).map(r => r.concat())
			elm.select("[name=min_x]").property("value", this._range[0][0])
			elm.select("[name=max_x]").property("value", this._range[0][1])
			if (this._d > 1) {
				elm.select("[name=min_y]").property("value", this._range[1][0])
				elm.select("[name=max_y]").property("value", this._range[1][1])
			}
			elm.select("input[name=expr]").property("value", this._funcs[fun].expr)
			this._rpn = construct(this._funcs[fun].expr)
		}

		const elm = this.setting.data.configElement
		elm.append("div")
			.text("Dimension")
			.style("margin-left", "1em")
			.append("input")
			.attr("type", "number")
			.attr("name", "dim")
			.attr("min", 1)
			.attr("max", 2)
			.attr("value", this._d = 1)
			.on("change", () => {
				this._d = +elm.select("[name=dim]").property("value")
				if (this._d === 1) {
					this._defaultrange = [[0, 10]]
					this._tf.style("display", null)
					elm.select("span[name=expr]").text(" f(x) = ")
					elm.select("[name=y]").style("display", "none")
					elm.select("[name=number]").property("value", this._n = 100)
				} else {
					this._defaultrange = [[0, 10], [0, 10]]
					this._tf.style("display", "none")
					elm.select("span[name=expr]").text(" f(x,y) = ")
					elm.select("[name=y]").style("display", null)
					elm.select("[name=number]").property("value", this._n = 500)
				}
				initValues()
				this.setting.ml.refresh()
				this.setting.vue.$forceUpdate()
				this._createData()
			})
		elm.append("span")
			.text("Function")
			.style("margin-left", "1em")
		elm.append("select")
			.attr("name", "function")
			.on("change", () => {
				const fun = elm.select("[name=function]").property("value")
				initValues()
				this._createData()
			})
			.selectAll("option")
			.data(Object.keys(this._funcs))
			.enter()
			.append("option")
			.attr("value", d => d)
			.text(d => d)
		elm.append("span")
			.attr("name", "expr")
			.text(" f(x) = ")
			.attr("title", exprUsage)
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
		for (let i = 0; i < 2; i++) {
			const name = ["x", "y"][i]
			const e = elm.append("span")
				.attr("name", name)
			e.append("input")
				.attr("type", "number")
				.attr("name", `min_${name}`)
				.attr("max", 1000)
				.attr("min", -1000)
				.attr("value", 0)
				.on("change", () => {
					this._range[i][0] = +elm.select(`[name=min_${name}]`).property("value")
					this._createData()
				})
			e.append("span").text(`<= ${name} <=`)
			e.append("input")
				.attr("type", "number")
				.attr("name", `max_${name}`)
				.attr("max", 1000)
				.attr("min", -1000)
				.attr("value", 10)
				.on("change", () => {
					this._range[i][1] = +elm.select(`[name=max_${name}]`).property("value")
					this._createData()
				})
		}
		elm.select("[name=y]").style("display", "none")
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
		const line = d3.line().x(d => d[0]).y(d => d[1])

		this._x = []
		for (let i = 0; i < this._n; i++) {
			if (this._d === 1) {
				this._x.push(this._fitData([i / this._n]))
			} else {
				this._x.push(this._fitData([Math.random(), Math.random()]))
			}
		}

		this._y = this._x.map(x => execute(this._rpn, x))

		const tn = 500
		const tx = []
		for (let i = 0; i < tn; i++) {
			if (this._d === 1) {
				tx.push(this._fitData([i / tn]))
			} else {
				for (let j = 0; j < tn; j++) {
					tx.push(this._fitData([i / tn, j / tn]))
				}
			}
		}
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
		for (let i = 0; i < this._n; i++) {
			if (this._p[i]) {
				this._p[i].at = this._modPlot(this._x[i], this._y[i])
			} else {
				this._p[i] = new DataPoint(this._r, this._modPlot(this._x[i], this._y[i]), 0)
			}
			this._p[i].category = this._d === 1 ? 0 : this._y[i]
		}
		for (let i = this._n; i < this._p.length; i++) {
			this._p[i].remove()
		}
		this._p.length = this._n
		if (this._d === 1) {
			this._tf.attr("d", line(t.map((v, i) => this._modPlot(tx[i], v))))
		}
		this._manager.platform.render && this._manager.platform.render()
	}

	_modPlot(x, y) {
		const width = this._manager.platform.width
		const height = this._manager.platform.height
		const px = (x[0] - this._range[0][0]) / (this._range[0][1] - this._range[0][0]) * width
		let py
		if (this._d === 1) {
			const r = [Math.min(...this._y), Math.max(...this._y)]
			py = (height - this._padding * 2) * (y - r[0]) / (r[1] - r[0]) + this._padding
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
					this._p[i].at = this._modPlot(v[0], this._y[i])
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

	predict(step) {
		if (!Array.isArray(step)) {
			step = [step, step];
		}
		const width = this._manager.platform.width
		const height = this._manager.platform.height
		const rng = this._range
		const tiles = []
		for (let i = 0; i < width + step[0]; i += step[0]) {
			if (this._d === 1) {
				tiles.push(this._fitData([i / width]))
			} else {
				for (let j = 0; j < height + step[1]; j += step[1]) {
					tiles.push(this._fitData([i / width, j / height]))
				}
			}
		}
		const plot = (pred, r) => {
			r.selectAll("*").remove();
			if (this._d === 1) {
				const p = [];
				for (let i = 0; i < pred.length; i++) {
					p.push(this._modPlot(tiles[i], pred[i]))
				}

				const line = d3.line().x(d => d[0]).y(d => d[1])
				r.append("path").attr("stroke", "black").attr("fill-opacity", 0).attr("d", line(p));
			} else {
				let c = 0;
				const p = [];
				for (let i = 0, w = 0; w < width + step[0]; i++, w += step[0]) {
					for (let j = 0, h = 0; h < height + step[1]; j++, h += step[1]) {
						if (!p[j]) p[j] = [];
						p[j][i] = pred[c++];
					}
				}

				const t = r.append("g").attr("opacity", 0.5)
				new DataHulls(t, p, step, true);
			}
		}
		return [tiles, plot]
	}

	terminate() {
		super.terminate()
		this.setting.svg.select("g.true-function").remove()
	}
}

