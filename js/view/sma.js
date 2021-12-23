import SMARegression from '../../lib/model/sma.js'

var dispSMA = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const model = new SMARegression()
			model.fit(
				tx.map(v => v[0]),
				ty.map(v => v[0])
			)
			platform.predict((px, pred_cb) => {
				pred_cb(model.predict(px.map(v => v[0])))
			}, 1)
		})
	}

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
	dispSMA(platform.setting.ml.configElement, platform)
}
