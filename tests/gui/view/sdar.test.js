import { getPage } from '../helper/browser'

describe('timeseries prediction', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('TP')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('sdar')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const p = buttons.locator('input:nth-of-type(1)')
		await expect(p.inputValue()).resolves.toBe('1')
		const count = buttons.locator('input:nth-of-type(3)')
		await expect(count.inputValue()).resolves.toBe('100')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const fitButton = buttons.locator('input[value=Fit]')
		await fitButton.dispatchEvent('click')

		const svg = await page.waitForSelector('#plot-area svg')
		const path = await svg.waitForSelector('.tile-render path')
		const d = await path.getAttribute('d')
		expect(d.split('L')).toHaveLength(101)
	})
})
