class W2VWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/word2vec_worker.js', { type: 'module' })
	}

	initialize(method, n, wordsOrNumber, reduce_size, optimizer, cb) {
		this._postMessage({ mode: 'init', method, n, wordsOrNumber, reduce_size, optimizer }, cb)
	}

	fit(words, iteration, rate, batch, cb) {
		this._postMessage({ mode: 'fit', words, iteration, rate, batch }, cb)
	}

	predict(x, cb) {
		this._postMessage({ mode: 'predict', x: x }, cb)
	}

	reduce(x, cb) {
		this._postMessage({ mode: 'reduce', x: x }, r => cb(r.data))
	}
}

var dispW2V = function (elm, platform) {
	const model = new W2VWorker()
	let epoch = 0
	const fitModel = cb => {
		const iteration = +elm.select('[name=iteration]').property('value')
		const batch = +elm.select('[name=batch]').property('value')
		const rate = +elm.select('[name=rate]').property('value')

		platform.fit((tx, ty) => {
			model.fit(tx, iteration, rate, batch, e => {
				epoch = e.data.epoch
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
		const method = elm.select('[name=method]').property('value')
		const n = +elm.select('[name=n]').property('value')
		const rdim = 2

		platform.fit((tx, ty) => {
			model.initialize(method, n, tx, rdim, 'adam')
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
	slbConf.step(fitModel).epoch(() => epoch)

	return () => {
		model.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.terminate = dispW2V(platform.setting.ml.configElement, platform)
}
