import { DefaultPlatform } from './platform/base.js'
import { EmptyData } from './data/base.js'
import ManualData from './data/manual.js'
import { EventEmitter } from './utils.js'

const loadedPlatform = {
	'': DefaultPlatform,
}
const loadedData = {
	'': EmptyData,
	manual: ManualData,
}
const loadedPreprocess = {}
const loadedModel = {}

export default class AIManager {
	constructor(setting) {
		this._setting = setting
		this._platform = new DefaultPlatform(this)
		this._task = ''
		this._datas = new ManualData(this)
		this._dataset = 'manual'
		this._preprocess = []
		this._preprocessnames = []
		this._modelname = ''

		this._emitter = new EventEmitter()
	}

	get platform() {
		return this._platform
	}

	get task() {
		return this._task
	}

	get preprocesses() {
		return this._preprocess
	}

	get setting() {
		return this._setting
	}

	get datas() {
		return this._datas
	}

	onReady(cb) {
		if (this._platform && this._datas) {
			return cb()
		}
		this._emitter.once('ready', cb)
	}

	resolveListenersIfCan() {
		if (this._platform && this._datas) {
			this._emitter.emit('ready')
		}
	}

	requiredRenderers(renderers) {
		this._requireRenderers = renderers
		if (this._platform && this._requireRenderers) {
			this._platform._renderer.push(...this._requireRenderers.map(r => new r(this)))
		}
	}

	async setTask(task) {
		if (!this._platform) {
			return
		}
		if (this._task === task) {
			this._platform.init()
			return
		}
		this._platform.terminate()
		this._platform = null
		this._task = task
		let type = ''
		if (this._task === 'MD' || this._task === 'GM') {
			type = 'rl'
		} else if (this._task === 'TP' || this._task === 'SM' || this._task === 'CP') {
			type = 'series'
		} else if (this._task === 'SG' || this._task === 'DN' || this._task === 'ED') {
			type = 'image'
		} else if (this._task === 'WE') {
			type = 'document'
		} else if (this._task === 'SC') {
			type = 'semisupervised'
		} else if (this._task === 'RC') {
			type = 'recommend'
		}

		if (!loadedPlatform[type]) {
			const obj = await import(`./platform/${type}.js`)
			loadedPlatform[type] = obj.default
		}
		if (task === 'MD' || task === 'GM') {
			return new Promise(resolve => {
				new loadedPlatform[type](this, env => {
					this._platform = env
					this._platform.init()
					if (!this._setting.ml.modelName) env.render()
					this.resolveListenersIfCan()
					resolve()
				})
			})
		}
		this._platform = new loadedPlatform[type](this)
		if (this._requireRenderers) {
			this._platform._renderer.push(...this._requireRenderers.map(r => new r(this)))
		}
		this._platform.init()
		this.resolveListenersIfCan()
	}

	async setPreprocess(preprocess) {
		if (preprocess === this._preprocessnames[0]) {
			return
		}
		this._preprocess.forEach(p => p.terminate())
		this._preprocess = []
		this._preprocessnames = []
		if (!preprocess) {
			return
		}
		this._preprocessnames = [preprocess]
		if (!loadedPreprocess[preprocess]) {
			const obj = await import(`./preprocess/${preprocess}.js`)
			loadedPreprocess[preprocess] = obj.default
		}
		this._preprocess = [new loadedPreprocess[preprocess](this)]
	}

	async setData(data) {
		this._datas.terminate()
		this._datas = null
		this._dataset = data

		if (!loadedData[this._dataset]) {
			const obj = await import(`./data/${data}.js`)
			loadedData[data] = obj.default
		}
		this._datas = new loadedData[this._dataset](this)
		this._platform?.init()
		this.resolveListenersIfCan()
	}

	async setModel(model) {
		this._modelname = model

		if (!model) {
			return
		} else if (!loadedModel[model]) {
			const obj = await import(`./view/${model}.js`)
			loadedModel[model] = obj.default
		}
		try {
			loadedModel[model](this.platform)
		} catch (e) {
			console.error(e)
			return e
		}
	}
}
