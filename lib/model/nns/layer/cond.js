import Layer from './base.js'

export default class CondLayer extends Layer {
	calc(...x) {
		this._cond = x[0]
		const t = x[1]
		const f = x[2]
		this._o = this._cond.copy()
		this._o.map((v, i) => (v ? t.at(i) : f.at(i)))
		return this._o
	}

	grad(bo) {
		const bi = [null, bo.copy(), bo.copy()]
		this._cond.forEach((v, i) => (v ? bi[2].set(i, 0) : bi[1].set(i, 0)))
		return bi
	}
}

CondLayer.registLayer()
