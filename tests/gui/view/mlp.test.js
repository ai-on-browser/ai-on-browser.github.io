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
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CF')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('mlp')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const size = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await size.getProperty('value')).jsonValue()).resolves.toBe('10')
		const activation = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await activation.getProperty('value')).jsonValue()).resolves.toBe('sigmoid')
		const optimizer = await buttons.waitForSelector('select:nth-of-type(2)')
		await expect((await optimizer.getProperty('value')).jsonValue()).resolves.toBe('sgd')
		const iteration = await buttons.waitForSelector('select:nth-of-type(3)')
		await expect((await iteration.getProperty('value')).jsonValue()).resolves.toBe('1')
		const rate = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect((await rate.getProperty('value')).jsonValue()).resolves.toBe('0.001')
		const batch = await buttons.waitForSelector('input:nth-of-type(4)')
		await expect((await batch.getProperty('value')).jsonValue()).resolves.toBe('10')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CF')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('mlp')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('0')
		const methodFooter = await page.waitForSelector('#method_footer')
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		await new Promise(resolve => setTimeout(resolve, 1000))
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())
		await buttons.waitForSelector('input[value=Step]:enabled')

		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('1')
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toMatch(/^Accuracy:[0-9.]+/)
	}, 10000)
})
