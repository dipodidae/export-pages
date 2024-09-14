import yaml from 'js-yaml'

/**
 * Adds front matter to the given content.
 *
 * @param {string} content - The content to which the front matter will be added.
 * @param {object} [data] - The data to be included in the front matter.
 * @returns {string} The content with the added front matter.
 */
export function addFrontMatter(content, data = {}) {
  const frontMatter = yaml.dump(data)

  return `---\n${frontMatter}---\n${content}`
}
