import { getPage } from '../helper/browser'

describe('smoothing', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('SM')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('kama')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const n = buttons.locator('input:nth-of-type(1)')
		await expect(n.inputValue()).resolves.toBe('10')
		const k1 = buttons.locator('input:nth-of-type(2)')
		await expect(k1.inputValue()).resolves.toBe('2')
		const k2 = buttons.locator('input:nth-of-type(3)')
		await expect(k2.inputValue()).resolves.toBe('30')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const fitButton = buttons.locator('input[value=Calculate]')
		await fitButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const path = svg.locator('.tile-render path')
		const d = await path.getAttribute('d')
		expect(d.split('L')).toHaveLength(300)
	})
})
