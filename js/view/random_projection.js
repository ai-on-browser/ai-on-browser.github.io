import RandomProjection from '../../lib/model/random_projection.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const dim = platform.dimension
		const model = new RandomProjection(init.value, dim)
		const y = model.predict(platform.trainInput)
		platform.trainResult = y
	}

	const init = controller.select(['uniform', 'normal', 'root3'])
	controller.input.button('Fit').on('click', () => fitModel())
}
