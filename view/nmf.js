import NMF from '../lib/model/nmf.js'

var dispNMF = function (elm, platform) {
	let model = null

	const fitModel = cb => {
		platform.fit((tx, ty, pred_cb) => {
			if (platform.task === 'CT') {
				if (!model) {
					model = new NMF()
					const k = +elm.select('[name=k]').property('value')
					model.init(tx, k)
				}
				model.fit()
				const pred = model.predict()
				pred_cb(pred.argmax(1).value.map(v => v + 1))
			} else {
				if (!model) {
					model = new NMF()
					const dim = platform.dimension
					model.init(tx, dim)
				}
				model.fit()
				const pred = model.predict()
				pred_cb(pred.toArray())
			}
			cb && cb()
		})
	}

	if (platform.task === 'CT') {
		elm.append('span').text(' Size ')
		elm.append('input').attr('type', 'number').attr('name', 'k').attr('value', 10).attr('min', 1).attr('max', 100)
	}
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispNMF(platform.setting.ml.configElement, platform)
}
