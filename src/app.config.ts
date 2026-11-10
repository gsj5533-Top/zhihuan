export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/create/index',
    'pages/detail/index',
    'pages/retell/index',
    'pages/confirm/index',
    'pages/points/index',
    'pages/mine/index',
    'pages/admin/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F8FAF9',
    navigationBarTitleText: '知换',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#8A9A92',
    selectedColor: '#0B9E5F',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '交换',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-selected.png'
      },
      {
        pagePath: 'pages/points/index',
        text: '积分',
        iconPath: 'assets/tabbar/points.png',
        selectedIconPath: 'assets/tabbar/points-selected.png'
      },
      {
        pagePath: 'pages/create/index',
        text: '发起',
        iconPath: 'assets/tabbar/create.png',
        selectedIconPath: 'assets/tabbar/create-selected.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tabbar/mine.png',
        selectedIconPath: 'assets/tabbar/mine-selected.png'
      }
    ]
  }
})
