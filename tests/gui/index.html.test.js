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
	}, 10000)
})
