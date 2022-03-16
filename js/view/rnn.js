class RNNWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/rnn_worker.js', { type: 'module' })
	}

	initialize(method, window, unit, out_size, optimizer, cb) {
		this._postMessage({ mode: 'init', method, window, unit, out_size, optimizer }, cb)
	}

	fit(train_x, train_y, iteration, rate, batch, cb) {
		this._postMessage({ mode: 'fit', x: train_x, y: train_y, iteration, rate, batch }, cb)
	}

	predict(x, k, cb) {
		this._postMessage({ mode: 'predict', x, k }, cb)
	}
}

var dispRNN = function (elm, platform) {
	const model = new RNNWorker()
	let epoch = 0

	const fitModel = cb => {
		const iteration = +elm.select('[name=iteration]').property('value')
		const batch = +elm.select('[name=batch]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		const predCount = +elm.select('[name=pred_count]').property('value')

		platform.fit((tx, ty, pred_cb) => {
			model.fit(tx, ty, iteration, rate, batch, e => {
				epoch = e.data.epoch
				model.predict(tx, predCount, e => {
					const pred = e.data
					pred_cb(pred)
					cb && cb()
				})
			})
		})
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['rnn', 'LSTM', 'GRU'])
		.enter()
		.append('option')
		.property('value', d => d.toLowerCase())
		.text(d => d)
	elm.append('span').text('window width')
	elm.append('input').attr('type', 'number').attr('name', 'width').attr('min', 1).attr('max', 1000).attr('value', 30)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		if (platform.datas.length === 0) {
			return
		}

		const method = elm.select('[name=method]').property('value')
		const window = +elm.select('[name=width]').property('value')

		platform.fit((tx, ty) => {
			model.initialize(method, window, 3, tx[0].length)
		})
		platform.init()
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
	elm.append('span').text(' predict count')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'pred_count')
		.attr('min', 1)
		.attr('max', 1000)
		.attr('value', 100)

	return () => {
		model.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ternimate = dispRNN(platform.setting.ml.configElement, platform)
}
