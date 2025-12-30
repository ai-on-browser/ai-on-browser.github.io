import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import SelectiveSamplingSOP from '../../lib/model/selective_sampling_sop.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'N. Cesa-Bianchi, C. Gentile, L. Zaniboni',
		title: 'Worst-case analysis of selective sampling for linear classification',
		year: 2006,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const model = new EnsembleBinaryModel(() => new SelectiveSamplingSOP(b.value), method.value)
		model.init(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		model.fit()

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	const method = controller.select(['oneone', 'onerest'])
	const b = controller.input.number({ label: ' Smoothing ', min: 0, max: 100, step: 0.1, value: 1 })
	controller.input.button('Calculate').on('click', calc)
}
