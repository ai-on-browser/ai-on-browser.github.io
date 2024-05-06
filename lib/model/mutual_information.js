import Histogram from './histogram.js'

/**
 * Mutual information feature selector
 */
export default class MutualInformationFeatureSelection {
	// https://qiita.com/shimopino/items/5fee7504c7acf044a521
	// https://qiita.com/hyt-sasaki/items/ffaab049e46f800f7cbf
	/**
	 * @param {number} k Number of selected features
	 */
	constructor(k) {
		this._k = k
		this._bins = 40
	}

	_mutual_information(a, b) {
		const histogram = new Histogram({ count: this._bins })
		const ha = histogram.fit(a)
		const hb = histogram.fit(b)
		const hab = histogram.fit(a.map((v, i) => [v[0], b[i][0]]))
		const na = a.length,
			nb = b.length
		let v = 0
		for (let i = 0; i < ha.length; i++) {
			for (let j = 0; j < hb.length; j++) {
				if (hab[i][j] > 0 && ha[i] > 0 && hb[j] > 0) {
					const pab = hab[i][j] / na
					const pa = ha[i] / na
					const pb = hb[j] / nb
					v += pab * Math.log(pab / (pa * pb))
				}
			}
		}
		return v / na
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		const imp = []
		for (let i = 0; i < x[0].length; i++) {
			const a = x.map(v => [v[i]])
			imp.push(this._mutual_information(a, y))
		}
		this._importance = imp.map((v, i) => [v, i])
		this._importance.sort((a, b) => b[0] - a[0])
	}

	/**
	 * Returns feature selected values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		const impidx = this._importance.slice(0, this._k).map(im => im[1])
		return x.map(d => impidx.map(i => d[i]))
	}
}
