import Matrix from '../util/matrix.js'

/**
 * Multi-dimensional Scaling
 */
export default class MDS {
	// http://yuki-koyama.hatenablog.com/entry/2015/07/13/015736
	// https://koh-ta.hatenadiary.org/entry/20110514/1305348816
	// 多次元尺度法概論とそのアルゴリズム (2012) (https://rku.repo.nii.ac.jp/?action=repository_action_common_download&item_id=4942&item_no=1&attribute_id=18&file_no=1)
	// https://en.wikipedia.org/wiki/Multidimensional_scaling
	/**
	 * @param {number | null} [rd] Reduced dimension
	 */
	constructor(rd = null) {
		this._rd = rd
	}

	/**
	 * Returns reduced values.
	 * @param {Array<Array<number>>} x Training data
	 * @param {boolean} [dmat] True if the `x` is distance matrix.
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x, dmat = false) {
		x = Matrix.fromArray(x)
		const d = x.cols
		const n = x.rows
		const rd = this._rd || d
		const D = new Matrix(n, n)
		if (dmat) {
			D.set(0, 0, x)
		} else {
			for (let i = 0; i < n; i++) {
				D.set(i, i, 0)
				for (let j = i + 1; j < n; j++) {
					let s = 0
					for (let k = 0; k < d; k++) {
						s += (x.at(i, k) - x.at(j, k)) ** 2
					}
					D.value[i * n + j] = D.value[j * n + i] = Math.sqrt(s)
				}
			}
		}

		const K = Matrix.map(D, v => v ** 2)
		const mi = K.mean(0)
		const mj = K.mean(1)
		const m = K.mean()
		K.sub(mi)
		K.sub(mj)
		K.add(m)
		K.mult(-0.5)

		const maxIteration = 1.0e5
		const [evalue, evec] = K.eigenJacobi(maxIteration)
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < rd; k++) {
				evec.multAt(i, k, Math.sqrt(evalue[k]))
			}
		}
		return evec.slice(0, rd, 1).toArray()
	}
}
