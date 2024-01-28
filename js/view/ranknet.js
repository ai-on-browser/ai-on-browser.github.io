import RankNet from '../../lib/model/ranknet.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ml.reference = {
		author: 'C. Burges, T. Shaked, E. Renshaw, A. Lazier, M. Deeds, N. Hamilton, G. Hullender',
		title: 'Learning to Rank using Gradient Descent',
		year: 2005,
	}
	const controller = new Controller(platform)

	let model = null
	const fitModel = () => {
		if (!model) {
			return
		}
		const x = platform.trainInput
		const t = platform.trainOutput
		const x1 = []
		const x2 = []
		const comp = []
		for (let i = 0; i < x.length; i++) {
			for (let j = Math.max(0, i - 5); j < Math.min(x.length, i + 5); j++) {
				if (i === j) continue
				x1.push(x[i])
				x2.push(x[j])
				comp.push(Math.sign(t[i] - t[j]))
			}
		}

		model.fit(x1, x2, comp)
		const pred = model.predict(platform.testInput(4))
		const min = pred.reduce((m, v) => Math.min(m, v), Infinity)
		platform.testResult(pred.map(v => v - min + 1))
	}

	const hidden_sizes = controller.array({
		label: ' Hidden Layers ',
		type: 'number',
		values: [10],
		default: 10,
		min: 1,
		max: 100,
	})
	const activation = controller.select({
		label: ' Activation ',
		values: ['sigmoid', 'tanh', 'relu', 'identity'],
	})
	const rate = controller.input.number({ label: ' Learning rate ', value: 0.1, min: 0, max: 100, step: 0.1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = new RankNet(hidden_sizes.value, activation.value, rate.value)
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
