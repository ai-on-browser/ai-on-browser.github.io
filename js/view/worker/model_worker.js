import Matrix from '../../../lib/util/matrix.js'
import Tensor from '../../../lib/util/tensor.js'

self.imported = {}
self.model = null

self.addEventListener(
	'message',
	async e => {
		const data = e.data
		const name = data.name
		if (!self.imported[name]) {
			self.imported[name] = (await import(`../../../lib/model/${name}.js`)).default
		}
		if (data.method === 'constructor') {
			self.model = new self.imported[name](...data.arguments)
			self.postMessage(null)
		} else if (data.static) {
			let ret = self.imported[name][data.method]
			if (typeof ret === 'function') {
				ret = await Promise.resolve(ret(...data.arguments))
			}
			if (data.initialize) {
				self.model = ret
				self.postMessage(null)
			} else {
				self.postMessage(convert(ret))
			}
		} else {
			let ret = self.model[data.method]
			if (typeof ret === 'function') {
				ret = await Promise.resolve(ret.bind(self.model)(...data.arguments))
			}
			if (data.initialize) {
				self.model = ret
				self.postMessage(null)
			} else {
				self.postMessage(convert(ret))
			}
		}
	},
	false
)

const convert = ret => {
	if (ret == null) {
		return ret
	}
	if (ret instanceof Matrix || ret instanceof Tensor) {
		return ret.toArray()
	}
	if (Array.isArray(ret)) {
		return ret.map(convert)
	}
	if (typeof ret === 'object') {
		const result = {}
		for (const key in ret) {
			result[key] = convert(ret[key])
		}
		return result
	}
	return ret
}
