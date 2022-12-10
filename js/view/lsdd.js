import { LSDDCPD } from '../../lib/model/lsdd.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'M. Sugiyama, M. Yamada, M. C. du Plessis, S. Liu',
		title: 'Learning under Non-Stationarity: Covariate Shift Adaptation, Class-Balance Change Adaptation, and Change Detection',
		year: 2014,
	}
	const controller = new Controller(platform)
	const calcLSDD = function () {
		let model = new LSDDCPD(window.value)
		const pred = model.predict(platform.trainInput)
		for (let i = 0; i < (window.value * 3) / 4; i++) {
			pred.unshift(0)
		}
		platform.trainResult = pred
		platform.threshold = threshold.value
	}

	const window = controller.input.number({ label: ' window = ', min: 1, max: 100, value: 10 })
	const threshold = controller.input
		.number({ label: ' threshold = ', min: 0, max: 10000, step: 0.1, value: 300 })
		.on('change', () => {
			platform.threshold = threshold.value
		})
	controller.input.button('Calculate').on('click', calcLSDD)
}
