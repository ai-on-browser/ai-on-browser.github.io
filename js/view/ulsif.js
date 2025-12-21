import SquaredLossMICPD from '../../lib/model/squared_loss_mi.js'
import { uLSIF } from '../../lib/model/ulsif.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'S. Liu, M. Yamada, N. Collier, M. Sugiyama',
		title: 'Change-Point Detection in Time-Series Data by Relative Density-Ratio Estimation',
		year: 2012,
	}
	const controller = new Controller(platform)
	const calcULSIF = () => {
		const ulsif = new uLSIF([100, 10, 1, 0.1, 0.01, 0.001], [100, 10, 1, 0.1, 0.01, 0.001], 100)
		const model = new SquaredLossMICPD(ulsif, window.value)
		const pred = model.predict(platform.trainInput)
		for (let i = 0; i < (window.value * 3) / 4; i++) {
			pred.unshift(0)
		}
		platform.trainResult = pred
		platform.threshold = threshold.value
	}

	const window = controller.input.number({ label: ' window = ', min: 1, max: 100, value: 10 })
	const threshold = controller.input
		.number({ label: ' threshold = ', min: 0, max: 1000, step: 0.01, value: 0.01 })
		.on('change', () => {
			platform.threshold = threshold.value
		})
	controller.input.button('Calculate').on('click', calcULSIF)
}
