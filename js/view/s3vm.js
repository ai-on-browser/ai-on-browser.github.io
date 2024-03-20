import S3VM from '../../lib/model/s3vm.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Currently, this model works only with binary classification. Click and add data point. Finally, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		author: 'K. P. Bennett, A. Demiriz',
		title: 'Semi-Supervised Support Vector Machines',
		year: 1998,
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		model._rate = Math.max(minLearningRate.value, learningRate.value)
		model.fit()
		const data = model.predict(platform.testInput(4))
		learningRate.value = learningRate.value * learningRateUpdate.value
		platform.testResult(data.map(v => (v < 0 ? 1 : 2)))
		cb && cb()
	}

	const kernel = controller.select(['gaussian', 'linear']).on('change', () => {
		if (kernel.value === 'gaussian') {
			gamma.element.style.display = 'inline'
		} else {
			gamma.element.style.display = 'none'
		}
	})
	const gamma = controller.input.number({
		value: 0.1,
		min: 0.01,
		max: 10.0,
		step: 0.01,
	})
	const slbConf = controller.stepLoopButtons().init(() => {
		model = new S3VM({ name: kernel.value, d: gamma.value })
		model.init(
			platform.trainInput,
			platform.trainOutput.map(v => (v[0] == null ? null : v[0] === 1 ? -1 : 1))
		)
		platform.init()
	})
	const minLearningRate = controller.input.number({
		label: 'learning rate = max(',
		min: 0,
		max: 1,
		step: 0.01,
		value: 0,
	})
	const learningRate = controller.input.number({
		label: ', ',
		min: 0,
		max: 1,
		step: 0.1,
		value: 0.1,
	})
	const learningRateUpdate = controller.input.number({
		label: ' * ',
		min: 0,
		max: 1,
		step: 0.01,
		value: 0.999,
	})
	controller.text(') ')
	slbConf.step(fitModel).epoch()
}
