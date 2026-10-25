import GeneralizedESD from '../../lib/model/generalized_esd.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = { dimension: 1 }
	const controller = new Controller(platform)
	const calcGeneralizedESD = () => {
		const model = new GeneralizedESD(alpha.value, k.value)
		const outliers = model.predict(platform.trainInput.map(v => v[0]))
		platform.trainResult = outliers
	}

	const k = controller.input.number({ label: ' k = ', min: 1, max: 100, value: 5 }).on('change', calcGeneralizedESD)
	const alpha = controller.input
		.number({ label: ' alpha = ', min: 0, max: 50, value: 1 })
		.on('change', calcGeneralizedESD)
	controller.input.button('Calculate').on('click', calcGeneralizedESD)
}
