import puppeteer from 'puppeteer'

describe('index', () => {
	let browser
	beforeAll(async () => {
		browser = await puppeteer.launch({
			args: ['--no-sandbox'],
		})
	})

	afterAll(async () => {
		await browser.close()
	})

	test('index', async () => {
		const page = await browser.newPage()
		await page.goto(`http://${process.env.SERVER_HOST}/`)
		page.on('console', message => console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
			.on('pageerror', ({ message }) => console.log(message))
			.on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`))
		await expect(page.title()).resolves.toMatch('AI on Browser')
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		const dataName = await (await dataSelectBox.getProperty('value')).jsonValue()
		expect(dataName).toBe('manual')

		const aiManager = await page.evaluate(() => {
			const cp = []
			const stack = [[ai_manager, 0, cp]]
			const checked = new Set()
			while (stack.length > 0) {
				const [obj, key, parent] = stack.shift()
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
					for (const key of Object.getOwnPropertyNames(obj)) {
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
						for (const key of Object.keys(descriptors)) {
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
			return cp[0]
		})
		expect(aiManager).toBeDefined()
	}, 10000)
})
