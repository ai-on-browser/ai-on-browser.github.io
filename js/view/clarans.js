import CLARANS from '../../lib/model/clarans.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (!model) {
			model = new CLARANS(clusters.value)
			model.init(platform.trainInput)
		}
		model.fit(1, maxneighbor.value)
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
	}

	const clusters = controller.input.number({ label: ' clusters ', min: 1, max: 1000, value: 10 })
	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
	})
	const maxneighbor = controller.input.number({ label: ' maxneighbor ', min: 1, max: 1000, value: 100 })
	slbConf.step(fitModel).epoch()
}
