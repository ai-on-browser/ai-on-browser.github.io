import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class ArgmaxLayer extends Layer {
	calc(x) {
		this._i = x
		this._o = this._i.argmax(1)
		return this._o
	}

	grad(bo) {
		this._bo = new Matrix(this._i.rows, this._i.cols)
		for (let j = 0; j < this._i.cols; j++) {
			this._bo.set(0, j, bo.copyMult(j))
		}
		const o = this._i.copy()
		o.sub(o.max(1))
		o.map(Math.exp)
		o.div(o.sum(1))
		this._bi = new Matrix(this._i.rows, this._i.cols)
		for (let k = 0; k < this._bo.rows; k++) {
			for (let i = 0; i < this._bo.cols; i++) {
				const oki = o.at(k, i)
				let bki = 0
				for (let j = 0; j < this._bo.cols; j++) {
					const v = i === j ? 1 - oki : -oki
					bki += o.at(k, j) * v * this._bo.at(k, j)
				}
				this._bi.set(k, i, bki)
			}
		}
		return this._bi
	}
}

ArgmaxLayer.registLayer()
