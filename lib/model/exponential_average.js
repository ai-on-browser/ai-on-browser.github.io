import { HoltWinters } from './holt_winters.js'

export const exponentialMovingAverate = (data, k) => {
	const hw = new HoltWinters(2 / (k + 1))
	return hw.fit(data)
}

export const modifiedMovingAverage = (data, k) => {
	const p = [data[0]]
	for (let i = 1; i < data.length; i++) {
		p.push(p[i - 1].map((v, j) => ((k - 1) * v + data[i][j]) / k))
	}
	return p
}
