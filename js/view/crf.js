import Matrix from '../../lib/util/matrix.js'
import CRF from '../../lib/model/crf.js'
import Controller from '../controller.js'

var dispCRF = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	let epoch = 0
	const fitModel = function (cb) {
		platform.fit((tx, ty, pred_cb) => {
			const discrete = +elm.select('[name=discrete]').property('value')
			const iteration = +elm.select('[name=iteration]').property('value')
			if (!model) {
				model = new CRF()
			}
			const x = Matrix.fromArray(tx)
			const max = x.max()
			const min = x.min()
			tx = tx.map(r => r.map(v => Math.floor(((v - min) / (max - min)) * discrete)))
			for (let i = 0; i < iteration; i++) {
				model.fit(
					tx,
					ty.map(v => Array(x.cols).fill(v[0]))
				)
			}
			epoch += iteration
			platform.predict((px, pred_cb) => {
				px = px.map(r => r.map(v => Math.floor(((v - min) / (max - min)) * discrete)))
				const pred = model.predict(px)
				pred_cb(pred.map(v => v[0] ?? -1))
				cb && cb()
			}, 10)
		})
	}

	elm.append('span').text(' discrete = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'discrete')
		.attr('value', 10)
		.attr('min', 2)
		.attr('max', 100)
	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	elm.append('span').text(' iteration ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'iteration')
		.attr('value', 1)
		.attr('min', 1)
		.attr('max', 1000)
	slbConf.step(fitModel).epoch(() => epoch)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispCRF(platform.setting.ml.configElement, platform)
}
