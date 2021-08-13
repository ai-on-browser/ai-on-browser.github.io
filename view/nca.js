import NeighbourhoodComponentsAnalysis from '../model/nca.js'

var dispNCA = function (elm, platform) {
	let model = null
	const fitModel = cb => {
		platform.fit((tx, ty, pred_cb) => {
			const dim = platform.dimension
			if (!model) {
				const lr = +elm.select('[name=l]').property('value')
				if (platform.task === 'FS') {
					model = new NeighbourhoodComponentsAnalysis(null, lr)
				} else {
					model = new NeighbourhoodComponentsAnalysis(dim, lr)
				}
			}
			model.fit(
				tx,
				ty.map(v => v[0])
			)
			if (platform.task === 'FS') {
				const importance = model.importance().map((v, i) => [v, i])
				importance.sort((a, b) => b[0] - a[0])
				const impidx = importance.slice(0, dim).map(im => im[1])
				pred_cb(tx.map(d => impidx.map(i => d[i])))
			} else {
				let y = model.predict(tx)
				pred_cb(y)
			}
			cb && cb()
		})
	}
	elm.append('span').text(' learning rate ')
	elm.append('input').attr('type', 'number').attr('name', 'l').attr('max', 10).attr('step', 0.1).attr('value', 0.1)
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
	platform.setting.ml.usage = 'Click and add data point. Next, click "Step" button.'
	dispNCA(platform.setting.ml.configElement, platform)
}
