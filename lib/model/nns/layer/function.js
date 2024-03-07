import Layer from './base.js'

/**
 * Function layer
 */
export default class FunctionLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {string} config.func Function
	 */
	constructor({ func, ...rest }) {
		super(rest)
		this._func = func
		this._exc = stringToFunction(this._func)
	}

	calc(x, y) {
		const o = x.copy()
		this._unary = !y
		if (this._unary) {
			o.map(v => this._exc({ x: v }))
			this._g = o.copy()
			this._g.map(v => v.gx)
		} else {
			o.broadcastOperate(y, (a, b) => this._exc({ x: a, y: b }))
			this._gx = o.copy()
			this._gx.map(v => v.gx)
			this._gy = o.copy()
			this._gy.map(v => v.gy)
		}
		o.map(v => v.v)
		return o
	}

	grad(bo) {
		if (this._unary) {
			const bi = bo.copy()
			bi.broadcastOperate(this._g, (a, b) => a * b)
			return bi
		} else {
			const bx = bo.copy()
			bx.broadcastOperate(this._gx, (a, b) => a * b)
			const by = bo.copy()
			by.broadcastOperate(this._gy, (a, b) => a * b)
			return [bx, by]
		}
	}

	toObject() {
		return {
			type: 'function',
			func: this._func,
		}
	}
}

FunctionLayer.registLayer()

class OP {
	constructor(name, priority, func, grad) {
		this.name = name
		this.p = priority
		this.f = func
		this.g = grad
	}

	get length() {
		return this.f.length
	}
}

const uops = {
	'+': new OP(
		'+',
		4,
		v => v,
		(v, g) => g
	),
	'-': new OP(
		'-',
		4,
		v => -v,
		(v, g) => -g
	),
}

const bops = {
	'-': new OP(
		'-',
		1,
		(a, b) => a - b,
		(va, vb, ga, gb) => ga - gb
	),
	'+': new OP(
		'+',
		1,
		(a, b) => a + b,
		(va, vb, ga, gb) => ga + gb
	),
	'*': new OP(
		'*',
		2,
		(a, b) => a * b,
		(va, vb, ga, gb) => va * gb + ga * vb
	),
	'/': new OP(
		'/',
		2,
		(a, b) => a / b,
		(va, vb, ga, gb) => (ga * vb - va * gb) / vb ** 2
	),
	'**': new OP(
		'**',
		3,
		(a, b) => a ** b,
		(va, vb, ga, gb) => va ** vb * ((gb === 0 ? 0 : gb * Math.log(va)) + vb * (ga / va))
	),
}

const funcs = {
	abs: { f: Math.abs, g: (v, g) => (v < 0 ? -g : g) },
	acos: { f: Math.acos, g: (v, g) => -g / (Math.sqrt(1 - v ** 2) + 1.0e-4) },
	acosh: { f: Math.acosh, g: (v, g) => g / (Math.sqrt(v ** 2 - 1) + 1.0e-4) },
	asin: { f: Math.asin, g: (v, g) => g / (Math.sqrt(1 - v ** 2) + 1.0e-4) },
	asinh: { f: Math.asinh, g: (v, g) => g / Math.sqrt(1 + v ** 2) },
	atan: { f: Math.atan, g: (v, g) => g / (1 + v ** 2) },
	atanh: { f: Math.atanh, g: (v, g) => g / (1 - v ** 2) },
	cbrt: { f: Math.cbrt, g: (v, g) => g / (3 * Math.cbrt(v) ** 2) },
	cos: { f: Math.cos, g: (v, g) => -g * Math.sin(v) },
	cosh: { f: Math.cosh, g: (v, g) => g * Math.sinh(v) },
	exp: { f: Math.exp, g: (v, g) => g * Math.exp(v) },
	log: { f: Math.log, g: (v, g) => g / v },
	log10: { f: Math.log10, g: (v, g) => g / (v * Math.LN10) },
	log2: { f: Math.log2, g: (v, g) => g / (v * Math.LN2) },
	max: { f: Math.max, g: (va, vb, ga, gb) => (va >= vb ? ga : gb) },
	min: { f: Math.min, g: (va, vb, ga, gb) => (va <= vb ? ga : gb) },
	sin: { f: Math.sin, g: (v, g) => g * Math.cos(v) },
	sinh: { f: Math.sinh, g: (v, g) => g * Math.cosh(v) },
	sqrt: { f: Math.sqrt, g: (v, g) => g / (2 * Math.sqrt(v)) },
	tan: { f: Math.tan, g: (v, g) => g / Math.cos(v) ** 2 },
	tanh: { f: Math.tanh, g: (v, g) => g * (1 - Math.tanh(v) ** 2) },
}

const consts = {
	e: Math.E,
	ln2: Math.LN2,
	ln10: Math.LN10,
	log2e: Math.LOG2E,
	log10e: Math.LOG10E,
	pi: Math.PI,
	sqrt1_2: Math.SQRT1_2,
	sqrt2: Math.SQRT2,
}

const tokenTable = [...Object.keys(bops), ...Object.keys(uops), '(', ')', ',', '[', ']']
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
		if (consts[token]) {
			rpn.push(consts[token])
			lastExpr = true
		} else if (funcs[token]) {
			stack.push(token)
			lastExpr = false
		} else if (uops[token] || bops[token]) {
			if ((lastExpr && !bops[token]) || (!lastExpr && !uops[token])) {
				throw new Error(`Invalid operation '${token}'.`)
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
					throw new Error('Invalid parenthesis')
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
					throw new Error('Invalid parenthesis')
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
		} else if (Number.isFinite(+token)) {
			rpn.push(+token)
			lastExpr = true
		} else {
			rpn.push(token)
			lastExpr = true
		}
	}

	while (stack.length > 0) {
		rpn.push(stack.pop())
	}
	return rpn
}

const execute = (rpn, env) => {
	const n = rpn.length
	let k = n - 1

	const calc = () => {
		const token = rpn[k--]
		if (typeof token === 'number') {
			return { v: token, gx: 0, gy: 0 }
		} else if (Object.hasOwn(env, token)) {
			if (token === 'x') {
				return { v: env[token], gx: 1, gy: 0 }
			} else if (token === 'y') {
				return { v: env[token], gx: 0, gy: 1 }
			}
		}
		if (token instanceof OP) {
			const args = []
			for (let i = 0; i < token.length; i++) {
				args.unshift(calc())
			}
			const v = token.f(...args.map(v => v.v))
			const gx = token.g(...args.map(v => v.v), ...args.map(v => v.gx))
			const gy = token.g(...args.map(v => v.v), ...args.map(v => v.gy))
			return { v, gx, gy }
		}
		if (funcs[token]) {
			const an = funcs[token].f.length
			const args = []
			for (let i = 0; i < an; i++) {
				args.unshift(calc())
			}
			const v = funcs[token].f(...args.map(v => v.v))
			const gx = funcs[token].g(...args.map(v => v.v), ...args.map(v => v.gx))
			const gy = funcs[token].g(...args.map(v => v.v), ...args.map(v => v.gy))
			return { v, gx, gy }
		}
		throw new Error(`Invalid token '${token}'.`)
	}
	const ans = calc()
	if (k !== -1) {
		throw new Error('Invalid expression.')
	}
	return ans
}

const stringToFunction = e => {
	const rpn = construct(e)
	return env => execute(rpn, env)
}
