import OCSVM from '../lib/model/ocsvm.js'

var dispOCSVM = function (elm, platform) {
	let model = null
	let learn_epoch = 0

	const calcOCSVM = function (cb) {
		platform.fit((tx, ty, fit_cb) => {
			let iteration = +elm.select('[name=iteration]').property('value')
			for (let i = 0; i < iteration; i++) {
				model.fit()
			}
			learn_epoch += iteration
			platform.predict((px, pred_cb) => {
				px = [].concat(tx, px)
				let pred = model.predict(px)
				const min = Math.min(...pred)
				const max = Math.max(...pred)
				const th = +elm.select('[name=threshold]').property('value')
				pred = pred.map(v => (v - min) / (max - min) < th)
				fit_cb(pred.slice(0, tx.length))
				pred_cb(pred.slice(tx.length))
				cb && cb()
			}, 8)
		})
	}

	elm.append('span').text(' nu ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'nu')
		.attr('value', 0.5)
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.1)
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
		.attr('min', 0.01)
		.attr('max', 10.0)
		.attr('step', 0.01)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		const nu = elm.select('[name=nu]').property('value')
		const kernel = elm.select('[name=kernel]').property('value')
		const args = []
		if (kernel == 'gaussian') {
			args.push(+elm.select('input[name=gamma]').property('value'))
		}
		platform.fit((tx, ty) => {
			model = new OCSVM(nu, kernel, args)
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
	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 0.6)
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.01)
	slbConf.step(calcOCSVM).epoch(() => learn_epoch)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispOCSVM(platform.setting.ml.configElement, platform)
}
