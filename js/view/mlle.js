import MLLE from '../../lib/model/mlle.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const dim = platform.dimension
		const y = new MLLE(neighbor.value).predict(platform.trainInput, dim)
		platform.trainResult = y
	}

	const neighbor = controller.input.number({
		label: 'Select neighbor #',
		min: 1,
		value: 20,
	})
	controller.input.button('Fit').on('click', fitModel)
}
