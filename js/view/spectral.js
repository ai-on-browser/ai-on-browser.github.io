import SpectralClustering from '../../lib/model/spectral.js'
import Controller from '../controller.js'

var dispSpectral = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Spectral clustering (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Spectral_clustering',
	}
	const controller = new Controller(platform)
	let model = null

	const method = controller.select(['rbf', 'knn']).on('change', () => {
		const value = method.value
		paramSpan.selectAll('*').style('display', 'none')
		paramSpan.selectAll(`.${value}`).style('display', 'inline')
	})
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

	paramSpan.selectAll(`:not(.${method.value})`).style('display', 'none')

	const slbConf = controller.stepLoopButtons().init(() => {
		const param = {
			sigma: +paramSpan.select('[name=sigma]').property('value'),
			k: +paramSpan.select('[name=k_nearest]').property('value'),
		}
		model = new SpectralClustering(method.value, param)
		model.init(platform.trainInput)
		elm.select('[name=clusternumber]').text(model.size)
		runSpan.selectAll('input').attr('disabled', null)
	})
	const runSpan = elm.append('span')
	runSpan
		.append('input')
		.attr('type', 'button')
		.attr('value', 'Add cluster')
		.on('click', () => {
			model.add()
			let pred = model.predict()
			platform.trainResult = pred.map(v => v + 1)
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
			model.fit()
			let pred = model.predict()
			platform.trainResult = pred.map(v => v + 1)
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
