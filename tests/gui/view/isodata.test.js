import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('isodata')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const init_k = buttons.locator('input:nth-of-type(1)')
		await expect(init_k.inputValue()).resolves.toBe('20')
		const max_k = buttons.locator('input:nth-of-type(2)')
		await expect(max_k.inputValue()).resolves.toBe('100')
		const min_k = buttons.locator('input:nth-of-type(3)')
		await expect(min_k.inputValue()).resolves.toBe('2')
		const min_n = buttons.locator('input:nth-of-type(4)')
		await expect(min_n.inputValue()).resolves.toBe('2')
		const spl_std = buttons.locator('input:nth-of-type(5)')
		await expect(spl_std.inputValue()).resolves.toBe('1')
		const merge_dist = buttons.locator('input:nth-of-type(6)')
		await expect(merge_dist.inputValue()).resolves.toBe('0.1')
		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
		const clusters = buttons.locator('span:last-child')
		await expect(clusters.textContent()).resolves.toBe('')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')
		const stepButton = buttons.locator('input[value=Step]:enabled')
		await stepButton.dispatchEvent('click')

		await expect(epoch.textContent()).resolves.toBe('1')
		expect(+(await clusters.textContent())).toBeGreaterThan(0)
	})
})
