export default class SlicedInverseRegression {
	// https://www.math.chuo-u.ac.jp/~sugiyama/11/11-05.pdf
	// http://sfb649.wiwi.hu-berlin.de/fedc_homepage/xplore/tutorials/mvahtmlnode116.html
	// https://en.wikipedia.org/wiki/Sliced_inverse_regression
	constructor(s) {
		this._s = s
	}

	predict(x, y, rd = 0) {
		x = Matrix.fromArray(x)
		const n = x.rows
		x.sub(x.mean(0))
		const sgm = x.cov().sqrt().inv()
		x.div(sgm)
		const yi = y.map((v, i) => [v, i])
		yi.sort((a, b) => a[0] - b[0])
		const ymin = yi[0][0]
		const ymax = yi[n - 1][0]
		const sd = (ymax - ymin) / this._s
		const srange = []
		for (let i = 0; i < this._s; i++) {
			srange.push(ymin + sd * i)
		}
		srange.push(Infinity)
		const v = Matrix.zeros(x.cols, x.cols)
		for (let i = 0; i < this._s; i++) {
			const m = Matrix.zeros(1, x.cols)
			for (let k = 0; k < n; k++) {
				if (srange[i] <= yi[k][0] && yi[k][0] < srange[i + 1]) {
					m.add(x.row(yi[k][1]))
				}
			}
			v.add(m.tDot(m))
		}
		v.div(n)

		let w = v.eigenVectors()
		w = sgm.dot(w.resize(w.rows, rd))
		return x.dot(w).toArray()
	}
}
