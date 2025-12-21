import QuadraticDiscriminant from '../../lib/model/quadratic_discriminant.js'

var dispQuadraticDiscriminant = (elm, platform) => {
	platform.setting.ml.reference = {
		author: 'B. Ghojogh, M. Crowley',
		title: 'Linear and Quadratic Discriminant Analysis: Tutorial',
		year: 2010,
	}
	const calc = () => {
		const m = new QuadraticDiscriminant()
		m.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const categories = m.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispQuadraticDiscriminant(platform.setting.ml.configElement, platform)
}
