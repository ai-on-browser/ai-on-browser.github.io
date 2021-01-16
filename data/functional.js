import { BaseData } from './base.js'

const exprUsage = `
Variables:
  x: x-axis value
Constants:
  pi: PI
  e: E
Operations:
  +: Add
  -: Subtract
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

const ops = {
	'-': 1,
	'+': 1,
	'*': 2,
	'/': 2,
	'%': 2,
	'^': 3
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
	...Object.keys(ops),
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
	for (const token of tokens) {
		if (token === 'x') {
			rpn.push(token)
		} else if (consts[token]) {
			rpn.push(consts[token])
		} else if (funcs[token]) {
			stack.push(token)
		} else if (ops[token]) {
			while (true) {
				const lt = stack[stack.length - 1]
				if (ops[lt] && ops[lt] > ops[token]) {
					rpn.push(stack.pop())
				} else {
					break
				}
			}
			stack.push(token)
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
		} else if (token === '(') {
			stack.push(token)
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
		} else {
			rpn.push(+token)
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
			return x
		}
		const f = rpn[k--]
		switch (f) {
		case '+':
			return calc() + calc()
		case '-':
			const sa = calc()
			return calc() - sa
		case '*':
			return calc() * calc()
		case '/':
			const da = calc()
			return calc() / da
		case '%':
			const ma = calc()
			return calc() % ma
		case '^':
			const p = calc()
			return Math.pow(calc(), p)
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

		this._defaultrange = [0, 10]
		this._range = [0, 10]
		this._padding = 50

		this._funcs = {
			linear: {
				f: v => v
			},
			sin: {
				f: Math.sin
			},
			tanh: {
				f: Math.tanh,
				range: [-5, 5]
			},
			gaussian: {
				f: v => Math.exp(-(v ** 2) / 2),
				range: [-5, 5]
			},
			manual: {
				f: v => execute(this._rpn, v),
			}
		}

		const elm = this.setting.data.configElement
		elm.append("span")
			.text("Function")
			.style("margin-left", "1em")
		elm.append("select")
			.attr("name", "function")
			.on("change", () => {
				const fun = elm.select("[name=function]").property("value")
				this._range = [].concat(this._funcs[fun].range || this._defaultrange)
				elm.select("[name=min]").property("value", this._range[0])
				elm.select("[name=max]").property("value", this._range[1])
				elm.select("span.expr").style("display", fun === "manual" ? "inline" : "none")
				this._createData()
			})
			.selectAll("option")
			.data(Object.keys(this._funcs))
			.enter()
			.append("option")
			.attr("value", d => d)
			.text(d => d)
		elm.append("span")
			.classed("expr", true)
			.style("display", "none")
			.text(" f(x) = ")
			.attr("title", exprUsage)
			.append("input")
			.attr("type", "text")
			.attr("name", "expr")
			.attr("value", "0.1 * x ^ 2 + sin(x)")
			.on("change", () => {
				const expr = elm.select("input[name=expr]").property("value")
				this._rpn = construct(expr)
				this._createData()
			})
		this._rpn = construct("0.1 * x ^ 2 + sin(x)")
		elm.append("span").text(" Domain ")
		elm.append("input")
			.attr("type", "number")
			.attr("name", "min")
			.attr("max", 1000)
			.attr("min", -1000)
			.attr("value", 0)
			.on("change", () => {
				this._range[0] = +elm.select("[name=min]").property("value")
				this._createData()
			})
		elm.append("span").text(" - ")
		elm.append("input")
			.attr("type", "number")
			.attr("name", "max")
			.attr("max", 1000)
			.attr("min", -1000)
			.attr("value", 10)
			.on("change", () => {
				this._range[1] = +elm.select("[name=max]").property("value")
				this._createData()
			})
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
		return ['RG', 'IN', 'SM', 'TP', 'CP']
	}

	get domain() {
		return [this._range]
	}

	_createData() {
		const elm = this.setting.data.configElement
		const fun = elm.select("[name=function]").property("value")
		const line = d3.line().x(d => d[0]).y(d => d[1])

		this._x = []
		for (let i = 0; i < this._n; i++) {
			this._x.push([i / this._n * (this._range[1] - this._range[0]) + this._range[0]])
		}

		const tn = 500
		const tx = []
		for (let i = 0; i < tn; i++) {
			tx.push(i / tn * (this._range[1] - this._range[0]) + this._range[0])
		}
		const t = tx.map(this._funcs[fun].f)

		this._y = this._x.map(x => this._funcs[fun].f(x[0]))

		const s = (Math.max(...t) - Math.min(...t)) / 4
		for (let i = 0; i < this._n; i++) {
			this._y[i] += (Math.random() - 0.5) * (Math.random()) * s * 2
		}
		for (let i = 0; i < this._n; i++) {
			if (this._p[i]) {
				this._p[i].at = this._modPlot(this._x[i][0], this._y[i])
			} else {
				this._p.push(new DataPoint(this._r, this._modPlot(this._x[i][0], this._y[i]), 0))
			}
		}
		for (let i = this._n; i < this._p.length; i++) {
			this._p[i].remove()
		}
		this._p.length = this._n
		this._tf.attr("d", line(t.map((v, i) => this._modPlot(tx[i], v))))
		this._manager.platform.render && this._manager.platform.render()
	}

	_modPlot(...v) {
		const width = this._manager.platform.width
		const height = this._manager.platform.height
		const r = [Math.min(...this._y), Math.max(...this._y)]
		const y = (height - this._padding * 2) * (v[1] - r[0]) / (r[1] - r[0]) + this._padding
		const x = (v[0] - this._range[0]) / (this._range[1] - this._range[0]) * width
		return [x, y]
	}

	at(i) {
		return Object.defineProperties({}, {
			x: {
				get: () => this._x[i],
				set: v => {
					this._x[i] = [v[0]]
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
		const max = this.domain.map(r => r[1])
		const tiles = [];
		for (let i = 0; i < width + step[0]; i += step[0]) {
			tiles.push([i / width * (this._range[1] - this._range[0]) + this._range[0]]);
		}
		const plot = (pred, r) => {
			r.selectAll("*").remove();
			const p = [];
			for (let i = 0; i < pred.length; i++) {
				p.push(this._modPlot(tiles[i], pred[i]))
			}

			const line = d3.line().x(d => d[0]).y(d => d[1])
			r.append("path").attr("stroke", "black").attr("fill-opacity", 0).attr("d", line(p));
		}
		return [tiles, plot]
	}

	terminate() {
		super.terminate()
		this.setting.svg.select("g.true-function").remove()
	}
}

