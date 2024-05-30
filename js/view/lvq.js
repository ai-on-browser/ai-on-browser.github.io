import { LVQCluster, LVQClassifier } from '../../lib/model/lvq.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Learning vector quantization (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Learning_vector_quantization',
	}
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (platform.task === 'CT') {
			if (!model) {
				model = new LVQCluster(k.value)
			}
			model.fit(platform.trainInput, lr.value)
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred.map(v => v + 1)
			platform.centroids(
				model._w,
				model._w.map((v, i) => i + 1)
			)
		} else {
			if (!model) {
				model = new LVQClassifier(+type.value)
			}
			model.fit(
				platform.trainInput,
				platform.trainOutput.map(v => v[0]),
				lr.value
			)
			const pred = model.predict(platform.testInput(4))
			platform.testResult(pred)
			platform.centroids(model._m, model._c)
		}
	}

	let k = null
	let type = null
	if (platform.task === 'CT') {
		k = controller.input.number({ label: ' k ', min: 1, max: 100, value: 5 })
	} else {
		type = controller.select({ values: [1, 2, 3], texts: ['LVQ1', 'LVQ2.1', 'LVQ3'] })
	}
	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	const lr = controller.input.number({ label: ' learning rate ', min: 0.01, max: 100, step: 0.01, value: 0.1 })
	slbConf.step(fitModel).epoch()
}
