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
		if (metric.value === 'euclid') {
			for (let i = 0; i < datas.length; i++) {
				const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
				circle.setAttribute('cx', datas[i][0] * scale)
				circle.setAttribute('cy', datas[i][1] * scale)
				circle.setAttribute('r', eps.value * scale)
				circle.setAttribute('fill-opacity', 0)
				circle.setAttribute('stroke', getCategoryColor(pred[i] + 1))
				range.append(circle)
			}
		} else if (metric.value === 'manhattan') {
			for (let i = 0; i < datas.length; i++) {
				const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
				const x0 = datas[i][0] * scale
				const y0 = datas[i][1] * scale
				const d = eps.value * scale
				polygon.setAttribute('points', `${x0 - d},${y0} ${x0},${y0 - d} ${x0 + d},${y0} ${x0},${y0 + d}`)
				polygon.setAttribute('fill-opacity', 0)
				polygon.setAttribute('stroke', getCategoryColor(pred[i] + 1))
				range.append(polygon)
			}
		} else if (metric.value === 'chebyshev') {
			for (let i = 0; i < datas.length; i++) {
				const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
				rect.setAttribute('x', (datas[i][0] - eps.value) * scale)
				rect.setAttribute('y', (datas[i][1] - eps.value) * scale)
				rect.setAttribute('width', eps.value * 2 * scale)
				rect.setAttribute('height', eps.value * 2 * scale)
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
	platform.setting.terminate = () => {
		range.remove()
	}
}
