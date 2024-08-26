import yaml from 'js-yaml'

export function addFrontMatter(content, data = {}) {
  const frontMatter = yaml.dump(data)

  return `---\n${frontMatter}---\n${content}`
}
