import MeanShift from '../../lib/model/mean_shift.js'
import Controller from '../controller.js'
import { getCategoryColor } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Mean shift (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Mean_shift',
	}
	let csvg = null
	if (platform.task !== 'SG') {
		csvg = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		platform.svg.insertBefore(csvg, platform.svg.firstChild)
		csvg.classList.add('centroids')
		csvg.setAttribute('opacity', 0.8)
	}
	const controller = new Controller(platform)
	let c = []

	let model = null

	const plot = () => {
		const pred = model.predict(threshold.value)
		platform.trainResult = pred.map(v => v + 1)
		for (let i = 0; i < c.length; i++) {
			const centroid = platform._renderer[0].toPoint(platform.invertScale(model._centroids[i]))
			c[i].setAttribute('stroke', getCategoryColor(pred[i] + 1))
			c[i].setAttribute('cx', centroid[0])
			c[i].setAttribute('cy', centroid[1])
		}
	}

	const h = controller.input.number({ label: 'h', min: 0, max: 10, step: 0.01, value: 0.1 })
	const threshold = controller.input.number({ label: 'threshold', min: 0, max: 10, step: 0.01, value: 0.01 })
	controller
		.stepLoopButtons()
		.init(() => {
			const scale = platform._renderer[0].scale?.[0] ?? 0
			model = new MeanShift(h.value, threshold.value)
			let tx = platform.trainInput
			if (platform.task === 'SG') {
				tx = tx.flat()
			}
			model.init(tx)
			if (platform.task !== 'SG' && scale > 0) {
				const invscale = platform.invertScale([
					Array(platform.datas.dimension).fill(1),
					Array(platform.datas.dimension).fill(2),
				])
				const s0 = invscale[1][platform._renderer[0]._select[0]] - invscale[0][platform._renderer[0]._select[0]]
				const s1 = invscale[1][platform._renderer[0]._select[1]] - invscale[0][platform._renderer[0]._select[1]]
				c.forEach(c => c.remove())
				c = platform._renderer[0].points.map(() => {
					const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
					ellipse.setAttribute('rx', model.h * scale * s0)
					ellipse.setAttribute('ry', model.h * scale * s1)
					ellipse.setAttribute('stroke', 'black')
					ellipse.setAttribute('fill-opacity', 0)
					ellipse.setAttribute('stroke-opacity', 0.5)
					csvg.append(ellipse)
					return ellipse
				})
			}
			plot()
			clusters.value = model.categories
		})
		.step(() => {
			if (model === null) {
				return
			}
			model.fit()
			plot()
			clusters.value = model.categories
		})
	const clusters = controller.text({ label: ' clusters ', value: 0 })
	return () => {
		csvg?.remove()
	}
}
