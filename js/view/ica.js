import ICA from '../../lib/model/ica.js'

var dispICA = function (elm, platform) {
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => {
			const dim = platform.dimension
			const model = new ICA()
			model.fit(platform.trainInput)
			const y = model.predict(platform.trainInput, dim)
			platform.trainResult = y
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispICA(platform.setting.ml.configElement, platform)
}
