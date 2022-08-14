import ADAMENN from '../../lib/model/adamenn.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new ADAMENN(k0.value, k1.value, k2.value, l.value, k.value, c.value)

		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const categories = model.predict(platform.testInput(20))
		platform.testResult(categories)
	}
	const n = platform.datas?.length ?? 300

	const k0 = controller.input.number({ label: 'k0', min: 1, max: 1000, value: Math.ceil(n * 0.1) })
	const k1 = controller.input.number({ label: 'k1', min: 1, max: 1000, value: 3 })
	const k2 = controller.input.number({ label: 'k2', min: 1, max: 1000, value: Math.ceil(n * 0.15) })
	const l = controller.input.number({ label: 'l', min: 1, max: 1000, value: Math.ceil(n * 0.075) })
	const k = controller.input.number({ label: 'k', min: 1, max: 1000, value: 3 })
	const c = controller.input.number({ label: 'c', min: 0, max: 100, step: 0.1, value: 0.5 })
	controller.input.button('Calculate').on('click', fitModel)
}
