import DiffusionMap from '../../lib/model/diffusion_map.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'J. de la Porte, B. M. Herbst, W. Hereman, S. J. van der Walt',
		title: 'An Introduction to Diffusion Maps',
		year: 2008,
	}
	const controller = new Controller(platform)
	const t = controller.input.number({ label: 't', min: 1, max: 100, value: 2 })
	controller.input.button('Fit').on('click', () => {
		const dim = platform.dimension
		const y = new DiffusionMap(t.value, dim).predict(platform.trainInput)
		platform.trainResult = y
	})
}
