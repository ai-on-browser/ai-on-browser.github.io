import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('jarvis_patrick_clustering')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const metric = buttons.locator('select:nth-of-type(1)')
		await expect(metric.inputValue()).resolves.toBe('euclid')
		const k = buttons.locator('input:nth-of-type(1)')
		await expect(k.inputValue()).resolves.toBe('10')
		const t = buttons.locator('input:nth-of-type(2)')
		await expect(t.inputValue()).resolves.toBe('5')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const clusters = buttons.locator('span:last-child')
		await expect(clusters.textContent()).resolves.toBe('')

		const fitButton = buttons.locator('input[value=Fit]')
		await fitButton.dispatchEvent('click')

		await expect(clusters.textContent()).resolves.toMatch(/^[0-9]+$/)
	})
})
