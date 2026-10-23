import { GBRBM, RBM } from '../../lib/model/rbm.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button. Then, click "estimate" button.'
	platform.setting.ml.reference = {
		title: 'Restricted Boltzmann machine (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Restricted_Boltzmann_machine',
	}
	const controller = new Controller(platform)
	let model = null
	let y = null
	let valueScale = 1

	const binalize = x => {
		let max = -Infinity
		let min = Infinity
		for (let k = 0; k < x.length; k++) {
			for (let i = 0; i < x[k].length; i++) {
				max = Math.max(max, x[k][i])
				min = Math.min(min, x[k][i])
			}
		}
		return x.map(v => v.map(a => (a < (max + min) / 2 ? 0 : 1)))
	}

	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 8
		let x = platform.trainInput
		if (platform.task === 'DN') {
			x = [x.flat(2)]
		}
		if (type.value === 'RBM') {
			x = binalize(x)
		}
		if (!model) {
			if (type.value === 'RBM') {
				model = new RBM(hiddens.value, lr.value)
				valueScale = 255
			} else {
				model = new GBRBM(hiddens.value, lr.value, platform.task === 'DN')
				valueScale = 1
			}
		}
		model.fit(x)

		if (platform.task === 'GR') {
			platform.trainResult = model.predict(x)
		} else {
			y = [platform.testInput(8).flat(2)]
			if (type.value === 'RBM') {
				y = binalize(y)
			}
			y = model.predict(y)
			platform.testResult(y[0].map(v => v * valueScale))
		}
		platform._step = orgStep
	}

	let type = null
	if (platform.task === 'GR') {
		type = controller.input({ type: 'hidden', value: 'GBRBM' })
	} else {
		type = controller.select(['RBM', 'GBRBM'])
	}
	const hiddens = controller.input.number({ label: ' hidden nodes ', min: 1, max: 100, value: 10 })
	const lr = controller.input.number({ label: ' learning rate ', min: 0.01, max: 10, step: 0.01, value: 0.01 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()

	if (platform.task !== 'GR') {
		controller.text(' Estimate')
		controller
			.stepLoopButtons()
			.init(() => {
				if (!model) return
				y = [platform.testInput(8).flat(2)]
				if (type.value === 'RBM') {
					y = binalize(y)
				}
				platform.testResult(y[0].map(v => v * valueScale))
			})
			.step(() => {
				if (!model) return
				y = model.predict(y)
				platform.testResult(y[0].map(v => v * valueScale))
			})
	}
}
