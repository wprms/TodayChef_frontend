const Urls = {
  baseUrl:
    process.env.NODE_ENV === 'development' ? '' : 'https://todaychef-net.com',
  apiUrl:
    process.env.NODE_ENV === 'development'
      ? ''
      : 'https://todaychef-net.com/api',
  documentTitle: 'todaychef-net.com',
  appStoreUrl: 'https://apps.apple.com/jp/app/todaychef/id1673180785',
  playStoreUrl:
    'https://play.google.com/store/apps/details?id=com.ksinfo.todaychef&hl=ja&gl=JP',
  defaultImage: '/default_image.png',
  uriSchemeBaseUrl: 'todaychefapp://',
};

export default Urls;
