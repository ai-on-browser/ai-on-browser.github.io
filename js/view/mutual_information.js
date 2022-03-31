import MutualInformationFeatureSelection from '../../lib/model/mutual_information.js'

var dispMI = function (elm, platform) {
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => {
			const dim = platform.dimension
			const model = new MutualInformationFeatureSelection()
			model.fit(platform.trainInput, platform.trainOutput)
			let y = model.predict(platform.trainInput, dim)
			platform.trainResult = y
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispMI(platform.setting.ml.configElement, platform)
}
