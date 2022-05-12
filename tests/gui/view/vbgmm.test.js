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
		modelSelectBox.select('vbgmm')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const alpha = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await alpha.getProperty('value')).jsonValue()).resolves.toBe('0.001')
		const beta = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await beta.getProperty('value')).jsonValue()).resolves.toBe('0.001')
		const k = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect((await k.getProperty('value')).jsonValue()).resolves.toBe('10')
		const clusters = await buttons.waitForSelector('span:last-child')
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('vbgmm')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('0')
		const clusters = await buttons.waitForSelector('span:last-child')
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		await expect(clusters.evaluate(el => el.textContent)).resolves.toMatch(/^[0-9]+$/)
		await new Promise(resolve => setTimeout(resolve, 1000))
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('1')
	}, 10000)
})
