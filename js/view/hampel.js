import HampelFilter from '../../lib/model/hampel.js'

var dispHampel = function (elm, platform) {
	const fitModel = () => {
		const k = +elm.select('[name=k]').property('value')
		const th = +elm.select('[name=th]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const model = new HampelFilter(k, th)
			const pred = []
			for (let i = 0; i < tx.length; pred[i++] = []);
			for (let d = 0; d < tx[0].length; d++) {
				const xd = tx.map(v => v[d])
				const p = model.predict(xd)
				for (let i = 0; i < pred.length; i++) {
					pred[i][d] = p[i]
				}
			}
			pred_cb(pred)
		})
	}

	elm.append('span').text('k')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 3)
		.on('change', fitModel)
	elm.append('span').text(' threshold ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'th')
		.attr('min', 0)
		.attr('max', 10)
		.attr('value', 3)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispHampel(platform.setting.ml.configElement, platform)
}
