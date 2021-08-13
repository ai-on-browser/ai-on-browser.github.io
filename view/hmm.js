import { ContinuousHMM, HMMClassifier } from '../model/hmm.js'

var dispHMM = function (elm, platform) {
	let model = null
	const fitModel = function (cb) {
		platform.fit((tx, ty, pred_cb, thup) => {
			const states = +elm.select('[name=state]').property('value')
			if (platform.task === 'CP') {
				if (!model) {
					model = new ContinuousHMM(states, tx[0].length)
				}
				const x = [tx]
				model.fit(x, true)
				const p = model.bestPath(x)[0]
				const d = []
				for (let i = 0; i < p.length - 1; i++) {
					d.push(p[i] !== p[i + 1])
				}
				pred_cb(d)
			} else if (platform.task === 'DE') {
				if (!model) {
					model = new ContinuousHMM(states, 1)
				}
				model.fit(tx, true)
				platform.predict((px, pred_cb) => {
					const pred = model.probability(px)
					const min = Math.min(...pred)
					const max = Math.max(...pred)
					pred_cb(pred.map(v => specialCategory.density((v - min) / (max - min))))
				})
			} else if (platform.task === 'GR') {
				if (!model) {
					model = new ContinuousHMM(states, 1)
				}
				model.fit(tx, true)
				const gen = model.generate(tx.length, 2)
				pred_cb(gen.map(v => v.map(r => r[0])))
			} else {
				if (!model) {
					model = new HMMClassifier(new Set(ty.map(v => v[0])), states)
				}
				model.fit(tx, ty)

				platform.predict((px, pred_cb) => {
					const p = model.predict(px)
					pred_cb(p)
				}, 5)
			}
			cb && cb()
		})
	}

	elm.append('span').text(' state = ')
	elm.append('input').attr('type', 'number').attr('name', 'state').attr('value', 3).attr('min', 2).attr('max', 100)
	platform.setting.ml.controller
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
