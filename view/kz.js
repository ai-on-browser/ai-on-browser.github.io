import KolmogorovZurbenkoFilter from '../lib/model/kz.js'

var dispKZ = function (elm, platform) {
	const fitModel = () => {
		const m = +elm.select('[name=m]').property('value')
		const k = +elm.select('[name=k]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new KolmogorovZurbenkoFilter(m, k)
			const pred = model.predict(tx)
			pred_cb(pred)
		})
	}

	elm.append('span').text('m')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'm')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 5)
		.on('change', fitModel)
	elm.append('span').text('k')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 2)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispKZ(platform.setting.ml.configElement, platform)
}
