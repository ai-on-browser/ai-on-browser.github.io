import { getPage } from '../helper/browser'

describe('anomaly detection', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('AD')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('kdeos')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const kmin = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await kmin.getProperty('value')).jsonValue()).resolves.toBe('5')
		const kmax = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await kmax.getProperty('value')).jsonValue()).resolves.toBe('10')
		const threshold = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect((await threshold.getProperty('value')).jsonValue()).resolves.toBe('0.5')
	})

	test('learn', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('hr_diagram')

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('AD')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('kdeos')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const calcButton = await buttons.waitForSelector('input[value=Calculate]')
		await calcButton.evaluate(el => el.click())

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.tile circle')
		expect((await svg.$$('.tile circle')).length).toBeGreaterThan(0)
	})
})
