/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/*
Custom jsdoc2md process to ensure sorting of member functions. See https://github.com/jsdoc2md/jsdoc-to-markdown/issues/101
*/

const fs = require('fs')
const jsdoc2md = require('jsdoc-to-markdown')
const tool = require('command-line-tool')
const sortBy = require('lodash.sortby')

const options = {
  files: ['src/**/*.js'],
  template: fs.readFileSync('./docs/readme_template.md', 'utf8'),
}

jsdoc2md.getTemplateData(options).then(json => {
  delete options.files

  const topLevel = json.filter(el => el.scope === 'global')
  const memberVariables = json.filter(el => el.scope === 'instance' && el.kind === 'member')
  let memberFunctions = json.filter(el => el.scope === 'instance' && el.kind === 'function')
  memberFunctions = sortBy(memberFunctions, el => el.id)

  options.data = [
    ...topLevel,
    ...memberVariables,
    ...memberFunctions,
  ]

  const others = json.filter(el => !options.data.includes(el))
  if (others.length > 0) {
    tool.halt(`Not all jsdoc entries were filtered through: ${others}`)
  }

  jsdoc2md.render(options).then(output => {
    process.stdout.write(output)
    process.exit(0)
  }).catch(handleError)
}).catch(handleError)

function handleError (err) {
  tool.halt(err.toString())
}
