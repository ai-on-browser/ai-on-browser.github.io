import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('squeezer')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const s = buttons.locator('input:nth-of-type(1)')
		await expect(s.inputValue()).resolves.toBe('0.1')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const fitButton = buttons.locator('input[value=Fit]')
		await fitButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const circles = svg.locator('.datas circle')
		const colors = new Set()
		for (const circle of await circles.all()) {
			const fill = await circle.getAttribute('fill')
			colors.add(fill)
		}
		expect(colors.size).toBeGreaterThan(3)
	})
})
