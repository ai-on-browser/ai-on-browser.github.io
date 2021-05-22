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
	randn: () => Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random()),
	__at: (x, i) => x[i]
}

const consts = {
	pi: Math.PI,
	e: Math.E
}

const tokenTable = [
	...Object.keys(bops),
	...Object.keys(uops),
	'(', ')', ',',
	'[', ']'
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
		} else if (token === '[') {
			stack.push(token)
			lastExpr = false
		} else if (token === ']') {
			while (true) {
				const lt = stack.pop()
				if (!lt) {
					throw 'Invalid parenthesis'
				}
				if (lt === '[') {
					if (funcs[stack[stack.length - 1]]) {
						rpn.push(stack.pop())
					}
					rpn.push('__at')
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
			return x
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

const stringToFunction = e => {
	const rpn = construct(e)
	return x => execute(rpn, x)
}

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
				xh.set(i, k + m + 1, f[k](x[i]))
			}
		}
		return xh
	}

	makeHtml(r) {
		if (!this._e) {
			this._e = r.append("div")
				.attr("id", `ls_model_${this._name}`)
		} else {
			this._e.selectAll("*").remove()
		}
		const createPreset = () => {
			const preset = this._e.select("[name=preset]").property("value")
			this._f.length = 0
			presetElm.selectAll(".ls_params").style("display", "none")
			if (preset === "linear") {
			} else if (preset === "polynomial") {
				polyElm.style("display", null)
				const p = +polyElm.select("[name=p]").property("value")
				if (p > 1) {
					for (let k = 2; k <= p; k++) {
						const cb = combination_repetition(this._platform.datas.dimension, k)
						for (const ptn of cb) {
							const power = Array(this._platform.datas.dimension).fill(0)
							for (const i of ptn) {
								power[i]++
							}
							let e = ""
							let sep = ""
							for (let d = 0; d < power.length; d++) {
								if (power[d] === 1) {
									e += sep + `x[${d}]`
									sep = "*"
								} else if (power[d] > 1) {
									e += sep + `x[${d}]^${power[d]}`
									sep = "*"
								}
							}
							this._f.push(e)
						}
					}
				}
			}
			createTerms()
		}
		const presetElm = this._e.append("div")
		presetElm.append("span").text("preset")
		presetElm.append("select")
			.attr("name", "preset")
			.on("change", createPreset)
			.selectAll("option")
			.data(["linear", "polynomial"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
		const polyElm = presetElm.append("span").classed("ls_params", true)
		polyElm.style("display", "none")
		polyElm.append("span").text(" p ")
		polyElm.append("input")
			.attr("type", "number")
			.attr("name", "p")
			.attr("min", 1)
			.attr("max", 10)
			.attr("value", 2)
			.on("change", createPreset)
	
		const exprs = this._e.append("span")
		const createTerms = () => {
			exprs.selectAll("*").remove()
			exprs.append("span")
				.text(" f(x) = a0")
			for (let d = 0; d < this._platform.datas?.dimension; d++) {
				exprs.append("span")
					.text(` + a${d + 1}*x[${d}]`)
			}
			for (let i = 0; i < this._f.length; i++) {
				exprs.append("span").text(` + a${i + this._platform.datas?.dimension + 1}*`)
				exprs.append("input")
					.attr("type", "text")
					.attr("name", `expr${i}`)
					.attr("value", this._f[i] ||= "x[0] ^ 2")
					.attr("size", 8)
					.on("change", () => {
						this._f[i] = exprs.select(`[name=expr${i}]`).property("value")
					})
				exprs.append("input").attr("type", "button")
					.attr("value", "x")
					.on("click", () => {
						this._f.splice(i, 1)
						createTerms()
					})
			}
			exprs.append("span").text(" ")
			exprs.append("input").attr("type", "button")
				.attr("value", "+")
				.on("click", () => {
					this._f.push(null)
					createTerms()
				})
		}
		createTerms()
	}
}

class LeastSquares {
	// https://ja.wikipedia.org/wiki/%E6%9C%80%E5%B0%8F%E4%BA%8C%E4%B9%97%E6%B3%95
	constructor() {
		this._w = null;
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)

		this._w = x.tDot(x).slove(x.tDot(y));
	}

	predict(x) {
		x = Matrix.fromArray(x)
		return x.dot(this._w).value
	}
}

var dispLeastSquares = function(elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const model = new LeastSquares(basisFunctions.functions)
			model.fit(basisFunctions.apply(tx), ty);

			platform.predict((px, pred_cb) => {
				let pred = model.predict(basisFunctions.apply(px))
				pred_cb(pred);
			}, 2)
		});
	};

	const basisFunctions = new BasisFunctions(platform)
	basisFunctions.makeHtml(elm)

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
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
