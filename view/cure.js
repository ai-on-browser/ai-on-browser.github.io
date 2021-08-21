import CURE from '../model/cure.js'

var dispCURE = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const c = +elm.select('[name=c]').property('value')
			const k = +elm.select('[name=k]').property('value')
			const model = new CURE(c)
			model.fit(tx)
			const pred = model.predict(k)
			pred_cb(pred.map(v => v + 1))
		})
	}

	elm.append('span').text(' c ')
	elm.append('input').attr('type', 'number').attr('name', 'c').attr('min', 1).attr('max', 1000).attr('value', 10)
	elm.append('span').text(' k ')
	elm.append('input').attr('type', 'number').attr('name', 'k').attr('min', 1).attr('max', 100).attr('value', 3)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => {
			fitModel()
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispCURE(platform.setting.ml.configElement, platform)
}