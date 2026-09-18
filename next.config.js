const withMDX = require('@next/mdx')({ extension: /\.mdx?$/ })
module.exports = withMDX({
  trailingSlash: true,
  pageExtensions: ['js', 'jsx', 'mdx'],
  async redirects(){
    return [
      { source: '/submit', destination: '/organizers-zone', permanent: false },
      { source: '/my-events', destination: '/organizers-zone', permanent: false },
      { source: '/review', destination: '/reviewers-zone', permanent: false }
    ]
  },
  async headers(){
    return [
      {
        source: '/api/events/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ]
  }
})
