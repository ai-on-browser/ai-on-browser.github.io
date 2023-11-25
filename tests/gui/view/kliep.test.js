import { getPage } from '../helper/browser'

describe('change point detection', () => {
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
		await taskSelectBox.selectOption('CP')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('kliep')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const window = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await window.getProperty('value')).jsonValue()).resolves.toBe('20')
		const threshold = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await threshold.getProperty('value')).jsonValue()).resolves.toBe('0.01')
	})

	test('learn', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('functional')
		const presetSelectBox = await page.waitForSelector('#ml_selector #data_menu select[name=preset]')
		await presetSelectBox.selectOption('tanh')

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CP')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('kliep')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const calcButton = await buttons.waitForSelector('input[value=Calculate]')
		await calcButton.evaluate(el => el.click())

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.tile-render line', { state: 'attached' })
		expect((await svg.$$('.tile-render line')).length).toBeGreaterThan(0)
	}, 30000)
})
