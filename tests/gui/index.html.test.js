import playwright from 'playwright'

import getaimanager from './helper/aimanager'

describe('index', () => {
	let browser, page
	beforeAll(async () => {
		browser = await playwright.chromium.launch({
			args: ['--no-sandbox'],
		})
		page = await browser.newPage()
		await page.goto(`http://localhost:3000/`)
		page.on('console', message => console.log(`${message.type().substring(0, 3).toUpperCase()} ${message.text()}`))
			.on('pageerror', ({ message }) => console.log(message))
			.on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`))
	})

	afterAll(async () => {
		await browser.close()
	})

	test('default inputs', async () => {
		await expect(page.title()).resolves.toMatch('AI on Browser')
		const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
		const dataName = await dataSelectBox.inputValue()
		expect(dataName).toBe('manual')

		const dimensionTextBox = page.locator('#data_menu > div:first-child > input:first-child')
		await expect(dimensionTextBox.inputValue()).resolves.toBe('2')

		const scaleTextBox = page.locator('#data_menu > div:first-child > input:nth-child(2)')
		await expect(scaleTextBox.inputValue()).resolves.toBe('0.001')

		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await expect(taskSelectBox.inputValue()).resolves.toBe('')
	})

	test('ai manager', async () => {
		await expect(page.title()).resolves.toMatch('AI on Browser')
		await page.waitForSelector('#data_menu > *')

		const aiManager = await getaimanager(page)
		expect(aiManager).toBeDefined()
		expect(aiManager._datas).toBeDefined()
		expect(aiManager._datas.length).toBe(300)
	})
})
