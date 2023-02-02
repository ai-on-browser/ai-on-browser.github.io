import LSIF from '../../lib/model/lsif.js'
import SquaredLossMICPD from '../../lib/model/squared_loss_mi.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'T. Kanamori, S. Hido, M. Sugiyama',
		title: 'A Least-squares Approach to Direct Importance Estimation',
		year: 2009,
	}
	const controller = new Controller(platform)
	const calcLSIF = function () {
		const lsif = new LSIF([100, 10, 1, 0.1, 0.01, 0.001], [100, 10, 1, 0.1, 0.01, 0.001], 3, 100)
		const model = new SquaredLossMICPD(lsif, window.value)
		const pred = model.predict(platform.trainInput)
		for (let i = 0; i < (window.value * 3) / 4; i++) {
			pred.unshift(0)
		}
		platform.trainResult = pred
		platform.threshold = threshold.value
	}

	const window = controller.input.number({ label: ' window = ', min: 1, max: 100, value: 20 })
	const threshold = controller.input
		.number({ label: ' threshold = ', min: 0, max: 1000, step: 0.01, value: 0.01 })
		.on('change', () => {
			platform.threshold = threshold.value
		})
	controller.input.button('Calculate').on('click', calcLSIF)
}
