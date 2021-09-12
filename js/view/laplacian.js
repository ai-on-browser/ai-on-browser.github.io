import Laplacian from '../../lib/model/laplacian.js'

var dispLaplacian = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const th = +elm.select('[name=th]').property('value')
			const near = +elm.select('[name=near]').property('value')
			const model = new Laplacian(th, near)
			let y = model.predict(tx)
			pred_cb(y.flat())
		}, 1)
	}

	elm.append('span').text('Near ')
	elm.append('select')
		.attr('name', 'near')
		.on('change', fitModel)
		.selectAll('option')
		.data(['4', '8'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text(' threshold ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'th')
		.attr('value', 50)
		.attr('min', 0)
		.attr('max', 255)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispLaplacian(platform.setting.ml.configElement, platform)
}
