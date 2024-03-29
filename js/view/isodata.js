import ISODATA from '../../lib/model/isodata.js'
import Controller from '../controller.js'

var dispISODATA = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		if (!model) {
			const init_k = +elm.select('[name=init_k]').property('value')
			const max_k = +elm.select('[name=max_k]').property('value')
			const min_k = +elm.select('[name=min_k]').property('value')
			const min_n = +elm.select('[name=min_n]').property('value')
			const spl_std = +elm.select('[name=spl_std]').property('value')
			const merge_dist = +elm.select('[name=merge_dist]').property('value')
			model = new ISODATA(init_k, min_k, max_k, min_n, spl_std, merge_dist)
			model.init(platform.trainInput)
		}
		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		elm.select('[name=clusters]').text(model.size)
		platform.centroids(
			model.centroids,
			model.centroids.map((c, i) => i + 1),
			{
				line: true,
			}
		)
		cb && cb()
	}

	elm.append('span').text(' init k ')
	elm.append('input').attr('type', 'number').attr('name', 'init_k').attr('min', 1).attr('max', 100).attr('value', 20)
	elm.append('span').text(' max k ')
	elm.append('input').attr('type', 'number').attr('name', 'max_k').attr('min', 2).attr('max', 100).attr('value', 100)
	elm.append('span').text(' min k ')
	elm.append('input').attr('type', 'number').attr('name', 'min_k').attr('min', 1).attr('max', 100).attr('value', 2)
	elm.append('span').text(' min n ')
	elm.append('input').attr('type', 'number').attr('name', 'min_n').attr('min', 1).attr('max', 100).attr('value', 2)
	elm.append('span').text(' split std ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'spl_std')
		.attr('min', 0.01)
		.attr('max', 100)
		.attr('step', 0.01)
		.attr('value', 1)
	elm.append('span').text(' merge dist ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'merge_dist')
		.attr('min', 0.01)
		.attr('max', 10)
		.attr('step', 0.01)
		.attr('value', 0.1)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			elm.select('[name=clusters]').text(0)
			platform.init()
		})
		.step(fitModel)
		.epoch()
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispISODATA(platform.setting.ml.configElement, platform)
}
