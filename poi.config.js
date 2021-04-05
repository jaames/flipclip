module.exports = {
  entry: 'src/index.js',
  output: {
    publicUrl: '/flipclip/',
    html: {
      template: './src/template.html'
    }
  },
  babel: {
    jsx: 'react'
  }
}