import AdaptiveThresholding from '../model/adaptive_thresholding.js'

var dispAdaptiveThresholding = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const method = elm.select('[name=method]').property('value')
		const k = +elm.select('[name=k]').property('value')
		const c = +elm.select('[name=c]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new AdaptiveThresholding(method, k, c)
			const y = model.predict(tx)
			pred_cb(y.flat())
		}, 1)
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['mean', 'gaussian'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' k ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('value', 3)
		.attr('min', 3)
		.attr('max', 99)
		.attr('step', 2)
		.on('change', fitModel)
	elm.append('span').text(' c ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('value', 2)
		.attr('min', 0)
		.attr('max', 100)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispAdaptiveThresholding(platform.setting.ml.configElement, platform)
}
