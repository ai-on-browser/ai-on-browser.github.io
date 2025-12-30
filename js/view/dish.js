import DiSH from '../../lib/model/dish.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'E. Achtert, C. Bohm, H. P. Kriegel, P. Kroger, I. Muller-Gorman, A. Zimek',
		title: 'Detection and Visualization of Subspace Cluster Hierarchies',
		year: 2007,
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new DiSH(mu.value, e.value)

		const pred = model.predict(platform.trainInput).map(v => v + 1)
		platform.trainResult = pred
	}

	const mu = controller.input.number({ label: ' mu ', min: 1, max: 1000, value: 20 })
	const e = controller.input.number({ label: ' e ', min: 0, max: 100, step: 0.1, value: 0.1 })

	controller.input.button('Fit').on('click', fitModel)
}
