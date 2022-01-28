import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class ConstLayer extends Layer {
	constructor({ value, ...rest }) {
		super(rest)
		this._value = value
	}

	calc() {
		return new Matrix(1, 1, this._value)
	}

	grad(bo) {}

	toObject() {
		return {
			type: 'const',
			value: this._value,
		}
	}
}

ConstLayer.registLayer()
