import LOWESS from '../model/lowess.js'

var dispLOWESS = function (elm, platform) {
	const fitModel = cb => {
		platform.fit((tx, ty) => {
			const model = new LOWESS()
			model.fit(tx, ty)
			platform.predict((px, pred_cb) => {
				pred_cb(model.predict(px))
			}, 10)
		})
	}

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLOWESS(platform.setting.ml.configElement, platform)
}
