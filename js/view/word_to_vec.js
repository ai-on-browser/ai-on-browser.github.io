import Word2Vec from '../../lib/model/word_to_vec.js'

var dispW2V = function (elm, platform) {
	let model = new Word2Vec()
	const fitModel = cb => {
		const iteration = +elm.select('[name=iteration]').property('value')
		const batch = +elm.select('[name=batch]').property('value')
		const rate = +elm.select('[name=rate]').property('value')

		platform.fit((tx, ty) => {
			model.fit(tx, iteration, rate, batch, e => {
				platform.predict((px, pred_cb) => {
					model.reduce(px, e => {
						pred_cb(e)
						cb && cb()
					})
				})
			})
		})
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['CBOW', 'skip-gram'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' n ')
	elm.append('input').attr('type', 'number').attr('name', 'n').attr('min', 1).attr('max', 10).attr('value', 1)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		platform.init()
		if (platform.datas.length === 0) {
			return
		}
		if (model) {
			model.terminate()
		}
		const method = elm.select('[name=method]').property('value')
		const n = +elm.select('[name=n]').property('value')
		model = new Word2Vec(method, n)
		const rdim = 2

		platform.fit((tx, ty) => {
			model.initialize(tx, rdim, 'adam')
		})
	})
	elm.append('span').text(' Iteration ')
	elm.append('select')
		.attr('name', 'iteration')
		.selectAll('option')
		.data([1, 10, 100, 1000, 10000])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' Learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'rate')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.01)
		.attr('value', 0.001)
	elm.append('span').text(' Batch size ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'batch')
		.attr('value', 10)
		.attr('min', 1)
		.attr('max', 100)
		.attr('step', 1)
	slbConf.step(fitModel).epoch(() => model.epoch)

	return () => {
		model.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.terminate = dispW2V(platform.setting.ml.configElement, platform)
}
