import SVC from '../../lib/model/svc.js'
import Controller from '../controller.js'

var dispSVC = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		model.fit()
		elm.select('[name=clusters]').text(model.size)
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		cb && cb()
	}

	elm.append('select')
		.attr('name', 'kernel')
		.on('change', function () {
			const k = d3.select(this).property('value')
			if (k === 'gaussian') {
				elm.select('input[name=gamma]').style('display', 'inline')
			} else {
				elm.select('input[name=gamma]').style('display', 'none')
			}
		})
		.selectAll('option')
		.data(['gaussian', 'linear'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'gamma')
		.attr('value', 0.1)
		.attr('min', 0.01)
		.attr('max', 10.0)
		.attr('step', 0.01)
	controller
		.stepLoopButtons()
		.init(() => {
			const kernel = elm.select('[name=kernel]').property('value')
			const kernel_args = []
			if (kernel === 'gaussian') {
				kernel_args.push(+elm.select('input[name=gamma]').property('value'))
			}
			model = new SVC(kernel, kernel_args)
			model.init(platform.trainInput)
			platform.init()
		})
		.step(fitModel)
		.epoch()
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispSVC(platform.setting.ml.configElement, platform)
}
