import S3VM from '../../lib/model/s3vm.js'

var dispS3VM = function (elm, platform) {
	let model = null
	const fitModel = cb => {
		platform.fit((tx, ty, fit_cb) => {
			const learning_rate = +elm.select('[name=learning_rate]').property('value')
			const min_learning_rate = +elm.select('[name=min_learning_rate]').property('value')
			const learning_rate_update = +elm.select('[name=learning_rate_update]').property('value')
			model._rate = Math.max(min_learning_rate, learning_rate)
			model.fit()
			platform.predict((px, pred_cb) => {
				const data = model.predict(px)
				elm.select('[name=learning_rate]').property('value', learning_rate * learning_rate_update)
				pred_cb(data.map(v => (v < 0 ? 1 : 2)))
				cb && cb()
			}, 4)
		})
	}

	elm.append('select')
		.attr('name', 'kernel')
		.on('change', function () {
			const k = d3.select(this).property('value')
			if (k === 'gaussian') {
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
		const kernel = elm.select('[name=kernel]').property('value')
		const kernel_args = []
		if (kernel === 'gaussian') {
			kernel_args.push(+elm.select('input[name=gamma]').property('value'))
		}
		model = new S3VM(kernel, kernel_args)
		platform.fit((tx, ty) => {
			model.init(
				tx,
				ty.map(v => (v[0] == null ? null : v[0] === 1 ? -1 : 1))
			)
		})
		platform.init()
	})
	elm.append('span').text('learning rate = max(')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'min_learning_rate')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.01)
		.attr('value', 0)
	elm.append('span').text(', ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'learning_rate')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.1)
		.attr('value', 0.1)
	elm.append('span').text(' * ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'learning_rate_update')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', '0.01')
		.attr('value', 0.999)
	elm.append('span').text(') ')
	slbConf.step(fitModel).epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Currently, this model works only with binary classification. Click and add data point. Finally, click "Step" button repeatedly.'
	dispS3VM(platform.setting.ml.configElement, platform)
}