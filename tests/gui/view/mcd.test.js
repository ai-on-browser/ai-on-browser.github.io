import { getPage } from '../helper/browser'

describe('anomaly detection', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('hr_diagram')

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('AD')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('mcd')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const srate = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await srate.getProperty('value')).jsonValue()).resolves.toBe('0.9')
		const t = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await t.getProperty('value')).jsonValue()).resolves.toBe('2')
	})

	test('learn', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.tile circle')
		expect((await svg.$$('.tile circle')).length).toBeGreaterThan(0)
	})
})
