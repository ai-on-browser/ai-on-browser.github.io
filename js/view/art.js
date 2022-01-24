import ART from '../../lib/model/art.js'

var dispART = function (elm, platform) {
	const fitModel = cb => {
		platform.fit((tx, ty, fit_cb) => {
			const t = +elm.select('[name=t]').property('value')
			const model = new ART(t)
			model.fit(tx)
			const pred = model.predict(tx)
			fit_cb(pred.map(v => v + 1))
			elm.select('[name=clusters]').text(model.size)
			platform.predict((px, pred_cb) => {
				const pred = model.predict(px)
				pred_cb(pred.map(v => (v < 0 ? -1 : v + 1)))
			}, 2)
			cb && cb()
		})
	}

	elm.append('span').text(' t ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 't')
		.attr('min', 0)
		.attr('max', 100)
		.attr('value', 4)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispART(platform.setting.ml.configElement, platform)
}
