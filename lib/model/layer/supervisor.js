import Layer from './base.js'

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
