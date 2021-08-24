import GaussianProcess from '../model/gaussian_process.js'
import EnsembleBinaryModel from '../js/ensemble.js'

var dispGaussianProcess = function (elm, platform) {
	const mode = platform.task
	let model = null

	const fitModel = cb => {
		const dim = platform.datas.dimension
		const kernel = elm.select('[name=kernel]').property('value')
		const beta = +elm.select('[name=beta]').property('value')
		if (mode === 'CF') {
			const method = elm.select('[name=method]').property('value')
			platform.fit((tx, ty) => {
				ty = ty.map(v => v[0])
				if (!model) {
					model = new EnsembleBinaryModel(GaussianProcess, method, null, [kernel, beta])
					model.init(tx, ty)
				}
				model.fit()
				platform.predict((px, pred_cb) => {
					const categories = model.predict(px)
					pred_cb(categories)
					cb && cb()
				}, 10)
			})
		} else {
			const rate = +elm.select('[name=rate]').property('value')
			platform.fit((tx, ty) => {
				if (!model) {
					model = new GaussianProcess(kernel, beta)
					model.init(tx, ty)
				}

				model.fit(rate)

				platform.predict(
					(px, pred_cb) => {
						let pred = model.predict(px)
						pred_cb(pred)
						cb && cb()
					},
					dim === 1 ? 2 : 10
				)
			})
		}
	}

	if (mode === 'CF') {
		elm.append('select')
			.attr('name', 'method')
			.selectAll('option')
			.data(['oneone', 'onerest'])
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
	}
	elm.append('select')
		.attr('name', 'kernel')
		.selectAll('option')
		.data(['gaussian'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' Beta ')
	elm.append('select')
		.attr('name', 'beta')
		.selectAll('option')
		.data([0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.select('[name=beta]').property('value', 1)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	elm.append('span').text(' Learning rate ')
	elm.append('select')
		.attr('name', 'rate')
		.selectAll('option')
		.data([0.0001, 0.001, 0.01, 0.1, 1, 10])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	slbConf.step(fitModel).epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize" button. Finally, click "Fit" button.'
	dispGaussianProcess(platform.setting.ml.configElement, platform)
}
