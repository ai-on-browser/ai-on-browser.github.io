import LLE from '../../lib/model/lle.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const dim = platform.dimension
		const y = new LLE(neighbor.value, dim).predict(platform.trainInput)
		platform.trainResult = y
	}

	const neighbor = controller.input.number({ label: 'Select neighbor #', min: 1, value: 20 })
	controller.input.button('Fit').on('click', () => fitModel())
}
