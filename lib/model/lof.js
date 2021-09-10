export default class LOF {
	constructor(k) {
		this._k = k
	}

	set k(value) {
		this._k = value
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	predict(datas) {
		const distances = []
		const s_distances = []
		for (let i = 0; i < datas.length; i++) {
			distances[i] = []
			s_distances[i] = []
			distances[i][i] = 0
			s_distances[i][i] = [0, i]
			for (let j = 0; j < i; j++) {
				const d = this._distance(datas[i], datas[j])
				distances[i][j] = distances[j][i] = d
				s_distances[i][j] = [d, j]
				s_distances[j][i] = [d, i]
			}
		}
		s_distances.forEach(s => s.sort((a, b) => a[0] - b[0]))
		const nears = a => s_distances[a].slice(1, 1 + this._k)
		const k_distance = p => s_distances[p][this._k][0]
		const reachability_distance = (a, b) => Math.max(k_distance(b), distances[a][b])
		const lrd = a => 1 / (nears(a).reduce((acc, b) => acc + reachability_distance(a, b[1]), 0) / this._k)
		const lof = a => nears(a).reduce((acc, b) => acc + lrd(b[1]), 0) / this._k / lrd(a)

		return datas.map((p, i) => lof(i))
	}
}
