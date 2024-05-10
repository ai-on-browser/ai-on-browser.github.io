import { getPage } from '../helper/browser'

describe('regression', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('RG')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('elastic_net')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const lambda = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await lambda.getProperty('value')).jsonValue()).resolves.toBe('0.0001')
		const alpha = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await alpha.getProperty('value')).jsonValue()).resolves.toBe('0.5')
		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('0')
	})

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('RG')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('elastic_net')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('0')
		const methodFooter = await page.waitForSelector('#method_footer', { state: 'attached' })
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('1')
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toMatch(/^RMSE:[0-9.]+$/)
	})
})