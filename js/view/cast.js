import CAST from '../../lib/model/cast.js'

var dispCAST = function (elm, platform) {
	const fitModel = cb => {
		platform.fit((tx, ty, pred_cb) => {
			const t = +elm.select('[name=t]').property('value')
			const model = new CAST(t)
			model.fit(tx)
			const pred = model.predict()
			pred_cb(pred.map(v => v + 1))
			elm.select('[name=clusters]').text(model.size)
			cb && cb()
		})
	}

	elm.append('span').text(' t ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 't')
		.attr('min', 0)
		.attr('max', 1)
		.attr('value', 0.95)
		.attr('step', 0.01)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispCAST(platform.setting.ml.configElement, platform)
}
