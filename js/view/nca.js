import NeighbourhoodComponentsAnalysis from '../../lib/model/nca.js'
import Controller from '../controller.js'

var dispNCA = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Neighbourhood components analysis (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Neighbourhood_components_analysis',
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		const dim = platform.dimension
		if (!model) {
			const lr = +elm.select('[name=l]').property('value')
			if (platform.task === 'FS') {
				model = new NeighbourhoodComponentsAnalysis(null, lr)
			} else {
				model = new NeighbourhoodComponentsAnalysis(dim, lr)
			}
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		if (platform.task === 'FS') {
			const importance = model.importance().map((v, i) => [v, i])
			importance.sort((a, b) => b[0] - a[0])
			const impidx = importance.slice(0, dim).map(im => im[1])
			platform.trainResult = platform.trainInput.map(d => impidx.map(i => d[i]))
		} else {
			let y = model.predict(platform.trainInput)
			platform.trainResult = y
		}
		cb && cb()
	}
	elm.append('span').text(' learning rate ')
	elm.append('input').attr('type', 'number').attr('name', 'l').attr('max', 10).attr('step', 0.1).attr('value', 0.1)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Step" button.'
	dispNCA(platform.setting.ml.configElement, platform)
}
