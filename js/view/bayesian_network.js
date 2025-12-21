import BayesianNetwork from '../../lib/model/bayesian_network.js'
import Matrix from '../../lib/util/matrix.js'

var dispQuadraticDiscriminant = (elm, platform) => {
	const calc = () => {
		let tx = platform.trainInput
		const ty = platform.trainOutput
		const discrete = +elm.select('[name=discrete]').property('value')
		const x = Matrix.fromArray(tx)
		const max = x.max()
		const min = x.min()
		tx = tx.map(r => r.map(v => Math.floor(((v - min) / (max - min)) * discrete)))
		tx = tx.map((v, i) => [...v, ...ty[i]])
		const model = new BayesianNetwork(1)
		model.fit(tx)
		const classes = [...new Set(ty.map(v => v[0]))]

		let px = platform.testInput(3)
		px = px.map(r => r.map(v => Math.floor(((v - min) / (max - min)) * discrete)))
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

	elm.append('span').text(' discrete = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'discrete')
		.attr('value', 10)
		.attr('min', 2)
		.attr('max', 100)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispQuadraticDiscriminant(platform.setting.ml.configElement, platform)
}
