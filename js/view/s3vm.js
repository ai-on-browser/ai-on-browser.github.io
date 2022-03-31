import S3VM from '../../lib/model/s3vm.js'
import Controller from '../controller.js'

var dispS3VM = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		const learning_rate = +elm.select('[name=learning_rate]').property('value')
		const min_learning_rate = +elm.select('[name=min_learning_rate]').property('value')
		const learning_rate_update = +elm.select('[name=learning_rate_update]').property('value')
		model._rate = Math.max(min_learning_rate, learning_rate)
		model.fit()
		const data = model.predict(platform.testInput(4))
		elm.select('[name=learning_rate]').property('value', learning_rate * learning_rate_update)
		platform.testResult(data.map(v => (v < 0 ? 1 : 2)))
		cb && cb()
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
	const slbConf = controller.stepLoopButtons().init(() => {
		const kernel = elm.select('[name=kernel]').property('value')
		const kernel_args = []
		if (kernel === 'gaussian') {
			kernel_args.push(+elm.select('input[name=gamma]').property('value'))
		}
		model = new S3VM(kernel, kernel_args)
		model.init(
			platform.trainInput,
			platform.trainOutput.map(v => (v[0] == null ? null : v[0] === 1 ? -1 : 1))
		)
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
