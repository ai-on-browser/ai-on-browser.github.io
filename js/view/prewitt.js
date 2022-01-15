import Prewitt from '../../lib/model/prewitt.js'

var dispPrewitt = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const th = +elm.select('[name=th]').property('value')
			const model = new Prewitt(th)
			for (let i = 0; i < tx.length; i++) {
				for (let j = 0; j < tx[i].length; j++) {
					tx[i][j] = tx[i][j].reduce((s, v) => s + v, 0) / tx[i][j].length
				}
			}
			let y = model.predict(tx)
			pred_cb(y.flat())
		}, 1)
	}

	elm.append('span').text(' threshold ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'th')
		.attr('value', 200)
		.attr('min', 0)
		.attr('max', 255)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispPrewitt(platform.setting.ml.configElement, platform)
}
