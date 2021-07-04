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
		if (consts[token]) {
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
		if (typeof rpn[k] === 'number') {
			return rpn[k--]
		} else if (env.hasOwnProperty(rpn[k])) {
			return env[rpn[k--]]
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
	return env => execute(rpn, env)
}

export default stringToFunction
