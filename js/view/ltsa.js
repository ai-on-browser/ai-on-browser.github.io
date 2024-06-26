import LTSA from '../../lib/model/ltsa.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'Z. Zhang, H. Zha',
		title: 'Principal Manifolds and Nonlinear Dimension Reduction via Local Tangent Space Alignment',
		year: 2002,
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const dim = platform.dimension
		const y = new LTSA(neighbor.value, dim).predict(platform.trainInput)
		platform.trainResult = y
	}

	const neighbor = controller.input.number({ label: 'Select neighbor #', min: 1, value: 10 })
	controller.input.button('Fit').on('click', () => fitModel())
}
