import SauvolaThresholding from '../lib/model/sauvola.js'

var dispSauvolaThresholding = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const n = +elm.select('[name=n]').property('value')
		const k = +elm.select('[name=k]').property('value')
		const r = +elm.select('[name=r]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new SauvolaThresholding(n, k, r)
			const y = model.predict(tx)
			pred_cb(y.flat())
		}, 1)
	}

	elm.append('span').text(' n ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'n')
		.attr('value', 3)
		.attr('min', 3)
		.attr('max', 99)
		.attr('step', 2)
		.on('change', fitModel)
	elm.append('span').text(' k ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('value', 0.1)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('span').text(' R ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'r')
		.attr('value', 5)
		.attr('min', 0)
		.attr('max', 100)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispSauvolaThresholding(platform.setting.ml.configElement, platform)
}
