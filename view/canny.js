import Canny from '../model/canny.js'

var dispCanny = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const th1 = +elm.select('[name=th1]').property('value')
			const th2 = +elm.select('[name=th2]').property('value')
			const model = new Canny(th1, th2)
			let y = model.predict(tx)
			pred_cb(y.flat())
		}, 1)
	}

	elm.append('span').text(' big threshold ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'th1')
		.attr('value', 200)
		.attr('min', 0)
		.attr('max', 255)
		.on('change', fitModel)
	elm.append('span').text(' small threshold ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'th2')
		.attr('value', 80)
		.attr('min', 0)
		.attr('max', 255)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispCanny(platform.setting.ml.configElement, platform)
}
