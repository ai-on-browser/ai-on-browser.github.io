import BernsenThresholding from '../../lib/model/bernsen.js'

var dispBernsenThresholding = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const n = +elm.select('[name=n]').property('value')
		const ct = +elm.select('[name=ct]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new BernsenThresholding(n, ct)
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
	elm.append('span').text(' contrast threshold ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'ct')
		.attr('value', 50)
		.attr('min', 0)
		.attr('max', 255)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispBernsenThresholding(platform.setting.ml.configElement, platform)
}
