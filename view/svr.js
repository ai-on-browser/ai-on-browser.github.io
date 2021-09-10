import SVR from '../lib/model/svr.js'

var dispSVR = function (elm, platform) {
	let model = null
	let learn_epoch = 0

	const calcSVR = function (cb) {
		platform.fit((tx, ty, fit_cb) => {
			let iteration = +elm.select('[name=iteration]').property('value')
			for (let i = 0; i < iteration; i++) {
				model.fit()
			}
			learn_epoch += iteration
			platform.predict((px, pred_cb) => {
				const pred = model.predict(px)
				pred_cb(pred)
				cb && cb()
			}, 8)
		})
	}

	elm.append('select')
		.attr('name', 'kernel')
		.on('change', function () {
			const k = d3.select(this).property('value')
			if (k == 'gaussian') {
				elm.select('input[name=gamma]').style('display', 'inline')
			} else {
				elm.select('input[name=gamma]').style('display', 'none')
			}
		})
		.selectAll('option')
		.data(['gaussian', 'linear'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'gamma')
		.attr('value', 0.1)
		.attr('min', 0.1)
		.attr('max', 10.0)
		.attr('step', 0.1)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		const kernel = elm.select('[name=kernel]').property('value')
		const args = []
		if (kernel == 'gaussian') {
			args.push(+elm.select('input[name=gamma]').property('value'))
		}
		platform.fit((tx, ty) => {
			model = new SVR(kernel, args)
			model.init(tx, ty)
		})
		learn_epoch = 0
		platform.init()
	})
	elm.append('span').text(' Iteration ')
	elm.append('select')
		.attr('name', 'iteration')
		.selectAll('option')
		.data([1, 10, 100, 1000])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	slbConf.step(calcSVR).epoch(() => learn_epoch)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSVR(platform.setting.ml.configElement, platform)
}
