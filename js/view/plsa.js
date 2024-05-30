import PLSA from '../../lib/model/plsa.js'
import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		const resolution = 20
		const x = Matrix.fromArray(platform.trainInput)
		const max = x.max(0).value
		const min = x.min(0).value
		const tx = platform.trainInput.map(d => {
			return d.map((v, i) => {
				return Math.floor(((v - min[i]) / (max[i] - min[i])) * (resolution - 1)) + i * resolution
			})
		})
		if (!model) {
			model = new PLSA(topics.value)
			model.init(tx)
		}
		model.fit()
		platform.trainResult = model.predict().map(v => v + 1)
	}

	const topics = controller.input.number({ label: 'topics', min: 1, max: 100, value: 5 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
