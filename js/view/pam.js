import { PAM, CLARA } from '../../lib/model/pam.js'

var dispPAM = function (elm, platform) {
	let model = null

	const fitModel = cb => {
		platform.fit((tx, ty, pred_cb) => {
			if (!model) {
				const type = elm.select('[name=type]').property('value')
				const clusters = +elm.select('[name=clusters]').property('value')
				if (type === 'PAM') {
					model = new PAM(clusters)
				} else if (type === 'CLARA') {
					model = new CLARA(clusters)
				}
				model.init(tx)
			}
			model.fit()
			const pred = model.predict()
			pred_cb(pred.map(v => v + 1))
			cb && cb()
		})
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
	platform.setting.ml.controller
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