import DENCLUE from '../../lib/model/denclue.js'
import Controller from '../controller.js'

var dispDENCLUE = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		model.fit()
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		elm.select('[name=clusters]').text(model.size)

		cb && cb()
	}

	elm.append('select')
		.attr('name', 'version')
		.selectAll('option')
		.data(['1', '2'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text(' h ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'h')
		.attr('min', 0)
		.attr('max', 100)
		.attr('value', 0.1)
		.attr('step', 0.1)
	controller
		.stepLoopButtons()
		.init(() => {
			const h = +elm.select('[name=h]').property('value')
			const version = +elm.select('[name=version]').property('value')
			model = new DENCLUE(h, version)
			model.init(platform.trainInput)
			elm.select('[name=clusters]').text(0)
			platform.init()
		})
		.step(fitModel)
		.epoch()
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispDENCLUE(platform.setting.ml.configElement, platform)
}
