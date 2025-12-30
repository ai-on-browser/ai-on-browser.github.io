import SmoothstepInterpolation from '../../lib/model/smoothstep.js'

var dispSmoothstep = (elm, platform) => {
	platform.setting.ml.reference = {
		title: 'Smoothstep (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Smoothstep',
	}
	const calcSmoothstep = () => {
		const n = +elm.select('[name=n]').property('value')
		const model = new SmoothstepInterpolation(n)
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(1).map(v => v[0]))
		platform.testResult(pred)
	}

	elm.append('span').text(' n ')
	elm.append('input').attr('type', 'number').attr('name', 'n').attr('value', 1).attr('min', 0).attr('max', 100)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcSmoothstep)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispSmoothstep(platform.setting.ml.configElement, platform)
}
