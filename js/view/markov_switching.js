import MarkovSwitching from '../../lib/model/markov_switching.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const calcMSM = function (cb) {
		const model = new MarkovSwitching(regime.value)
		model.fit(platform.trainInput, 1, trial.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred
		platform.threshold = threshold.value
		cb && cb()
	}

	const regime = controller.input.number({ label: ' regime = ', min: 2, max: 100, value: 3 })
	const trial = controller.input.number({ label: ' trial = ', min: 1, max: 1.0e8, value: 10000 })
	const threshold = controller.input
		.number({ label: ' threshold = ', min: 0, max: 100, step: 0.01, value: 0.1 })
		.on('change', () => {
			platform.threshold = threshold.value
		})
	const calcBtn = controller.input.button('Calculate').on('click', () => {
		calcBtn.element.disabled = true
		setTimeout(() => {
			calcMSM(() => {
				calcBtn.element.disabled = false
			})
		}, 0)
	})
}
