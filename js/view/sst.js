import SST from '../../lib/model/sst.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		title: 'Singular spectrum analysis (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Singular_spectrum_analysis',
	}
	const controller = new Controller(platform)
	const calcSST = function () {
		let model = new SST(window.value)
		const data = platform.trainInput.map(v => v[0])
		const pred = model.predict(data)
		for (let i = 0; i < (window.value * 3) / 4; i++) {
			pred.unshift(0)
		}
		platform.trainResult = pred
		platform.threshold = threshold.value
	}

	const window = controller.input.number({ label: ' window = ', min: 1, max: 100, value: 10 })
	const threshold = controller.input
		.number({ label: ' threshold = ', min: 0, max: 1, step: 0.01, value: 0.1 })
		.on('change', () => {
			platform.threshold = threshold.value
		})
	controller.input.button('Calculate').on('click', calcSST)
}
