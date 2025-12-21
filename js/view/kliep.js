import KLIEP from '../../lib/model/kliep.js'
import SquaredLossMICPD from '../../lib/model/squared_loss_mi.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'M. Sugiyama, T. Suzuki, S. Nakajima, H. Kashima, P. von Bünau, M. Kawanabe',
		title: 'Direct importance estimation for covariate shift adaptation',
		year: 2008,
	}
	const controller = new Controller(platform)
	const calcKLIEP = () => {
		const kliep = new KLIEP([100, 10, 1, 0.1, 0.01, 0.001], 5, 100)
		const model = new SquaredLossMICPD(kliep, window.value)
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
	controller.input.button('Calculate').on('click', calcKLIEP)
}
