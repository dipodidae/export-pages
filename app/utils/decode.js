import he from 'he'

function cleanContent(content) {
  content = content.split('\n').map(line => line.trim()).join('\n')
  content = content.replace(/[\v\f\u00A0\u0085\u1680\u180E\uFEFF\u2000-\u200B\u2028\u2029\u202F\u205F\u3000]/g, '')

  return content
}

export default function (content = '') {
  content = he.decode(content)
  content = cleanContent(content)

  return content
}
