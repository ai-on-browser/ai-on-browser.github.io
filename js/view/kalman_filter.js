import KalmanFilter from '../../lib/model/kalman_filter.js'

var dispKalmanFilter = function (elm, platform) {
	const task = platform.task
	const fitModel = () => {
		const model = new KalmanFilter()
		const f = model.fit(platform.trainInput)
		if (task === 'TP') {
			const c = +elm.select('[name=c]').property('value')
			const pred = model.predict(c)
			platform.trainResult = pred
		} else {
			platform.trainResult = f
		}
	}

	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	if (task === 'TP') {
		elm.append('span').text('predict count')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'c')
			.attr('min', 1)
			.attr('max', 100)
			.attr('value', 100)
			.on('change', fitModel)
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	dispKalmanFilter(platform.setting.ml.configElement, platform)
}
