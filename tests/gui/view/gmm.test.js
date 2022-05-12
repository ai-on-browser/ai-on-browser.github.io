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
		modelSelectBox.select('gmm')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('[name=clusternumber]')
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('0 clusters')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('gmm')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('[name=clusternumber]')
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('0 clusters')

		const addButton = await buttons.waitForSelector('input[value=Add\\ cluster]')
		await addButton.evaluate(el => el.click())
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('1 clusters')

		const stepButton = await buttons.waitForSelector('input[value=Step]')
		await stepButton.evaluate(el => el.click())
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('1 clusters')

		const clearButton = await buttons.waitForSelector('input[value=Clear]')
		await clearButton.evaluate(el => el.click())
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('0 clusters')
	}, 10000)
})
