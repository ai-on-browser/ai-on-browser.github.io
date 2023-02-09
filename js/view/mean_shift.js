import MeanShift from '../../lib/model/mean_shift.js'
import Controller from '../controller.js'
import { getCategoryColor } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Mean shift (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Mean_shift',
	}
	const svg = d3.select(platform.svg)
	const csvg = svg.insert('g', ':first-child').attr('class', 'centroids').attr('opacity', 0.8)
	const controller = new Controller(platform)
	let c = []

	let model = new MeanShift(50, 10)

	const plot = () => {
		const scale = platform._renderer[0].scale?.[0] ?? 0
		const pred = model.predict(threshold.value)
		platform.trainResult = pred.map(v => v + 1)
		for (let i = 0; i < c.length; i++) {
			c[i]
				.attr('stroke', getCategoryColor(pred[i] + 1))
				.attr('cx', model._centroids[i][0] * scale)
				.attr('cy', model._centroids[i][1] * scale)
		}
	}

	const h = controller.input.number({
		min: 0,
		max: 10,
		step: 0.01,
		value: 0.1,
	})
	controller
		.stepLoopButtons()
		.init(() => {
			const scale = platform._renderer[0].scale?.[0] ?? 0
			model = new MeanShift(h.value)
			let tx = platform.trainInput
			if (platform.task === 'SG') {
				tx = tx.flat()
			}
			model.init(tx)
			if (platform.task !== 'SG' && scale > 0) {
				c.forEach(c => c.remove())
				c = platform._renderer[0].points.map(p => {
					return csvg
						.append('circle')
						.attr('cx', p.at[0] * scale)
						.attr('cy', p.at[1] * scale)
						.attr('r', model.h * scale)
						.attr('stroke', 'black')
						.attr('fill-opacity', 0)
						.attr('stroke-opacity', 0.5)
				})
			}
			plot()
			clusters.value = model.categories
		})
		.step(cb => {
			if (model === null) {
				return
			}
			model.fit()
			plot()
			clusters.value = model.categories
			cb && cb()
		})
	const threshold = controller.input
		.number({
			min: 0,
			max: 10,
			step: 0.01,
			value: 0.01,
		})
		.on('change', () => {
			plot()
			clusters.value = model.categories
		})
	const clusters = controller.text({
		label: ' clusters ',
		value: 0,
	})
	platform.setting.terminate = () => {
		csvg.remove()
	}
}
