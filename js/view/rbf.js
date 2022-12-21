import RadialBasisFunctionNetwork from '../../lib/model/rbf.js'

var dispRBF = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Radial basis function (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Radial_basis_function',
	}
	const calcRBF = function () {
		const rbf = elm.select('[name=rbf]').property('value')
		const l = +elm.select('[name=l]').property('value')
		const e = +elm.select('[name=e]').property('value')
		let model = new RadialBasisFunctionNetwork(rbf, e, l)
		model.fit(platform.trainInput, platform.trainOutput)
		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	elm.append('span').text('RBF ')
	elm.append('select')
		.attr('name', 'rbf')
		.selectAll('option')
		.data(['linear', 'gaussian', 'multiquadric', 'inverse quadratic', 'inverse multiquadric', 'thin plate', 'bump'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text(' e = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'e')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.1)
	if (platform.task === 'IN') {
		elm.append('input').attr('type', 'hidden').attr('name', 'l').attr('value', 0)
	} else {
		elm.append('span').text(' l = ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'l')
			.attr('value', 0.1)
			.attr('min', 0)
			.attr('max', 10)
			.attr('step', 0.1)
	}
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcRBF)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispRBF(platform.setting.ml.configElement, platform)
}
