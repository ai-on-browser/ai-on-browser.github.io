import { ContinuousHMM, HMMClassifier } from '../../lib/model/hmm.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

var dispHMM = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const fitModel = function (cb) {
		const states = +elm.select('[name=state]').property('value')
		if (platform.task === 'CP') {
			if (!model) {
				model = new ContinuousHMM(states, platform.trainInput[0].length)
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
				model = new ContinuousHMM(states, 1)
			}
			model.fit(platform.trainInput, true)
			const pred = model.probability(platform.testInput())
			const min = Math.min(...pred)
			const max = Math.max(...pred)
			platform.testResult(pred.map(v => specialCategory.density((v - min) / (max - min))))
		} else if (platform.task === 'GR') {
			if (!model) {
				model = new ContinuousHMM(states, 1)
			}
			model.fit(platform.trainInput, true)
			const gen = model.generate(platform.trainInput.length, 2)
			platform.trainResult = gen.map(v => v.map(r => r[0]))
		} else {
			if (!model) {
				model = new HMMClassifier(new Set(platform.trainOutput.map(v => v[0])), states)
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

	elm.append('span').text(' state = ')
	elm.append('input').attr('type', 'number').attr('name', 'state').attr('value', 3).attr('min', 2).attr('max', 100)
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
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispHMM(platform.setting.ml.configElement, platform)
}
