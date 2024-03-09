export default (page, option = {}) => {
	return page.evaluate(option => {
		const cp = []
		const stack = [[ai_manager, 0, cp]]
		const checked = new Set()
		while (stack.length > 0) {
			const [obj, key, parent] = stack.shift()
			if (obj instanceof Element) {
				continue
			}
			if (option.ignoreProperties && option.ignoreProperties.includes(key)) {
				continue
			}
			if (checked.has(obj)) {
				parent[key] = 'Recursive Object'
			} else if (obj === null) {
				parent[key] = null
			} else if (Array.isArray(obj)) {
				checked.add(obj)
				const arr = []
				obj.forEach((v, i) => stack.push([v, i, arr]))
				parent[key] = arr
			} else if (typeof obj === 'object') {
				checked.add(obj)
				const o = {}
				const propNames = Object.getOwnPropertyNames(obj)
				propNames.sort()
				for (const key of propNames) {
					try {
						stack.push([obj[key], key, o])
					} catch (e) {
						o[key] = 'error'
					}
				}
				let proto = Object.getPrototypeOf(obj)
				let cnt = 0
				while (proto && cnt++ < 2) {
					const descriptors = Object.getOwnPropertyDescriptors(proto)
					const descriptorNames = Object.keys(descriptors)
					descriptorNames.sort()
					for (const key of descriptorNames) {
						const descriptor = descriptors[key]
						if (descriptor.get) {
							try {
								stack.push([obj[key], key, o])
							} catch (e) {
								o[key] = 'error'
							}
						}
					}
					proto = Object.getPrototypeOf(proto)
				}
				parent[key] = o
			} else if (typeof obj === 'function') {
				parent[key] = obj.toString()
			} else {
				parent[key] = obj
			}
		}
		return JSON.parse(JSON.stringify(cp[0]))
	}, option)
}
