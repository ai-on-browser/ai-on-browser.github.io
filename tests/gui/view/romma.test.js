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
		await modelSelectBox.selectOption('romma')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const methods = buttons.locator('select:nth-of-type(1)')
		await expect(methods.inputValue()).resolves.toBe('oneone')
		const type = buttons.locator('select:nth-of-type(2)')
		await expect(type.inputValue()).resolves.toBe('')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')
		const type = buttons.locator('select:nth-of-type(2)')
		await type.selectOption('')

		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
		const methodFooter = page.locator('#method_footer', { state: 'attached' })
		await expect(methodFooter.textContent()).resolves.toBe('')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')
		const stepButton = buttons.locator('input[value=Step]:enabled')
		await stepButton.dispatchEvent('click')

		await expect(epoch.textContent()).resolves.toBe('1')
		await expect(methodFooter.textContent()).resolves.toMatch(/^Accuracy:[0-9.]+$/)
	})

	test('learn aggressive', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')
		const type = buttons.locator('select:nth-of-type(2)')
		await type.selectOption('aggressive')

		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
		const methodFooter = page.locator('#method_footer', { state: 'attached' })
		await expect(methodFooter.textContent()).resolves.toBe('')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')
		const stepButton = buttons.locator('input[value=Step]:enabled')
		await stepButton.dispatchEvent('click')

		await expect(epoch.textContent()).resolves.toBe('1')
		await expect(methodFooter.textContent()).resolves.toMatch(/^Accuracy:[0-9.]+$/)
	})
})
