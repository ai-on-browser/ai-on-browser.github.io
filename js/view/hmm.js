import { ContinuousHMM, HMMClassifier } from '../../lib/model/hmm.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		title: 'Hidden Markov model (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Hidden_Markov_model',
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = function (cb) {
		if (platform.task === 'CP') {
			if (!model) {
				model = new ContinuousHMM(states.value)
			}
			const x = [platform.trainInput]
			model.fit(x, true)
			const p = model.bestPath(x)[0]
			const d = []
			for (let i = 0; i < p.length - 1; i++) {
				d.push(p[i] !== p[i + 1])
			}
			platform.trainResult = d
		} else if (platform.task === 'DE') {
			if (!model) {
				model = new ContinuousHMM(states.value)
			}
			model.fit(platform.trainInput, true)
			const pred = model.probability(platform.testInput())
			const min = Math.min(...pred)
			const max = Math.max(...pred)
			platform.testResult(pred.map(v => specialCategory.density((v - min) / (max - min))))
		} else if (platform.task === 'GR') {
			if (!model) {
				model = new ContinuousHMM(states.value)
			}
			model.fit(platform.trainInput, true)
			const gen = model.generate(platform.trainInput.length, 2)
			platform.trainResult = gen.map(v => v.map(r => r[0]))
		} else {
			if (!model) {
				model = new HMMClassifier(states.value)
			}
			model.fit(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)

			const p = model.predict(platform.testInput(5))
			platform.testResult(p.map(v => v ?? -1))
		}
		cb && cb()
	}

	const states = controller.input.number({ label: ' state = ', min: 2, max: 100, value: 3 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
