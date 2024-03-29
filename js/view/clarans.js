import CLARANS from '../../lib/model/clarans.js'
import Controller from '../controller.js'

var dispCLARANS = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		if (!model) {
			const clusters = +elm.select('[name=clusters]').property('value')
			model = new CLARANS(clusters)
			model.init(platform.trainInput)
		}
		const maxneighbor = +elm.select('[name=maxneighbor]').property('value')
		model.fit(1, maxneighbor)
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		cb && cb()
	}

	elm.append('span').text(' clusters ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'clusters')
		.attr('min', 1)
		.attr('max', 1000)
		.attr('value', 10)
	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
	})
	elm.append('span').text(' maxneighbor ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'maxneighbor')
		.attr('min', 1)
		.attr('max', 1000)
		.attr('value', 100)
	slbConf.step(fitModel).epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispCLARANS(platform.setting.ml.configElement, platform)
}
