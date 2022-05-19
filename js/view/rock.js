import ROCK from '../../lib/model/rock.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new ROCK(threshold.value)
		model.fit(platform.trainInput)
		const pred = model.predict(k.value)
		platform.trainResult = pred.map(v => v + 1)
	}

	const threshold = controller.input.number({ label: ' threshold ', min: 0, max: 1, value: 0.95, step: 0.01 })
	const k = controller.input.number({ label: ' k ', min: 1, max: 100, value: 3 })
	controller.input.button('Fit').on('click', fitModel)
}
