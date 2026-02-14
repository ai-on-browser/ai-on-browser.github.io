import { getPage } from '../helper/browser'

describe('classification', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('esl')
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('RC')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('association_analysis')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const minsupport = buttons.locator('input:nth-of-type(1)')
		await expect(minsupport.inputValue()).resolves.toBe('0.1')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const fitButton = buttons.locator('input[value=Fit]')
		await fitButton.dispatchEvent('click')

		const methodFooter = page.locator('#method_footer')
		await expect(methodFooter.textContent()).resolves.toBe('')

		const elmoptions1 = buttons.locator('select:nth-of-type(1) option')
		await expect(elmoptions1.count()).resolves.toBe(40)
		const elmoptions2 = buttons.locator('select:nth-of-type(2) option')
		await expect(elmoptions2.count()).resolves.toBe(40)
	})
})
