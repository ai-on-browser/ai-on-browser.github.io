import { PCA } from './pca.js'

export default class PCR {
	constructor() {
		this._pca = new PCA()
		this._rd = 0
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		this._pca.fit(x)
		let xh = this._pca.predict(x, this._rd)
		xh = xh.resize(xh.rows, xh.cols + 1, 1)
		const xtx = xh.tDot(xh)

		this._w = xtx.solve(xh.t).dot(y)
	}

	predict(x) {
		x = Matrix.fromArray(x)
		let xh = this._pca.predict(x, this._rd)
		xh = x.resize(xh.rows, xh.cols + 1, 1)
		return xh.dot(this._w).toArray()
	}
}
