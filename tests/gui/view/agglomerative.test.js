import puppeteer from 'puppeteer'

/** @type {puppeteer.Browser} */
let browser
beforeAll(async () => {
	browser = await puppeteer.launch({ args: ['--no-sandbox'] })
})

afterAll(async () => {
	await browser.close()
})

describe('clustering', () => {
	/** @type {puppeteer.Page} */
	let page
	beforeEach(async () => {
		page = await browser.newPage()
		await page.goto(`http://${process.env.SERVER_HOST}/`)
		page.on('console', message => console.log(`${message.type().substring(0, 3).toUpperCase()} ${message.text()}`))
			.on('pageerror', ({ message }) => console.log(message))
			.on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`))
		await page.waitForSelector('#data_menu > *')
	}, 10000)

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('agglomerative')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const method = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await method.getProperty('value')).jsonValue()).resolves.toBe('Complete Linkage')
		const metrix = await buttons.waitForSelector('select:nth-of-type(2)')
		await expect((await metrix.getProperty('value')).jsonValue()).resolves.toBe('euclid')
		const clusters = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await clusters.getProperty('value')).jsonValue()).resolves.toBe('1')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('agglomerative')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())

		const clusters = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await clusters.getProperty('value')).jsonValue()).resolves.toBe('10')
		await expect((await clusters.getProperty('min')).jsonValue()).resolves.toBe('1')
		await expect((await clusters.getProperty('max')).jsonValue()).resolves.toBe('300')
		const crange = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await crange.getProperty('value')).jsonValue()).resolves.toBe('10')
		await expect((await crange.getProperty('min')).jsonValue()).resolves.toBe('1')
		await expect((await crange.getProperty('max')).jsonValue()).resolves.toBe('300')
	}, 10000)
})
