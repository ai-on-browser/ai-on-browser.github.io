import { DefaultPlatform } from './platform/base.js'
import ManualData from './data/manual.js'

const loadedPlatform = {
	'': DefaultPlatform,
}
const loadedData = {
	manual: ManualData,
}
const loadedModel = {}

export default class AIManager {
	constructor(setting) {
		this._setting = setting
		this._platform = new DefaultPlatform(null, this)
		this._task = ''
		this._datas = new ManualData(this)
		this._dataset = 'manual'
		this._modelname = ''

		this._listener = []
	}

	get platform() {
		return this._platform
	}

	get task() {
		return this._task
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
		this._listener.push(cb)
	}

	resolveListeners() {
		for (const listener of this._listener) {
			listener()
		}
		this._listener = []
	}

	resolveListenersIfCan() {
		if (this._platform && this._datas) {
			this.resolveListeners()
		}
	}

	setTask(task, cb) {
		if (!this._platform) {
			cb && cb()
			return
		}
		if (this._task === task) {
			this._platform.init()
			cb && cb()
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
		}

		const loadPlatform = platformClass => {
			if (task === 'MD' || task === 'GM') {
				new platformClass(task, this, env => {
					this._platform = env
					this._platform.init()
					if (!this._setting.ml.modelName) env.render()
					this.resolveListenersIfCan()
					cb && cb()
				})
				return
			}
			this._platform = new platformClass(task, this)
			this._platform.init()
			this.resolveListenersIfCan()
			cb && cb()
		}

		if (loadedPlatform[type]) {
			loadPlatform(loadedPlatform[type])
			return
		}
		import(`./platform/${type}.js`).then(obj => {
			loadedPlatform[type] = obj.default
			loadPlatform(obj.default)
		})
	}

	setData(data, cb) {
		this._datas.terminate()
		this._datas = null
		this._dataset = data

		if (loadedData[this._dataset]) {
			this._datas = new loadedData[this._dataset](this)
			this._platform && this._platform.init()
			this.resolveListenersIfCan()
			cb && cb()
		} else {
			import(`./data/${data}.js`).then(obj => {
				this._datas = new obj.default(this)
				this._platform && this._platform.init()
				this.resolveListenersIfCan()
				cb && cb()
				loadedData[data] = obj.default
			})
		}
	}

	setModel(model, cb) {
		this._modelname = model

		if (!loadedModel[model]) {
			import(`./view/${model}.js`).then(obj => {
				loadedModel[model] = obj.default
				try {
					obj.default(this.platform)
					cb?.()
				} catch (e) {
					console.error(e)
					cb?.(e)
				}
			})
		} else {
			try {
				loadedModel[model](this.platform)
				cb?.()
			} catch (e) {
				console.error(e)
				cb?.(e)
			}
		}
	}
}
