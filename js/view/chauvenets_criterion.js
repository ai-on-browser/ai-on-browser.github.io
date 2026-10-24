import ChauvenetsCriterion from '../../lib/model/chauvenets_criterion.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const calc = () => {
		const model = new ChauvenetsCriterion()
		const outliers = model.predict(platform.trainInput.map(v => v[0]))
		platform.trainResult = outliers
	}

	controller.input.button('Calculate').on('click', calc)
}
