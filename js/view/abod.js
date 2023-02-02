import ABOD, { LBABOD } from '../../lib/model/abod.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'H. P. Kriegel, M. Schubert, A. Zimek',
		title: 'Angle-Based Outlier Detection in High-dimensional Data',
		year: 2008,
	}
	const controller = new Controller(platform)
	const calc = () => {
		if (method.value === 'LB-ABOD') {
			const model = new LBABOD(k.value, l.value)
			const outliers = model.predict(platform.trainInput)
			platform.trainResult = outliers
		} else {
			const model = new ABOD(k.value)
			const pred = model.predict(platform.trainInput)
			if (detect.value === 'threshold') {
				platform.trainResult = pred.map(v => v < threshold.value)
			} else {
				const p = pred.map((v, i) => [v, i])
				p.sort((a, b) => a[0] - b[0])
				const outliers = Array(pred.length).fill(false)
				for (let i = 0; i < l.value; i++) {
					outliers[p[i][1]] = true
				}
				platform.trainResult = outliers
			}
		}
	}

	const method = controller.select(['ABOD/FastABOD', 'LB-ABOD']).on('change', () => {
		if (method.value === 'LB-ABOD') {
			l.element.style.display = null
			threshold.element.style.display = 'none'
			detect.value = 'count'
			detect.element.disabled = true
		} else {
			detect.element.disabled = false
		}
	})
	const k = controller.input.number({ label: ' k ', min: 1, max: 10000, value: 1000 })
	const detect = controller.select(['count', 'threshold']).on('change', () => {
		l.element.style.display = detect.value === 'count' ? null : 'none'
		threshold.element.style.display = detect.value === 'count' ? 'none' : null
	})
	const threshold = controller.input.number({ min: 0, max: 100000, value: 100 })
	threshold.element.style.display = 'none'
	const l = controller.input.number({ min: 1, max: 100, value: 5 })
	controller.input.button('Calculate').on('click', calc)
}
