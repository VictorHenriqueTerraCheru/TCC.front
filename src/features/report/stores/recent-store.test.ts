import { useRecentStore } from './recent-store'

describe('recent-store', () => {
  it('saves the recent categories in localStorage', () => {
    useRecentStore.getState().report(5)

    expect(JSON.parse(localStorage.getItem('urbanReports.recentCategories')!).state.ids).toEqual([
      5,
    ])
  })
})
