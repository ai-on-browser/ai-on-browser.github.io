import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import SVM from '../../lib/model/svm.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		title: 'Support vector machine (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Support_vector_machine',
	}
	const controller = new Controller(platform)
	const step = 4
	let model = null
	let learn_epoch = 0

	const calcSVM = () => {
		if (platform.datas.length === 0) {
			return
		}
		for (let i = 0; i < +iteration.value; i++) {
			model.fit()
		}
		const data = model.predict(platform.testInput(step))
		platform.testResult(data)
		learn_epoch += +iteration.value
	}

	const method = controller.select({ values: ['oneone', 'onerest'], value: 'onerest' })
	const kernel = controller.select(['gaussian', 'linear']).on('change', () => {
		if (kernel.value === 'gaussian') {
			gamma.element.style.display = 'inline'
		} else {
			gamma.element.style.display = 'none'
		}
	})
	const gamma = controller.input.number({ value: 1, min: 0.01, max: 10.0, step: 0.01 })
	const slbConf = controller.stepLoopButtons().init(() => {
		model = new EnsembleBinaryModel(() => new SVM({ name: kernel.value, d: gamma.value }), method.value)
		model.init(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		learn_epoch = 0
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000] })
	slbConf.step(calcSVM).epoch(() => learn_epoch)
}
