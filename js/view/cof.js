import COF from '../../lib/model/cof.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'J. Tang, Z. Chen, A. W. Fu, D. W. Cheung',
		title: 'Enhancing Effectiveness of Outlier Detections for Low Density Patterns',
		year: 2002,
	}
	const mode = platform.task
	const controller = new Controller(platform)

	const calcCOF = () => {
		const model = new COF(k.value)
		if (mode === 'AD') {
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred.map(v => v > threshold.value)
		} else {
			const d = window.value
			const data = platform.trainInput.rolling(d)
			const pred = model.predict(data)
			for (let i = 0; i < d / 2; i++) {
				pred.unshift(1)
			}
			platform.trainResult = pred
			platform.threshold = threshold.value
		}
	}

	let window
	if (mode === 'CP') {
		window = controller.input
			.number({
				label: ' window = ',
				value: 5,
				min: 1,
				max: 100,
			})
			.on('change', () => {
				calcCOF()
			})
	}
	const k = controller.input
		.number({
			label: ' k = ',
			min: 1,
			max: 100,
			value: 5,
		})
		.on('change', () => {
			calcCOF()
		})
	const threshold = controller.input
		.number({
			label: ' threshold = ',
			value: 1.5,
			min: 0,
			max: 100,
			step: 0.1,
		})
		.on('change', () => {
			calcCOF()
		})
	controller.input.button('Calculate').on('click', calcCOF)
}
