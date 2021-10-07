import Layer from './base.js'

export default class SparseLayer extends Layer {
	constructor({ rho, beta, ...rest }) {
		super(rest)
		this._rho = rho
		this._beta = beta
	}

	bind({ rho }) {
		this._rho = rho || this._rho
	}

	calc(x) {
		this._rho_hat = x.mean(0)
		return x
	}

	grad(bo) {
		const rho_e = this._rho_hat.copyIdiv(-this._rho)
		rho_e.add(this._rho_hat.copyIsub(1).copyIdiv(1 - this._rho))
		rho_e.mult(this._beta)
		return bo.copyAdd(rho_e)
	}
}
