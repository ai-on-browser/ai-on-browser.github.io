import COPKMeans from '../../lib/model/cop_kmeans.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'K. Wagstaff, C. Cardie, S. Rogers, S. Schroedl',
		title: 'Constrained K-means Clustering with Background Knowledge',
		year: 2001,
	}
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		const x = platform.trainInput
		const t = platform.trainOutput
		if (!model) {
			model = new COPKMeans(k.value)
			const ml = []
			const cl = []
			for (let i = 0; i < t.length; i++) {
				for (let j = 0; j < i; j++) {
					if (t[i][0] != null && t[i][0] === t[j][0]) {
						ml.push([i, j])
					} else if (t[i][0] != null && t[j][0] != null && t[i][0] !== t[j][0]) {
						cl.push([i, j])
					}
				}
			}
			model.init(x, ml, cl)
		}
		model.fit()
		const pred = model.predict(x)
		const c = model.centroids
		const distances = []
		for (let k = 0; k < c.length; k++) {
			const d = {}
			for (let i = 0; i < t.length; i++) {
				if (t[i][0] == null) {
					continue
				}
				d[t[i][0]] ??= 0
				d[t[i][0]] += c[k].reduce((s, v, j) => s + (v - x[i][j]) ** 2, 0)
			}
			distances[k] = d
		}
		const classMap = []
		for (let k = 0; k < c.length; k++) {
			let min = Infinity
			let min_c = -1
			let min_k = null
			for (let i = 0; i < distances.length; i++) {
				for (const v of Object.keys(distances[i])) {
					if (distances[i][v] < min) {
						min = distances[i][v]
						min_c = i
						min_k = +v
					}
				}
			}
			classMap[min_c] = min_k
			distances[min_c] = {}
			for (let i = 0; i < distances.length; i++) {
				distances[i][min_k] = Infinity
			}
		}
		platform.trainResult = pred.map(v => classMap[v])
		platform.centroids(c, classMap, { line: true })
	}

	const k = controller.input.number({ label: ' k ', min: 1, max: 1000, value: 3 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
