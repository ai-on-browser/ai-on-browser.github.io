import GPLVM from '../../lib/model/gplvm.js'

var dispGPLVM = function (elm, platform) {
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			if (!model) {
				const dim = platform.dimension
				const alpha = +elm.select('[name=alpha]').property('value')
				const sigma = +elm.select('[name=sigma]').property('value')
				const ez = +elm.select('[name=ez]').property('value')
				const ea = +elm.select('[name=ea]').property('value')
				const ep = +elm.select('[name=ep]').property('value')
				model = new GPLVM(dim, alpha, ez, ea, ep, 'gaussian', [1.0, sigma])
				model.init(tx)
			}
			model.fit()
			const y = model.predict(tx)
			pred_cb(y)
		})
	}

	const kernelElm = elm.append('span')
	kernelElm
		.append('select')
		.attr('name', 'kernel')
		.selectAll('option')
		.data(['gaussian'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	const gauss_sigma = kernelElm.append('span')
	gauss_sigma
		.append('span')
		.text(' sigma = ')
		.append('input')
		.attr('type', 'number')
		.attr('name', 'sigma')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.1)
	elm.append('span')
		.text(' alpha = ')
		.append('input')
		.attr('type', 'number')
		.attr('name', 'alpha')
		.attr('value', 0.05)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.01)
	elm.append('span')
		.text(' ez = ')
		.append('input')
		.attr('type', 'number')
		.attr('name', 'ez')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.1)
	elm.append('span')
		.text(' ea = ')
		.append('input')
		.attr('type', 'number')
		.attr('name', 'ea')
		.attr('value', 0.005)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.001)
	elm.append('span')
		.text(' ep = ')
		.append('input')
		.attr('type', 'number')
		.attr('name', 'ep')
		.attr('value', 0.02)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.001)
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispGPLVM(platform.setting.ml.configElement, platform)
}
