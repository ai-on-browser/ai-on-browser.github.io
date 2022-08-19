import LOF from '../../lib/model/lof.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const mode = platform.task
	let k_value = 5

	const calcLOF = function () {
		const th = threshold.value
		let model = new LOF(k_value)
		if (mode === 'AD') {
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred.map(v => v > th)
		} else {
			const d = window.value
			const data = platform.trainInput.rolling(d)
			const pred = model.predict(data)
			for (let i = 0; i < d / 2; i++) {
				pred.unshift(1)
			}
			platform.trainResult = pred
			platform.threshold = th
		}
	}

	let window
	if (mode === 'CP') {
		window = controller.input.number({ label: ' window = ', min: 1, max: 100, value: 10 }).on('change', calcLOF)
	}
	const k = controller.input.number({ label: ' k = ', min: 1, max: 10, value: k_value }).on('change', () => {
		k_value = k.value
	})
	const threshold = controller.input
		.number({ label: ' threshold = ', min: 0, max: 100, step: 0.1, value: 2 })
		.on('change', calcLOF)
	controller.input.button('Calculate').on('click', calcLOF)
}
