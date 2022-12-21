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
	svg.insert('g', ':first-child').attr('class', 'range').attr('opacity', 0.4)

	const fitModel = () => {
		svg.selectAll('.range *').remove()
		const model = new DBSCAN(eps.value, minpts.value, metric.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = new Set(pred).size
		const scale = 1000

		if (metric.value === 'euclid') {
			svg.select('.range')
				.selectAll('circle')
				.data(platform.trainInput)
				.enter()
				.append('circle')
				.attr('cx', c => c[0] * scale)
				.attr('cy', c => c[1] * scale)
				.attr('r', eps.value * scale)
				.attr('fill-opacity', 0)
				.attr('stroke', (c, i) => getCategoryColor(pred[i] + 1))
		} else if (metric.value === 'manhattan') {
			svg.select('.range')
				.selectAll('polygon')
				.data(platform.trainInput)
				.enter()
				.append('polygon')
				.attr('points', c => {
					const x0 = c[0] * scale
					const y0 = c[1] * scale
					const d = eps.value * scale
					return `${x0 - d},${y0} ${x0},${y0 - d} ${x0 + d},${y0} ${x0},${y0 + d}`
				})
				.attr('fill-opacity', 0)
				.attr('stroke', (c, i) => getCategoryColor(pred[i] + 1))
		} else if (metric.value === 'chebyshev') {
			svg.select('.range')
				.selectAll('rect')
				.data(platform.trainInput)
				.enter()
				.append('rect')
				.attr('x', c => (c[0] - eps.value) * scale)
				.attr('y', c => (c[1] - eps.value) * scale)
				.attr('width', eps.value * 2 * scale)
				.attr('height', eps.value * 2 * scale)
				.attr('fill-opacity', 0)
				.attr('stroke', (c, i) => getCategoryColor(pred[i] + 1))
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
		svg.select('.range').remove()
	}
}
