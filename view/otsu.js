import OtsusThresholding from '../model/otsu.js'

var dispOtsu = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const model = new OtsusThresholding()
			let y = model.predict(tx.flat(2))
			elm.select('[name=threshold]').text(model._t)
			pred_cb(y.map(v => specialCategory.density(1 - v)))
		}, 1)
	}

	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Estimated threshold ')
	elm.append('span').attr('name', 'threshold')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispOtsu(platform.setting.ml.configElement, platform)
}
