import MeanShift from '../../lib/model/mean_shift.js'
import Controller from '../controller.js'

var dispMeanShift = function (elm, platform) {
	const svg = platform.svg
	const csvg = svg.insert('g', ':first-child').attr('class', 'centroids').attr('opacity', 0.8)
	const controller = new Controller(platform)
	let c = []
	const scale = platform.width / (platform.datas.domain[0][1] - platform.datas.domain[0][0])

	let model = new MeanShift(50, 10)

	const plot = () => {
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		for (let i = 0; i < c.length; i++) {
			c[i]
				.attr('stroke', getCategoryColor(pred[i] + 1))
				.attr('cx', model._centroids[i][0] * scale)
				.attr('cy', model._centroids[i][1] * scale)
		}
	}

	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'h')
		.attr('value', 0.1)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.01)
	controller
		.stepLoopButtons()
		.init(() => {
			model.h = +elm.select('[name=h]').property('value')
			model.threshold = +elm.select('[name=threshold]').property('value')
			let tx = platform.trainInput
			if (platform.task === 'SG') {
				tx = tx.flat()
			}
			model.init(tx)
			if (platform.task !== 'SG') {
				c.forEach(c => c.remove())
				c = platform.datas.points.map(p => {
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
			elm.select('[name=clusternumber]').text(model.categories)
		})
		.step(cb => {
			if (model === null) {
				return
			}
			model.fit()
			plot()
			elm.select('[name=clusternumber]').text(model.categories)
			cb && cb()
		})
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 0.01)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.01)
		.on('change', function () {
			model.threshold = d3.select(this).property('value')
			plot()
			elm.select('[name=clusternumber]').text(model.categories)
		})
	elm.append('span').attr('name', 'clusternumber').text('0')
	elm.append('span').text(' clusters ')
	return () => {
		csvg.remove()
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispMeanShift(platform.setting.ml.configElement, platform)
}
