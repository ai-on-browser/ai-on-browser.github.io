import AODE from '../../lib/model/aode.js'

var dispAODE = function (elm, platform) {
	const fitModel = () => {
		const discrete = +elm.select('[name=discrete]').property('value')
		const model = new AODE(discrete)

		platform.fit((tx, ty) => {
			model.fit(tx, ty)
			platform.predict((px, pred_cb) => {
				const categories = model.predict(px)
				pred_cb(categories)
			}, 3)
		})
	}

	elm.append('span').text(' Discrete ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'discrete')
		.attr('max', 100)
		.attr('min', 1)
		.attr('value', 10)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispAODE(platform.setting.ml.configElement, platform)
}
