import ROCK from '../../lib/model/rock.js'

var dispROCK = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const th = +elm.select('[name=th]').property('value')
			const k = +elm.select('[name=k]').property('value')
			const model = new ROCK(th)
			model.fit(tx)
			const pred = model.predict(k)
			pred_cb(pred.map(v => v + 1))
		})
	}

	elm.append('span').text(' threshold ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'th')
		.attr('min', 0)
		.attr('max', 1)
		.attr('value', 0.95)
		.attr('step', 0.01)
	elm.append('span').text(' k ')
	elm.append('input').attr('type', 'number').attr('name', 'k').attr('min', 1).attr('max', 100).attr('value', 3)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => {
			fitModel()
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispROCK(platform.setting.ml.configElement, platform)
}
