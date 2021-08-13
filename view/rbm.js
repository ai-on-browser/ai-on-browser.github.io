import { RBM, GBRBM } from '../model/rbm.js'

var dispRBM = function (elm, platform) {
	let model = null
	let y = null
	let pcb = null
	let valueScale = 1
	const fitModel = cb => {
		platform.fit((tx, ty, pred_cb) => {
			let x = tx
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
				pred_cb(model.predict(x))
				cb && cb()
			} else {
				platform.predict((px, pred_cb) => {
					y = [px.flat(2)]
					y = model.predict(y)
					pcb = p => pred_cb(p[0].map(v => v * valueScale))
					pcb(y)
					cb && cb()
				}, 8)
			}
		}, 8)
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
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()

	if (platform.task !== 'GR') {
		elm.append('epan').text(' Estimate')
		platform.setting.ml.controller
			.stepLoopButtons()
			.init(() => {
				if (!model) return
				platform.predict((px, pred_cb) => {
					y = [px.flat(2)]
					pcb = p => pred_cb(p[0].map(v => v * valueScale))
					pcb(y)
				}, 8)
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
