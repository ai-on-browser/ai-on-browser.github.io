import { Matrix } from '../util/math.js'

const RandomProjection = function (x, rd = 0, init = 'uniform') {
	// https://daily.belltail.jp/?p=737
	x = Matrix.fromArray(x)
	let w
	const d = rd <= 0 ? x.cols : rd
	if (init === 'root3') {
		// Random projection in dimensionality reduction: Applications to image and text data
		w = Matrix.zeros(x.cols, d)
		const r3 = Math.sqrt(3)
		for (let i = 0; i < w.length; i++) {
			const r = Math.random()
			if (r < 1 / 6) {
				w.value[i] = r3
			} else if (r < 1 / 3) {
				w.value[i] = -r3
			}
		}
	} else if (init === 'normal') {
		w = Matrix.randn(x.cols, d)
	} else {
		w = Matrix.random(x.cols, d, -1, 1)
	}
	return x.dot(w).toArray()
}

export default RandomProjection
