import DBSCAN from '../../lib/model/dbscan.js'
import Controller from '../controller.js'
import { getCategoryColor } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'DBSCAN (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/DBSCAN',
	}
	const controller = new Controller(platform)
	const svg = platform.svg
	const range = document.createElementNS('http://www.w3.org/2000/svg', 'g')
	svg.insertBefore(range, svg.firstChild)
	range.classList.add('range')
	range.setAttribute('opacity', 0.4)

	const fitModel = () => {
		range.replaceChildren()
		const model = new DBSCAN(eps.value, minpts.value, metric.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = new Set(pred).size
		const scale = platform._renderer[0].scale[0]

		const datas = platform.trainInput
		const invscale = platform.invertScale([
			Array(platform.datas.dimension).fill(1),
			Array(platform.datas.dimension).fill(2),
		])
		const s0 = invscale[1][platform._renderer[0]._select[0]] - invscale[0][platform._renderer[0]._select[0]]
		const s1 = invscale[1][platform._renderer[0]._select[1]] - invscale[0][platform._renderer[0]._select[1]]
		for (let i = 0; i < datas.length; i++) {
			const p = platform._renderer[0].toPoint(platform.invertScale(datas[i]))
			if (metric.value === 'euclid') {
				const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
				ellipse.setAttribute('cx', p[0])
				ellipse.setAttribute('cy', p[1])
				ellipse.setAttribute('rx', eps.value * scale * s0)
				ellipse.setAttribute('ry', eps.value * scale * s1)
				ellipse.setAttribute('fill-opacity', 0)
				ellipse.setAttribute('stroke', getCategoryColor(pred[i] + 1))
				range.append(ellipse)
			} else if (metric.value === 'manhattan') {
				const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
				const d = eps.value * scale
				polygon.setAttribute(
					'points',
					`${p[0] - d * s0},${p[1]} ${p[0]},${p[1] - d * s1} ${p[0] + d * s0},${p[1]} ${p[0]},${p[1] + d * s1}`
				)
				polygon.setAttribute('fill-opacity', 0)
				polygon.setAttribute('stroke', getCategoryColor(pred[i] + 1))
				range.append(polygon)
			} else if (metric.value === 'chebyshev') {
				const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
				rect.setAttribute('x', p[0] - eps.value * scale * s0)
				rect.setAttribute('y', p[1] - eps.value * scale * s1)
				rect.setAttribute('width', eps.value * 2 * scale * s0)
				rect.setAttribute('height', eps.value * 2 * scale * s1)
				rect.setAttribute('fill-opacity', 0)
				rect.setAttribute('stroke', getCategoryColor(pred[i] + 1))
				range.append(rect)
			}
		}
	}

	const metric = controller.select(['euclid', 'manhattan', 'chebyshev']).on('change', fitModel)
	const eps = controller.input
		.number({ label: 'eps', min: 0.01, max: 10, step: 0.01, value: 0.05 })
		.on('change', fitModel)
	const minpts = controller.input.number({ label: 'min pts', min: 2, max: 1000, value: 5 }).on('change', fitModel)
	controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({ label: ' Clusters: ' })
	return () => {
		range.remove()
	}
}
