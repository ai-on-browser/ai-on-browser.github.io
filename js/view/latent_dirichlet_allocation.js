import LatentDirichletAllocation from '../../lib/model/latent_dirichlet_allocation.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	platform.setting.ml.require = { preprocess: 'discrete' }
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (!model) {
			let tx = platform.trainInput
			let max = -Infinity
			for (let i = 0; i < tx.length; i++) {
				for (let j = 0; j < tx[i].length; j++) {
					max = Math.max(tx[i][j])
				}
			}
			tx = tx.map(d => d.map((v, i) => v + i * (max + 1)))
			model = new LatentDirichletAllocation(topics.value)
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
