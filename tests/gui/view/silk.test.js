import { getPage } from '../helper/browser'

describe('classification', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('uci')

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CF')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('silk')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const methods = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await methods.getProperty('value')).jsonValue()).resolves.toBe('oneone')
		const type = await buttons.waitForSelector('select:nth-of-type(2)')
		await expect((await type.getProperty('value')).jsonValue()).resolves.toBe('ilk')
		const kernel = await buttons.waitForSelector('select:nth-of-type(3)')
		await expect((await kernel.getProperty('value')).jsonValue()).resolves.toBe('gaussian')
		const eta = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect(eta.getAttribute('value')).resolves.toBe('0.1')
		const lambda = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect(lambda.getAttribute('value')).resolves.toBe('0.1')
		const c = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect(c.getAttribute('value')).resolves.toBe('0.1')
		const w = await buttons.waitForSelector('input:nth-of-type(4)')
		await expect(w.getAttribute('value')).resolves.toBe('10')
		const loss = await buttons.waitForSelector('select:nth-of-type(4)')
		await expect((await loss.getProperty('value')).jsonValue()).resolves.toBe('square')
		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
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

		await expect(epoch.textContent()).resolves.toBe('1')
		await expect(methodFooter.textContent()).resolves.toMatch(/^Accuracy:[0-9.]+$/)
	})
})
