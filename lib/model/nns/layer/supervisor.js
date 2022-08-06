import Layer from './base.js'
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

export default class SupervisorLayer extends Layer {
	bind({ supervisor }) {
		if (supervisor instanceof Matrix || supervisor instanceof Tensor) {
			this._o = supervisor
		}
	}

	calc() {
		return this._o
	}

	grad(bo) {}
}

SupervisorLayer.registLayer()
