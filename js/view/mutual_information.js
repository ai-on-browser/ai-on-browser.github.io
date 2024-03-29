import MutualInformationFeatureSelection from '../../lib/model/mutual_information.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	controller.input.button('Fit').on('click', () => {
		const dim = platform.dimension
		const model = new MutualInformationFeatureSelection(dim)
		model.fit(platform.trainInput, platform.trainOutput)
		let y = model.predict(platform.trainInput)
		platform.trainResult = y
	})
}
