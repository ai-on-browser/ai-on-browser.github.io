import LeastTrimmedSquaresRegression from '../lib/model/lts.js'

var dispLTS = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const h = +elm.select('[name=h]').property('value')
			const model = new LeastTrimmedSquaresRegression(h)
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				const pred = model.predict(px)
				pred_cb(pred)
			}, 4)
		})
	}

	elm.append('span').text(' h ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'h')
		.attr('value', 0.9)
		.attr('min', 0.5)
		.attr('max', 1)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLTS(platform.setting.ml.configElement, platform)
}
