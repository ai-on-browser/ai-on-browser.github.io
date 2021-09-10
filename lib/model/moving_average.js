export const simpleMovingAverage = (data, n) => {
	// https://ja.wikipedia.org/wiki/%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87
	const p = []
	const d = data[0].length
	for (let i = 0; i < data.length; i++) {
		const t = Math.min(n, i + 1)
		p[i] = Array(d).fill(0)
		for (let k = i - t + 1; k <= i; k++) {
			for (let j = 0; j < d; j++) {
				p[i][j] += data[k][j]
			}
		}
		for (let j = 0; j < d; j++) {
			p[i][j] /= t
		}
	}
	return p
}

export const linearWeightedMovingAverage = (data, n) => {
	const p = []
	const d = data[0].length
	for (let i = 0; i < data.length; i++) {
		const m = Math.max(0, i - n + 1)
		const v = Array(d).fill(0)
		let s = 0
		for (let k = m; k <= i; k++) {
			for (let j = 0; j < d; j++) {
				v[j] += (k - m + 1) * data[k][j]
			}
			s += k - m + 1
		}
		p.push(v.map(a => a / s))
	}
	return p
}

export const triangularMovingAverage = (data, k) => {
	const p = simpleMovingAverage(data, k)
	return simpleMovingAverage(p, k)
}
