import ARMA from '../../lib/model/arma.js'

var dispARMA = function (elm, platform) {
	let model = null
	const fitModel = cb => {
		const p = +elm.select('[name=p]').property('value')
		const q = +elm.select('[name=q]').property('value')
		const c = +elm.select('[name=c]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			if (!model) {
				model = new ARMA(p, q)
			}
			model.fit(tx.map(v => v[0]))
			const pred = model.predict(
				tx.map(v => v[0]),
				c
			)
			pred_cb(pred.map(v => [v]))
			cb && cb()
		})
	}

	elm.append('span').text('p')
	elm.append('input').attr('type', 'number').attr('name', 'p').attr('min', 0).attr('max', 1000).attr('value', 1)
	elm.append('span').text('q')
	elm.append('input').attr('type', 'number').attr('name', 'q').attr('min', 0).attr('max', 1000).attr('value', 1)

	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			const p = +elm.select('[name=p]').property('value')
			const q = +elm.select('[name=q]').property('value')
			model = new ARMA(p, q)
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
