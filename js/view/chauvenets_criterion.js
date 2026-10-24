import ChauvenetsCriterion from '../../lib/model/chauvenets_criterion.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const calc = () => {
		const model = new ChauvenetsCriterion()
		const x = platform.trainInput
		const outliers = Array(x.length).fill(false)
		for (let j = 0; j < x[0].length; j++) {
			const oj = model.predict(platform.trainInput.map(v => v[j]))
			for (let i = 0; i < x.length; i++) {
				outliers[i] |= oj[i]
			}
		}
		platform.trainResult = outliers
	}

	controller.input.button('Calculate').on('click', calc)
}
