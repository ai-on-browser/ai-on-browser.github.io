import { getPage } from '../helper/browser'

describe('timeseries prediction', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('TP')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('rnn')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const method = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await method.getProperty('value')).jsonValue()).resolves.toBe('rnn')
		const window = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect(window.getAttribute('value')).resolves.toBe('30')
		const iteration = await buttons.waitForSelector('select:nth-of-type(2)')
		await expect((await iteration.getProperty('value')).jsonValue()).resolves.toBe('1')
		const rate = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect(rate.getAttribute('value')).resolves.toBe('0.001')
		const batch = await buttons.waitForSelector('input:nth-of-type(4)')
		await expect(batch.getAttribute('value')).resolves.toBe('10')
		const pcount = await buttons.waitForSelector('input:nth-of-type(7)')
		await expect(pcount.getAttribute('value')).resolves.toBe('100')
	})

	test('learn', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
		const methodFooter = await page.waitForSelector('#method_footer', { state: 'attached' })
		await expect(methodFooter.textContent()).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())
		await buttons.waitForSelector('input[value=Step]:enabled')

		await expect(epoch.textContent()).resolves.toBe('1')
		await expect(methodFooter.textContent()).resolves.toMatch(/^loss/)
	})
})
