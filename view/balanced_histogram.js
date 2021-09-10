import BalancedHistogramThresholding from '../lib/model/balanced_histogram.js'

var dispBHT = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const mincount = +elm.select('[name=mincount]').property('value')
			const model = new BalancedHistogramThresholding(mincount)
			let y = model.predict(tx.flat(2))
			elm.select('[name=threshold]').text(model._t)
			pred_cb(y.map(v => specialCategory.density(1 - v)))
		}, 1)
	}

	elm.append('span').text(' ignore min count ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'mincount')
		.attr('value', 100)
		.attr('min', 0)
		.attr('max', 10000)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Estimated threshold ')
	elm.append('span').attr('name', 'threshold')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispBHT(platform.setting.ml.configElement, platform)
}
