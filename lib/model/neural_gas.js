import { KMeans } from './kmeans.js'

export default class NeuralGas extends KMeans {
	// https://en.wikipedia.org/wiki/Neural_gas
	constructor(l = 1, m = 0.99) {
		super()
		this._l = l
		this._eps = 1
		this._epoch = 0
		this._sample_rate = 0.8
		this._m = m
	}

	move(model, centroids, datas) {
		const x = datas.filter(v => Math.random() < this._sample_rate)
		this._epoch++
		const cvec = centroids
		const distances = x.map(v => {
			let ds = cvec.map((c, i) => [i, this._distance(v, c)])
			ds.sort((a, b) => a[1] - b[1])
			ds = ds.map((d, k) => [d[0], d[1], k])
			ds.sort((a, b) => a[0] - b[0])
			return ds
		})
		this._l *= this._m
		return cvec.map((c, n) => {
			const update = Array(x[0].length).fill(0)
			for (let i = 0; i < x.length; i++) {
				for (let j = 0; j < x[i].length; j++) {
					update[j] += (x[i][j] - c[j]) * this._eps * Math.exp(-distances[i][n][2] / this._l)
				}
			}
			return update.map((v, i) => c[i] + v / x.length)
		})
	}
}
