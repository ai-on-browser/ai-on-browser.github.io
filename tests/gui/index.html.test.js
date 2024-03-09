import playwright from 'playwright'

import getaimanager from './helper/aimanager'

describe('index', () => {
	let browser, page
	beforeAll(async () => {
		browser = await playwright.chromium.launch({
			args: ['--no-sandbox'],
		})
		page = await browser.newPage()
		await page.goto(`http://${process.env.SERVER_HOST}/`)
		page.on('console', message => console.log(`${message.type().substring(0, 3).toUpperCase()} ${message.text()}`))
			.on('pageerror', ({ message }) => console.log(message))
			.on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`))
	})

	afterAll(async () => {
		await browser.close()
	})

	test('default inputs', async () => {
		await expect(page.title()).resolves.toMatch('AI on Browser')
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		const dataName = await (await dataSelectBox.getProperty('value')).jsonValue()
		expect(dataName).toBe('manual')

		const dimensionTextBox = await page.waitForSelector('#data_menu > div:first-child > input:first-child')
		await expect((await dimensionTextBox.getProperty('value')).jsonValue()).resolves.toBe('2')

		const scaleTextBox = await page.waitForSelector('#data_menu > div:first-child > input:nth-child(2)')
		await expect((await scaleTextBox.getProperty('value')).jsonValue()).resolves.toBe('0.001')

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await expect((await taskSelectBox.getProperty('value')).jsonValue()).resolves.toBe('')
	}, 20000)

	test('ai manager', async () => {
		await expect(page.title()).resolves.toMatch('AI on Browser')
		await page.waitForSelector('#data_menu > *')

		const aiManager = await getaimanager(page)
		expect(aiManager).toBeDefined()
		expect(aiManager._datas).toBeDefined()
		expect(aiManager._datas.length).toBe(300)
	})
})
