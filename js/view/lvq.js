import { LVQCluster, LVQClassifier } from '../../lib/model/lvq.js'
import Controller from '../controller.js'

var dispLVQ = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Learning vector quantization (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Learning_vector_quantization',
	}
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		const lr = +elm.select('[name=lr]').property('value')
		if (platform.task === 'CT') {
			if (!model) {
				const k = +elm.select('[name=k]').property('value')
				model = new LVQCluster(k)
			}
			model.fit(platform.trainInput, lr)
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred.map(v => v + 1)
			platform.centroids(
				model._w,
				model._w.map((v, i) => i + 1)
			)
		} else {
			if (!model) {
				const type = +elm.select('[name=type]').property('value')
				model = new LVQClassifier(type)
			}
			model.fit(
				platform.trainInput,
				platform.trainOutput.map(v => v[0]),
				lr
			)
			const pred = model.predict(platform.testInput(4))
			platform.testResult(pred)
			platform.centroids(model._m, model._c)
		}
		cb && cb()
	}

	if (platform.task === 'CT') {
		elm.append('span').text(' k ')
		elm.append('input').attr('type', 'number').attr('name', 'k').attr('min', 1).attr('max', 100).attr('value', 5)
	} else {
		elm.append('select')
			.attr('name', 'type')
			.selectAll('option')
			.data([
				{ t: 'LVQ1', v: 1 },
				{ t: 'LVQ2.1', v: 2 },
				{ t: 'LVQ3', v: 3 },
			])
			.enter()
			.append('option')
			.attr('value', d => d.v)
			.text(d => d.t)
	}
	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	elm.append('span').text(' learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'lr')
		.attr('min', 0.01)
		.attr('max', 100)
		.attr('step', 0.01)
		.attr('value', 0.1)
	slbConf.step(fitModel).epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispLVQ(platform.setting.ml.configElement, platform)
}
