import MutualInformationFeatureSelection from '../lib/model/mutual_information.js'

var dispMI = function (elm, platform) {
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => {
			platform.fit((tx, ty, pred_cb) => {
				const dim = platform.dimension
				const model = new MutualInformationFeatureSelection()
				model.fit(tx, ty)
				let y = model.predict(tx, dim)
				pred_cb(y)
			})
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispMI(platform.setting.ml.configElement, platform)
}
