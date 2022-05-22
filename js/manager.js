import { DefaultPlatform } from './platform/base.js'
import { EmptyData } from './data/base.js'
import ManualData from './data/manual.js'

const loadedPlatform = {
	'': DefaultPlatform,
}
const loadedData = {
	'': EmptyData,
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

		const loadPlatform = platformClass => {
			if (task === 'MD' || task === 'GM') {
				return new Promise(resolve => {
					new platformClass(task, this, env => {
						this._platform = env
						this._platform.init()
						if (!this._setting.ml.modelName) env.render()
						this.resolveListenersIfCan()
						resolve()
					})
				})
			}
			this._platform = new platformClass(task, this)
			this._platform.init()
			this.resolveListenersIfCan()
		}

		if (loadedPlatform[type]) {
			return loadPlatform(loadedPlatform[type])
		}
		return import(`./platform/${type}.js`).then(obj => {
			loadedPlatform[type] = obj.default
			return loadPlatform(obj.default)
		})
	}

	async setData(data) {
		this._datas.terminate()
		this._datas = null
		this._dataset = data

		if (loadedData[this._dataset]) {
			this._datas = new loadedData[this._dataset](this)
			this._platform && this._platform.init()
			this.resolveListenersIfCan()
		} else {
			return import(`./data/${data}.js`).then(obj => {
				this._datas = new obj.default(this)
				this._platform && this._platform.init()
				this.resolveListenersIfCan()
				loadedData[data] = obj.default
			})
		}
	}

	async setModel(model) {
		this._modelname = model

		if (!loadedModel[model]) {
			return import(`./view/${model}.js`).then(obj => {
				loadedModel[model] = obj.default
				try {
					obj.default(this.platform)
				} catch (e) {
					console.error(e)
					return e
				}
			})
		} else {
			try {
				loadedModel[model](this.platform)
			} catch (e) {
				console.error(e)
				return e
			}
		}
	}
}
