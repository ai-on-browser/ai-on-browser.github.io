import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('sting')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const c = buttons.locator('input:nth-of-type(1)')
		await expect(c.inputValue()).resolves.toBe('500')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const clusters = buttons.locator('span:last-child')
		await expect(clusters.textContent()).resolves.toBe('')

		const fitButton = buttons.locator('input[value=Fit]')
		await fitButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		await expect(svg.locator('.datas circle').count()).resolves.toBe(300)
		await expect(clusters.textContent()).resolves.toMatch(/^[0-9]+$/)
	})
})
