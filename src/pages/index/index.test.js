describe('src/pages/index/index.vue', () => {
	let page
	beforeAll(async () => {
		// 重新reLaunch至首页，并获取首页page对象（其中 program 是uni-automator自动注入的全局对象）
		page = await program.reLaunch('/src/pages/index/index')
		await page.waitFor(1000)
	})

	/**
	 * 测试步骤
	 * 1. 检测页面标题是否为 view
	 */
	it('view 组件标题', async () => {
		let view = await page.$('.common-page-head-title')
		expect(await view.text()).toBe('view')
	})
	/**
	 * 测试步骤
	 * 1. seach-box 的个数
	 * 2. content 的个数
	 */
	it('view 个数', async () => {
		let viewLen = await page.$$('.seach-box')
		expect(viewLen.length).toBe(18)
		let viewItemLen = await page.$$('.content')
		expect(viewItemLen.length).toBe(6)
	})
})
