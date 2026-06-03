import { getPage } from '../helper/browser'

describe('classification', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('uci')
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CF')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('adamenn')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const k0 = buttons.locator('input:nth-of-type(1)')
		await expect(k0.inputValue()).resolves.toBe('15')
		const k1 = buttons.locator('input:nth-of-type(2)')
		await expect(k1.inputValue()).resolves.toBe('3')
		const k2 = buttons.locator('input:nth-of-type(3)')
		await expect(k2.inputValue()).resolves.toBe('23')
		const l = buttons.locator('input:nth-of-type(4)')
		await expect(l.inputValue()).resolves.toBe('12')
		const k = buttons.locator('input:nth-of-type(5)')
		await expect(k.inputValue()).resolves.toBe('3')
		const c = buttons.locator('input:nth-of-type(6)')
		await expect(c.inputValue()).resolves.toBe('0.5')
	})

	test('learn', { timeout: 100000 }, async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const methodFooter = page.locator('#method_footer')
		await expect(methodFooter.textContent()).resolves.toBe('')

		const calculateButton = buttons.locator('input[value=Calculate]')
		await calculateButton.dispatchEvent('click')

		await expect(methodFooter.textContent()).resolves.toMatch(/^Accuracy:[0-9.]+$/)
	})
})
