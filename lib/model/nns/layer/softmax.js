import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class SoftmaxLayer extends Layer {
	calc(x) {
		this._o = Matrix.sub(x, x.max(1))
		this._o.map(Math.exp)
		this._o.div(this._o.sum(1))
		return this._o
	}

	grad(bo) {
		this._bi = new Matrix(bo.rows, bo.cols)
		for (let k = 0; k < bo.rows; k++) {
			for (let i = 0; i < bo.cols; i++) {
				const oki = this._o.at(k, i)
				let bki = 0
				for (let j = 0; j < bo.cols; j++) {
					const v = i === j ? 1 - oki : -oki
					bki += this._o.at(k, j) * v * bo.at(k, j)
				}
				this._bi.set(k, i, bki)
			}
		}
		return this._bi
	}
}

SoftmaxLayer.registLayer()
