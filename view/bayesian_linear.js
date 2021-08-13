import BayesianLinearRegression from '../model/bayesian_linear.js'

var dispBayesianLinearRegression = function (elm, platform) {
	let model
	const fitModel = cb => {
		platform.fit((tx, ty, fit_cb) => {
			if (!model) {
				const l = +elm.select('[name=lambda]').property('value')
				const s = +elm.select('[name=sigma]').property('value')
				model = new BayesianLinearRegression(l, s)
			}
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px)
				pred_cb(pred)
				cb && cb()
			}, 4)
		})
	}

	elm.append('select')
		.selectAll('option')
		.data(['online'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text('lambda = ')
	elm.append('input')
		.attr('name', 'lambda')
		.attr('type', 'number')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.attr('value', 0.1)
	elm.append('span').text('sigma = ')
	elm.append('input')
		.attr('name', 'sigma')
		.attr('type', 'number')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.attr('value', 0.2)
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispBayesianLinearRegression(platform.setting.ml.configElement, platform)
}
