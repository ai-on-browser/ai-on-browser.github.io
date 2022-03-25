import ARMA from '../../lib/model/arma.js'
import Controller from '../controller.js'

var dispARMA = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		const p = +elm.select('[name=p]').property('value')
		const q = +elm.select('[name=q]').property('value')
		const c = +elm.select('[name=c]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			if (!model) {
				model = []
				for (let d = 0; d < tx[0].length; d++) {
					model[d] = new ARMA(p, q)
				}
			}
			const pred = []
			for (let i = 0; i < c; pred[i++] = []);
			for (let d = 0; d < tx[0].length; d++) {
				const xd = tx.map(v => v[d])
				model[d].fit(xd)
				const p = model[d].predict(xd, c)
				for (let i = 0; i < pred.length; i++) {
					pred[i][d] = p[i]
				}
			}
			pred_cb(pred)
			cb && cb()
		})
	}

	elm.append('span').text('p')
	elm.append('input').attr('type', 'number').attr('name', 'p').attr('min', 0).attr('max', 1000).attr('value', 1)
	elm.append('span').text('q')
	elm.append('input').attr('type', 'number').attr('name', 'q').attr('min', 0).attr('max', 1000).attr('value', 1)

	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform._plotter.reset()
		})
		.step(fitModel)
		.epoch()

	elm.append('span').text('predict count')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 100)
		.on('change', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	dispARMA(platform.setting.ml.configElement, platform)
}
