import MarkovSwitching from '../../lib/model/markov_switching.js'

var dispMSM = function (elm, platform) {
	const calcMSM = function (cb) {
		const regime = +elm.select('[name=regime]').property('value')
		const trial = +elm.select('[name=trial]').property('value')
		const model = new MarkovSwitching(regime)
		model.fit(platform.trainInput, 1, trial)
		const threshold = +elm.select('[name=threshold]').property('value')
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred
		platform._plotter.threshold = threshold
		cb && cb()
	}

	elm.append('span').text(' regime = ')
	elm.append('input').attr('type', 'number').attr('name', 'regime').attr('value', 3).attr('min', 2).attr('max', 100)
	elm.append('span').text(' trial = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'trial')
		.attr('value', 10000)
		.attr('min', 1)
		.attr('max', 1.0e8)
	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 0.1)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.01)
		.on('change', () => {
			const threshold = +elm.select('[name=threshold]').property('value')
			platform._plotter.threshold = threshold
		})
	const calcBtn = elm
		.append('input')
		.attr('type', 'button')
		.attr('value', 'Calculate')
		.on('click', () => {
			calcBtn.property('disabled', true)
			setTimeout(() => {
				calcMSM(() => {
					calcBtn.property('disabled', false)
				})
			}, 0)
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispMSM(platform.setting.ml.configElement, platform)
}
