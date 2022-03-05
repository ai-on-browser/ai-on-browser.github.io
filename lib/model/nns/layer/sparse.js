import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

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
		const rho_e = Matrix.div(-this._rho, this._rho_hat)
		rho_e.add(Matrix.div(1 - this._rho, Matrix.sub(1, this._rho_hat)))
		rho_e.mult(this._beta)
		return Matrix.add(bo, rho_e)
	}

	toObject() {
		return {
			type: 'sparsity',
			rho: this._rho,
			beta: this._beta,
		}
	}
}

SparseLayer.registLayer('sparsity')
