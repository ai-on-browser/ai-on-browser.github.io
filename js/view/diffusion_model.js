import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class DiffusionModelWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/model_worker.js', { type: 'module' })
	}

	initialize(timesteps) {
		return this._postMessage({ name: 'diffusion_model', method: 'constructor', arguments: [timesteps] })
	}

	epoch() {
		return this._postMessage({ name: 'diffusion_model', method: 'epoch' }).then(r => r.data)
	}

	fit(train_x, iteration, rate, batch) {
		return this._postMessage({
			name: 'diffusion_model',
			method: 'fit',
			arguments: [train_x, iteration, rate, batch],
		}).then(r => r.data)
	}

	generate(n) {
		return this._postMessage({ name: 'diffusion_model', method: 'generate', arguments: [n] }).then(r => r.data)
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	const model = new DiffusionModelWorker()
	let epoch = 0

	const fitModel = async () => {
		if (platform.datas.length === 0) {
			return
		}
		const tx = platform.trainInput
		const loss = await model.fit(tx, +iteration.value, rate.value, batch.value)
		epoch = await model.epoch()
		platform.plotLoss(loss[0])
		const gen_data = await model.generate(tx.length)
		platform.trainResult = gen_data
	}

	const genValues = async () => {
		const ty = platform.trainOutput
		genBtn.element.disabled = true
		const gen_data = await model.generate(platform.trainInput.length, ty)
		genBtn.element.disabled = false
		console.log(gen_data)
		platform.trainResult = gen_data
	}

	const slbConf = controller.stepLoopButtons().init(done => {
		model.initialize(100).then(done)
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	iteration.value = 10
	const rate = controller.input.number({ label: 'Learning rate ', min: 0, max: 100, step: 0.01, value: 0.01 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	slbConf.step(fitModel).epoch(() => epoch)
	const genBtn = controller.input.button('Generate').on('click', genValues)

	return () => {
		model.terminate()
	}
}
