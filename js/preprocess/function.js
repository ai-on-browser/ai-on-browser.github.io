import Matrix from '../../lib/util/matrix.js'
import stringToFunction from '../expression.js'

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

export default class FunctionPreprocessor {
	constructor(manager) {
		this._manager = manager
		this._f = []

		this.init()
	}

	get functions() {
		return this._f.map(expr => stringToFunction(expr))
	}

	init() {
		if (!this._r) {
			const elm = this._manager.setting.preprocess.configElement
			this._r = document.createElement('div')
			elm.append(this._r)
		} else {
			this._r.replaceChildren()
		}
		const createPreset = () => {
			const dim = this._manager.datas.dimension
			const preset = presets.value
			this._f.length = 0
			presetElm.querySelectorAll('.ls_params').forEach(elm => (elm.style.display = 'none'))
			if (preset === 'default') {
				for (let d = 0; d < dim; d++) {
					this._f.push(`x[${d}]`)
				}
			} else if (preset === 'polynomial') {
				polyElm.style.display = null
				this._f.push('1')
				const p = +polyp.value
				if (p >= 0) {
					for (let k = 0; k <= p; k++) {
						const cb = combination_repetition(dim, k)
						for (const ptn of cb) {
							const power = Array(dim).fill(0)
							for (const i of ptn) {
								power[i]++
							}
							let e = ''
							let sep = ''
							for (let d = 0; d < power.length; d++) {
								if (power[d] === 1) {
									e += `${sep}x[${d}]`
									sep = '*'
								} else if (power[d] > 1) {
									e += `${sep}x[${d}]^${power[d]}`
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
		const presetElm = document.createElement('div')
		presetElm.onchange = createPreset
		this._r.append(presetElm)
		const presets = document.createElement('select')
		for (const preset of ['default', 'polynomial']) {
			const opt = document.createElement('option')
			opt.value = opt.innerText = preset
			presets.append(opt)
		}
		presetElm.append('preset', presets)
		const polyElm = document.createElement('span')
		presetElm.append(polyElm)
		polyElm.classList.add('ls_params')
		polyElm.style.display = 'none'

		const polyp = document.createElement('input')
		polyp.type = 'number'
		polyp.min = 0
		polyp.max = 10
		polyp.value = 2
		polyp.onchange = createPreset
		polyElm.append(' p ', polyp)

		const dim = this._manager.datas.dimension
		for (let d = 0; d < dim; d++) {
			this._f.push(`x[${d}]`)
		}
		const exprs = document.createElement('span')
		this._r.append(exprs)
		exprs.classList.add('expr-list')
		const createTerms = () => {
			exprs.replaceChildren('f(x) =')
			for (let i = 0; i < this._f.length; i++) {
				const ei = document.createElement('input')
				ei.type = 'text'
				ei.value = this._f[i] ||= 'x[0] ^ 2'
				ei.size = 8
				ei.onchange = () => (this._f[i] = ei.value)
				const eb = document.createElement('span')
				eb.classList.add('trash')
				eb.onclick = () => {
					this._f.splice(i, 1)
					createTerms()
				}
				const coef = document.createElement('span')
				const sub = document.createElement('sub')
				sub.innerText = i
				coef.append('a', sub)

				const expr = document.createElement('span')
				expr.append(i === 0 ? '' : '+ ', coef, '\u2217', ei, eb)
				expr.classList.add('expr')
				exprs.append(expr)
			}
			const expadd = document.createElement('input')
			expadd.type = 'button'
			expadd.value = '+'
			expadd.onclick = () => {
				this._f.push(null)
				createTerms()
			}
			exprs.append(' ', expadd)
		}
		createTerms()
	}

	apply(x) {
		const n = x.length
		const f = this.functions

		const xh = new Matrix(n, f.length)
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < f.length; k++) {
				xh.set(i, k, f[k]({ x: x[i] }))
			}
		}
		return xh.toArray()
	}

	terminate() {
		this._r?.remove()
	}
}
