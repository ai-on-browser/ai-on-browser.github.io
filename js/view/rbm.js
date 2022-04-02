import { RBM, GBRBM } from '../../lib/model/rbm.js'
import Controller from '../controller.js'

var dispRBM = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	let y = null
	let pcb = null
	let valueScale = 1
	const fitModel = cb => {
		const orgStep = platform._step
		platform._step = 8
		let x = platform.trainInput
		if (platform.task === 'DN') {
			x = [x.flat(2)]
		}
		if (!model) {
			const type = elm.select('[name=type]').property('value')
			const hiddens = +elm.select('[name=hiddens]').property('value')
			const lr = +elm.select('[name=lr]').property('value')
			if (type === 'RBM') {
				model = new RBM(hiddens, lr)
				valueScale = 255
			} else {
				model = new GBRBM(hiddens, lr, platform.task === 'DN')
				valueScale = 1
			}
		}
		model.fit(x)

		if (platform.task === 'GR') {
			platform.trainResult = model.predict(x)
			cb && cb()
		} else {
			y = [platform.testInput(8).flat(2)]
			y = model.predict(y)
			pcb = p => platform.testResult(p[0].map(v => v * valueScale))
			pcb(y)
			cb && cb()
		}
		platform._step = orgStep
	}

	if (platform.task === 'GR') {
		elm.append('input').attr('type', 'hidden').attr('name', 'type').attr('value', 'GBRBM')
	} else {
		elm.append('select')
			.attr('name', 'type')
			.selectAll('option')
			.data(['RBM', 'GBRBM'])
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
	}
	elm.append('span').text(' hidden nodes ')
	elm.append('input').attr('type', 'number').attr('name', 'hiddens').attr('min', 1).attr('max', 100).attr('value', 10)
	elm.append('span').text(' learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'lr')
		.attr('min', 0.01)
		.attr('max', 10)
		.attr('step', 0.01)
		.attr('value', 0.01)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()

	if (platform.task !== 'GR') {
		elm.append('epan').text(' Estimate')
		controller
			.stepLoopButtons()
			.init(() => {
				if (!model) return
				y = [platform.testInput(8).flat(2)]
				pcb = p => platform.testResult(p[0].map(v => v * valueScale))
				pcb(y)
			})
			.step(cb => {
				if (!model) return
				y = model.predict(y)
				pcb(y)
				cb && cb()
			})
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button. Then, click "estimate" button.'
	dispRBM(platform.setting.ml.configElement, platform)
}
