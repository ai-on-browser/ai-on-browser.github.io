import { getPage } from '../helper/browser'

describe('timeseries prediction', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('TP')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('arima')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const p = buttons.locator('input:nth-of-type(1)')
		await expect(p.inputValue()).resolves.toBe('1')
		const d = buttons.locator('input:nth-of-type(2)')
		await expect(d.inputValue()).resolves.toBe('1')
		const q = buttons.locator('input:nth-of-type(3)')
		await expect(q.inputValue()).resolves.toBe('1')
		const count = buttons.locator('input:nth-of-type(7)')
		await expect(count.inputValue()).resolves.toBe('100')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')
		const stepButton = buttons.locator('input[value=Step]:enabled')
		await stepButton.dispatchEvent('click')

		await expect(epoch.textContent()).resolves.toBe('1')
	})
})
