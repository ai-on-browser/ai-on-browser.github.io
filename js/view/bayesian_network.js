import BayesianNetwork from '../../lib/model/bayesian_network.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = { preprocess: 'discrete' }
	const controller = new Controller(platform)
	const calc = () => {
		let tx = platform.trainInput
		const ty = platform.trainOutput
		tx = tx.map((v, i) => [...v, ...ty[i]])
		const model = new BayesianNetwork(1)
		model.fit(tx)
		const classes = [...new Set(ty.map(v => v[0]))]

		const px = platform.testInput(3)
		const t = []
		for (let i = 0; i < px.length; i++) {
			for (let k = 0; k < classes.length; k++) {
				t.push([...px[i], classes[k]])
			}
		}
		const prob = model.probability(t)
		const categories = []
		for (let i = 0, n = 0; i < prob.length; n++) {
			let max_p = 0
			categories[n] = -1
			for (let k = 0; k < classes.length; k++, i++) {
				if (prob[i] > max_p) {
					max_p = prob[i]
					categories[n] = classes[k]
				}
			}
		}
		platform.testResult(categories)
	}

	controller.input.button('Calculate').on('click', calc)
}
