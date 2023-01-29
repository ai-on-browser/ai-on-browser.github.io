export default class BaseDB {
	constructor(dbname, version) {
		this.dbname = dbname
		this.version = version
		this.db = null
	}

	onupgradeneeded(db) {
		throw new Error('Not implemented')
	}

	async _ready() {
		if (this.db) {
			return
		}
		const request = indexedDB.open(this.dbname, this.version)
		return new Promise((resolve, reject) => {
			request.onerror = reject
			request.onsuccess = () => {
				this.db = request.result
				resolve()
			}
			request.onupgradeneeded = e => {
				this.onupgradeneeded(e)
			}
		})
	}

	async save(name, datas) {
		await this._ready()
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([name], 'readwrite')
			const objectStore = transaction.objectStore(name)
			if (!Array.isArray(datas)) {
				datas = [datas]
			}
			for (const data of datas) {
				objectStore.put(data)
			}

			transaction.oncomplete = resolve
			transaction.onerror = reject
		})
	}

	async get(name, key) {
		await this._ready()
		return new Promise((resolve, reject) => {
			const objectStore = this.db.transaction(name).objectStore(name)
			const request = objectStore.get(key)
			request.onsuccess = e => {
				resolve(e.target.result)
			}
			request.onerror = reject
		})
	}

	async list(name) {
		await this._ready()
		return new Promise((resolve, reject) => {
			const objectStore = this.db.transaction(name).objectStore(name)
			const request = objectStore.getAll()
			request.onsuccess = e => {
				resolve(e.target.result)
			}
			request.onerror = reject
		})
	}

	async delete(name, key) {
		await this._ready()
		return new Promise((resolve, reject) => {
			const objectStore = this.db.transaction(name, 'readwrite').objectStore(name)
			const request = objectStore.delete(key)
			request.onsuccess = resolve
			request.onerror = reject
		})
	}

	async deleteDatabase() {
		return new Promise((resolve, reject) => {
			this.db?.close()
			const request = indexedDB.deleteDatabase(this.dbname)
			request.onerror = reject
			request.onsuccess = () => {
				this.db = null
				resolve()
			}
		})
	}
}
