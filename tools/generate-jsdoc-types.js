/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const yaml = require('js-yaml')
const fs = require('fs')
const Handlebars = require('handlebars')

const desiredDefinitions = ['Embedded Program', 'Pipeline', 'Pipeline Phase', 'PipelineExecution', 'Pipeline Step Metrics', 'Metric', 'Environment',
  'LogOptionRepresentation', 'Variable', 'Pipeline Execution Step State']

const cleanName = value => value.replace(/\W/g, '')
const wrapCurly = value => `{${value}}`

const toType = ref => {
  const lastSlash = ref.lastIndexOf('/')
  return ref.substring(lastSlash + 1).replace('%20', ' ')
}

Handlebars.registerHelper('isDefined', value => value !== undefined)
Handlebars.registerHelper('cleanName', cleanName)
Handlebars.registerHelper('wrapCurly', wrapCurly)
Handlebars.registerHelper('isNormalProperty', value => !value.startsWith('_'))
Handlebars.registerHelper('isDesired', value => desiredDefinitions.indexOf(value) >= 0)
Handlebars.registerHelper('type', value => {
  if (value.type === 'array') {
    return wrapCurly(`${cleanName(toType(value.items.$ref))}[]`)
  } else {
    return wrapCurly(value.type)
  }
})

const template = Handlebars.compile(`/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/*
 * THIS FILE IS GENERATED. DO NOT EDIT BY HAND. RUN 'npm run generate-jsdoc-types' to re-generate.
 * Manually created types should go in types.jsdoc.js
 */

/* eslint no-multiple-empty-lines: "off", no-trailing-spaces: "off" */

{{#each definitions}}{{#if (isDesired @key)}}
/**
{{#if (isDefined description)}} * {{description}}
 *
{{/if}} * @typedef {{wrapCurly type}} {{cleanName @key}}
{{#each properties}}{{#if (isNormalProperty @key)}} * @property {{type this}} {{@key}}{{#if (isDefined description)}} - {{{description}}}{{/if}}
{{/if}}{{/each}} */

{{/if}}{{/each}}`)

const api = yaml.safeLoad(fs.readFileSync('./api.yaml', 'utf8'))

const result = template(api)

console.log(result)
