export default class CumSum {
	// https://qiita.com/kokumura/items/e4c17d989aa3c34c6dd0
	constructor() {}

	predict(datas) {
		let sum = datas[0]
		for (let i = 1; i < datas.length; i++) {
			sum += datas[i]
		}
		const mean = sum / datas.length

		const cum = []
		let d = 0
		for (let i = 0; i < datas.length; i++) {
			d += mean - datas[i]
			cum.push(Math.abs(d))
		}
		return cum
	}
}
