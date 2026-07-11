import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('functional')
		const presetSelectBox = page.locator('#ml_selector #data_menu select[name=preset]')
		await presetSelectBox.selectOption('clusters')
		const numberTextBox = page.locator('#ml_selector #data_menu > input[type=number]').first()
		await numberTextBox.fill('50')
		await numberTextBox.dispatchEvent('change')
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('chameleon')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const n = buttons.locator('input:nth-of-type(1)')
		await expect(n.inputValue()).resolves.toBe('5')
		const k = buttons.locator('input:nth-of-type(3)')
		await expect(k.inputValue()).resolves.toBe('10')
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
		expect(colors.size).toBe(10)
	})
})
