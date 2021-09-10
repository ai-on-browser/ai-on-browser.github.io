import SpectralClustering from '../lib/model/spectral.js'

var dispSpectral = function (elm, platform) {
	let model = null

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
	paramSpan.append('span').classed('knn', true).text('k =')
	paramSpan
		.append('input')
		.attr('type', 'number')
		.attr('name', 'k_nearest')
		.classed('knn', true)
		.attr('min', 1)
		.attr('max', 100)
		.property('value', 10)

	paramSpan.selectAll(`:not(.${elm.select('[name=method]').property('value')})`).style('display', 'none')

	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(cb => {
		const method = elm.select('[name=method]').property('value')
		const param = {
			sigma: +paramSpan.select('[name=sigma]').property('value'),
			k: +paramSpan.select('[name=k_nearest]').property('value'),
		}
		model = new SpectralClustering(method, param)
		model.init(platform.datas.x, () => {
			runSpan.selectAll('input').attr('disabled', null)
			cb && cb()
		})
		elm.select('[name=clusternumber]').text(model.size)
		runSpan.selectAll('input').attr('disabled', true)
	})
	const runSpan = elm.append('span')
	runSpan
		.append('input')
		.attr('type', 'button')
		.attr('value', 'Add cluster')
		.on('click', () => {
			model.add()
			platform.fit((tx, ty, pred_cb) => {
				let pred = model.predict()
				pred_cb(pred)
			})
			elm.select('[name=clusternumber]').text(model.size)
		})
	runSpan.append('span').attr('name', 'clusternumber').text('0')
	runSpan.append('span').text(' clusters')
	runSpan
		.append('input')
		.attr('type', 'button')
		.attr('value', 'Clear cluster')
		.on('click', () => {
			model.clear()
			elm.select('[name=clusternumber]').text('0')
		})
	slbConf
		.step(cb => {
			if (model.size === 0) {
				return
			}
			platform.fit((tx, ty, pred_cb) => {
				model.fit()
				let pred = model.predict()
				pred_cb(pred)
			})
			cb && cb()
		})
		.epoch(() => model.epoch)
	runSpan.selectAll('input').attr('disabled', true)
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Then, click "Add cluster". Finally, click "Step" button repeatedly.'
	dispSpectral(platform.setting.ml.configElement, platform)
}
