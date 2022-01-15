import { SDAR } from './sdar.js'

/**
 * Change finder
 *
 * @deprecated Does not work properly
 */
export default class ChangeFinder {
	// 商用利用については要確認
	// http://www.viewcom.or.jp/wp-content/uploads/2018/04/beb9489f9fe1a5e1c81ed8e6c292c942.pdf
	// https://shino-tec.com/2020/02/01/changefinder/
	// https://github.com/shunsukeaihara/changefinder
	/**
	 * @param {number} p
	 * @param {number} r
	 * @param {number} smooth
	 */
	constructor(p = 1, r = 0.5, smooth = 10) {
		this._p = p
		this._r = r
		this._smooth = smooth
		this._t = 2
	}

	_smoothing(x, w) {
		const s = []
		for (let i = 0; i < x.length; i++) {
			let v = 0
			const c = Math.min(i + 1, w)
			for (let k = i; k > i - c; k--) {
				v += x[k]
			}
			s.push(v / c)
		}
		return s
	}

	/**
	 * Fit model.
	 *
	 * @param {number[]} datas
	 */
	fit(datas) {
		const model1 = new SDAR(this._p, this._r)
		const score1 = model1.probability(datas).map(v => -Math.log(v))
		const sscore1 = this._smoothing(score1, this._smooth)

		const model2 = new SDAR(this._p, this._r)
		const score2 = model2.probability(sscore1).map(v => -Math.log(v))
		const sscore2 = this._smoothing(score2, this._smooth * this._t)
		this._score = sscore2
	}

	/**
	 * Returns predicted scores.
	 *
	 * @returns {number[]}
	 */
	predict() {
		return this._score
	}
}
