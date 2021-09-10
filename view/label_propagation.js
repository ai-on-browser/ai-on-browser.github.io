import LabelPropagation from '../lib/model/label_propagation.js'

var dispLabelPropagation = function (elm, platform) {
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty, fit_cb) => {
			if (!model) {
				const method = elm.select('[name=method]').property('value')
				const sigma = +elm.select('[name=sigma]').property('value')
				const k = +elm.select('[name=k_nearest]').property('value')
				model = new LabelPropagation(method, sigma, k)
				model.init(
					tx,
					ty.map(v => v[0])
				)
			}
			model.fit()
			fit_cb(model.predict())
		})
	}
	elm.append('select')
		.attr('name', 'method')
		.on('change', function () {
			const value = d3.select(this).property('value')
			paramSpan.selectAll('*').style('display', 'none')
			paramSpan.selectAll(`.${value}`).style('display', 'inline')
		})
		.selectAll('option')
		.data(['rbf', 'knn'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	const paramSpan = elm.append('span')
	paramSpan.append('span').classed('rbf', true).text('s =')
	paramSpan
		.append('input')
		.attr('type', 'number')
		.attr('name', 'sigma')
		.classed('rbf', true)
		.attr('min', 0.01)
		.attr('max', 100)
		.attr('step', 0.01)
		.property('value', 1)
	elm.append('span').text('k =')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k_nearest')
		.attr('min', 1)
		.attr('max', 1000)
		.property('value', 10)
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(cb => {
			fitModel()
			cb && cb()
		})
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	dispLabelPropagation(platform.setting.ml.configElement, platform)
}
