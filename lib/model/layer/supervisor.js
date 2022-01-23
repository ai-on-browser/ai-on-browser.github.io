import Layer from './base.js'
import Matrix from '../../util/matrix.js'

export default class SupervisorLayer extends Layer {
	bind({ supervisor }) {
		if (supervisor instanceof Matrix) {
			this._o = supervisor
		}
	}

	calc() {
		return this._o
	}

	grad(bo) {}
}

SupervisorLayer.registLayer()
