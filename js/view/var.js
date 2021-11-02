import VAR from '../../lib/model/var.js'

var dispVAR = function (elm, platform) {
	const fitModel = () => {
		const p = +elm.select('[name=p]').property('value')
		const c = +elm.select('[name=c]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new VAR(p)
			model.fit(tx)
			const pred = model.predict(tx, c)
			pred_cb(pred)
		})
	}

	elm.append('span').text('p')
	elm.append('input').attr('type', 'number').attr('name', 'p').attr('min', 1).attr('max', 1000).attr('value', 1)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
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
	dispVAR(platform.setting.ml.configElement, platform)
}
