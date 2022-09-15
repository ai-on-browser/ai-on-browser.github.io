import puppeteer from 'puppeteer'

import { getPage } from '../helper/browser'

describe('dimensionality reduction', () => {
	/** @type {puppeteer.Page} */
	let page
	beforeEach(async () => {
		page = await getPage()
	}, 10000)

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('DR')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('mlle')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const r = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await r.getProperty('value')).jsonValue()).resolves.toBe('20')
	}, 10000)

	// eslint-disable-next-line jest/expect-expect
	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('DR')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('mlle')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const fitButton = await buttons.waitForSelector('input[value=Fit]')
		await fitButton.evaluate(el => el.click())

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.tile circle')
		const circles = await svg.$$('.tile circle')
		expect(circles).toHaveLength(300)
	}, 60000)
})
