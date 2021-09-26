import { Matrix } from '../util/math.js'

/**
 * Returns reduced values by Multi Dimensional Scaling.
 * @function
 * @param {Array<Array<number>>} x
 * @param {number} rd
 * @param {boolean} dmat
 * @returns {Array<Array<number>>}
 */
export const MDS = function (x, rd = 1, dmat = false) {
	// http://yuki-koyama.hatenablog.com/entry/2015/07/13/015736
	// https://koh-ta.hatenadiary.org/entry/20110514/1305348816
	// 多次元尺度法概論とそのアルゴリズム (2012) (https://rku.repo.nii.ac.jp/?action=repository_action_common_download&item_id=4942&item_no=1&attribute_id=18&file_no=1)
	// https://en.wikipedia.org/wiki/Multidimensional_scaling
	x = Matrix.fromArray(x)
	const d = x.cols
	const n = x.rows
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

	let K = D.copyMap(v => v ** 2)
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
	return evec.sliceCol(0, rd).toArray()
}
