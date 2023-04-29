import Layer from './base.js'
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

/**
 * Supervisor layer
 */
export default class SupervisorLayer extends Layer {
	bind({ supervisor }) {
		if (Array.isArray(supervisor)) {
			this._o = Tensor.fromArray(supervisor)
			if (this._o.dimension === 2) {
				this._o = this._o.toMatrix()
			}
		} else if (supervisor instanceof Matrix || supervisor instanceof Tensor) {
			this._o = supervisor
		}
	}

	calc() {
		return this._o
	}

	grad() {}
}

SupervisorLayer.registLayer()
