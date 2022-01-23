import Layer from './base.js'
import Matrix from '../../util/matrix.js'

export default class AddLayer extends Layer {
	calc(...x) {
		this._sizes = x.map(m => m.sizes)
		let m = x[0].copy()
		for (let i = 1; i < x.length; i++) {
			m.add(x[i])
		}
		return m
	}

	grad(bo) {
		const boSize = bo.sizes
		return this._sizes.map(s => {
			const repeats = boSize.map((bs, i) => bs / s[i])
			if (repeats.every(r => r === 1)) {
				return bo
			}
			const m = Matrix.zeros(s[0], s[1])
			for (let i = 0; i < boSize[0]; i++) {
				for (let j = 0; j < boSize[1]; j++) {
					m.addAt(i % s[0], j % s[1], bo.at(i, j))
				}
			}
			return m
		})
	}
}

AddLayer.registLayer()
