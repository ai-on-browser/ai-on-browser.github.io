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
	let pcb = null
	let valueScale = 1
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 8
		let x = platform.trainInput
		if (platform.task === 'DN') {
			x = [x.flat(2)]
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
			y = model.predict(y)
			pcb = p => platform.testResult(p[0].map(v => v * valueScale))
			pcb(y)
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
				pcb = p => platform.testResult(p[0].map(v => v * valueScale))
				pcb(y)
			})
			.step(() => {
				if (!model) return
				y = model.predict(y)
				pcb(y)
			})
	}
}
