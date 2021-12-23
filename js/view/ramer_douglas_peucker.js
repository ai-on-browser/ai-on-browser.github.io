import RamerDouglasPeucker from '../../lib/model/ramer_douglas_peucker.js'

var dispRDP = function (elm, platform) {
	const fitModel = cb => {
		platform.fit((tx, ty) => {
			const e = +elm.select('[name=e]').property('value')
			const model = new RamerDouglasPeucker(e)
			model.fit(
				tx.map(v => v[0]),
				ty.map(v => v[0])
			)
			platform.predict((px, pred_cb) => {
				pred_cb(model.predict(px.map(v => v[0])))
			}, 1)
		})
	}

	elm.append('span').text(' e ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'e')
		.attr('value', 0.1)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispRDP(platform.setting.ml.configElement, platform)
}
