import puppeteer from 'puppeteer'

/** @type {puppeteer.Browser} */
let browser
beforeAll(async () => {
	browser = await puppeteer.launch({ args: ['--no-sandbox'] })
})

afterAll(async () => {
	await browser.close()
})

describe('classification', () => {
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
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		dataSelectBox.select('')
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('MD')
		const envSelectBox = await page.waitForSelector('#ml_selector #task_menu select')
		envSelectBox.select('grid')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('dynamic_programming')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const resolution = await buttons.waitForSelector('input:first-child')
		await expect((await resolution.getProperty('value')).jsonValue()).resolves.toBe('20')
	}, 10000)

	test('learn', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		dataSelectBox.select('')
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('MD')
		const envSelectBox = await page.waitForSelector('#ml_selector #task_menu select')
		envSelectBox.select('grid')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('dynamic_programming')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('0')

		const initializeButton = await buttons.waitForSelector('input[value=Initialize]')
		await initializeButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('1')
	}, 10000)
})
