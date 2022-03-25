import { LogisticRegression, MultinomialLogisticRegression } from '../../lib/model/logistic.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

var dispLogistic = function (elm, platform) {
	const controller = new Controller(platform)
	const step = 4

	let learn_epoch = 0
	let model = null

	const fitModel = cb => {
		if (!model) {
			return
		}

		const iteration = +elm.select('[name=iteration]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		const l1 = +elm.select('[name=l1]').property('value')
		const l2 = +elm.select('[name=l2]').property('value')
		platform.fit((tx, ty) => {
			model.fit(
				tx,
				ty.map(v => v[0]),
				iteration,
				rate,
				l1,
				l2
			)
			platform.predict((px, pred_cb) => {
				const pred = model.predict(px)
				pred_cb(pred)
				learn_epoch += iteration

				cb && cb()
			}, step)
		})
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['oneone', 'onerest', 'multinomial'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.select('[name=method]').property('value', 'multinomial')
	const slbConf = controller.stepLoopButtons().init(() => {
		learn_epoch = 0
		const method = elm.select('[name=method]').property('value')
		if (method === 'multinomial') {
			model = new MultinomialLogisticRegression()
		} else {
			model = new EnsembleBinaryModel(LogisticRegression, method)
		}
		platform.init()
	})
	elm.append('span').text(' Iteration ')
	elm.append('select')
		.attr('name', 'iteration')
		.selectAll('option')
		.data([1, 10, 100, 1000])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' Learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'rate')
		.attr('value', 0.1)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
	elm.append('span').text(' l1 = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'l1')
		.attr('value', 0)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.1)
	elm.append('span').text(' l2 = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'l2')
		.attr('value', 0)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.1)
	slbConf.step(fitModel).epoch(() => learn_epoch)
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	dispLogistic(platform.setting.ml.configElement, platform)
}
