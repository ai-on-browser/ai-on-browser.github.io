import PAM from '../../lib/model/pam.js'
import CLARA from '../../lib/model/clara.js'
import Controller from '../controller.js'

var dispPAM = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		if (!model) {
			const type = elm.select('[name=type]').property('value')
			const clusters = +elm.select('[name=clusters]').property('value')
			if (type === 'PAM') {
				model = new PAM(clusters)
			} else if (type === 'CLARA') {
				model = new CLARA(clusters)
			}
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		cb && cb()
	}

	elm.append('select')
		.attr('name', 'type')
		.selectAll('option')
		.data(['PAM', 'CLARA'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' clusters ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'clusters')
		.attr('min', 1)
		.attr('max', 1000)
		.attr('value', 10)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispPAM(platform.setting.ml.configElement, platform)
}
