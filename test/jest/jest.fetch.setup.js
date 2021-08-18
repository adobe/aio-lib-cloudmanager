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

/* eslint jsdoc/require-jsdoc: "off" */

const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')
const nodeFetch = jest.requireActual('node-fetch')
const fetchMock = require('fetch-mock').sandbox()
Object.assign(fetchMock.config, nodeFetch, {
  fetch: nodeFetch,
})
const _ = require('lodash')

jest.setMock('cross-fetch', fetchMock)
global.fetchMock = fetchMock

afterEach(() => fetchMock.restore())

function mockResponseWithOrgId (url, orgId, response) {
  fetchMock.mock({ url, headers: { 'x-gw-ims-org-id': orgId }, name: `${url}-org-id-${orgId}` }, response)
}

function mockResponseWithMethod (url, method, response) {
  fetchMock.mock({ url, method, name: `${method}-${url}` }, response)
}

global.mockFetchResponseWithMethod = mockResponseWithMethod

beforeEach(() => {
  mockResponseWithOrgId('https://cloudmanager.adobe.io/api/programs', 'forbidden', {
    status: 403,
    headers: {
      'content-type': 'application/json',
    },
    body: {
      error_code: '1234',
      message: 'some message',
    },
  })
  mockResponseWithOrgId('https://cloudmanager.adobe.io/api/programs', 'not-found', 404)
  mockResponseWithOrgId('https://cloudmanager.adobe.io/api/programs', 'empty', {})
  mockResponseWithOrgId('https://cloudmanager.adobe.io/api/programs', 'unauthorized', {
    status: 401,
    headers: {
      'content-type': 'application/problem+json',
    },
    body: 'Unauthorized',
  })
  mockResponseWithOrgId('https://cloudmanager.adobe.io/api/programs', 'good', {
    _embedded: {
      programs: [
        {
          id: '4',
          name: 'test0',
          enabled: true,
          _links: {
            self: {
              href: '/api/program/4',
            },
          },
        },
        {
          id: '5',
          name: 'test1',
          enabled: true,
          _links: {
            self: {
              href: '/api/program/5',
            },
          },
        },
        {
          id: '6',
          name: 'test2',
          enabled: false,
          _links: {
            self: {
              href: '/api/program/6',
            },
          },
        },
        {
          id: '7',
          name: 'test3',
          enabled: true,
          _links: {
            self: {
              href: '/api/program/7',
            },
          },
        },
        {
          id: '9',
          name: 'test4',
          enabled: true,
          _links: {
            self: {
              href: '/api/program/9',
            },
          },
        },
      ],
    },
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4', {
    id: '4',
    name: 'test0',
    enabled: true,
    _links: {
      self: {
        href: '/api/program/4',
      },
      'http://ns.adobe.com/adobecloud/rel/pipelines': {
        href: '/api/program/4/pipelines',
      },
      'http://ns.adobe.com/adobecloud/rel/environments': {
        href: '/api/program/4/environments',
      },
      'http://ns.adobe.com/adobecloud/rel/ipAllowlists': {
        href: '/api/program/4/ipAllowlists',
      },
    },
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/pipelines', {
    _embedded: {
      pipelines: [],
    },
  })

  let useEmptyEmbeddedObjectForProgram4Environments = false

  fetchMock.resetProgram4EmbeddedEnvironments = () => {
    useEmptyEmbeddedObjectForProgram4Environments = false
  }

  fetchMock.setProgram4EmbeddedEnvironmentsToEmptyObject = () => {
    useEmptyEmbeddedObjectForProgram4Environments = true
  }

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environments', () => {
    if (useEmptyEmbeddedObjectForProgram4Environments) {
      return {
        _embedded: {},
      }
    } else {
      return {
        _embedded: {
          environments: [
            {
              _links: {
                self: {
                  href: '/api/program/4/environment/1',
                  templated: false,
                },
                'http://ns.adobe.com/adobecloud/rel/logs': {
                  href: '/api/program/4/environment/1/logs?service={service}&name={name}&days={days}',
                  templated: true,
                },
                'http://ns.adobe.com/adobecloud/rel/variables': {
                  href: '/api/program/4/environment/1/variables',
                },
                'http://ns.adobe.com/adobecloud/rel/developerConsole': {
                  href: 'https://github.com/adobe/aio-cli-plugin-cloudmanager',
                },
              },
              id: '1',
              programId: '4',
              name: 'TestProgram_prod',
              description: 'description for TestProgram_prod',
              type: 'prod',
              availableLogOptions: [
                {
                  service: 'author',
                  name: 'aemerror',
                },
                {
                  service: 'author',
                  name: 'aemrequest',
                },
                {
                  service: 'author',
                  name: 'aemaccess',
                },
                {
                  service: 'publish',
                  name: 'aemerror',
                },
                {
                  service: 'publish',
                  name: 'aemrequest',
                },
                {
                  service: 'publish',
                  name: 'aemaccess',
                },
                {
                  service: 'dispatcher',
                  name: 'httpdaccess',
                },
                {
                  service: 'dispatcher',
                  name: 'httpderror',
                },
                {
                  service: 'dispatcher',
                  name: 'aemdispatcher',
                },
              ],
            },
            {
              _links: {
                self: {
                  href: '/api/program/4/environment/2',
                  templated: false,
                },
              },
              id: '2',
              programId: '4',
              name: 'TestProgram_stage',
              description: 'description for TestProgram_stage',
              type: 'stage',
              availableLogs: [],
              namespace: 'ns',
              cluster: 'cs',
            },
            {
              _links: {
                self: {
                  href: '/api/program/4/environment/3',
                  templated: false,
                },
                'http://ns.adobe.com/adobecloud/rel/variables': {
                  href: '/api/program/4/environment/3/variables',
                },
                'http://ns.adobe.com/adobecloud/rel/logs': {
                  href: '/api/program/4/environment/3/logs?service={service}&name={name}&days={days}',
                  templated: true,
                },
                'http://ns.adobe.com/adobecloud/rel/commerceCommandExecution': {
                  href: '/api/program/4/environment/3/runtime/commerce/cli/',
                },
                'http://ns.adobe.com/adobecloud/rel/commerceCommandExecution/id': {
                  href: '/api/program/4/environment/3/runtime/commerce/command-execution/{commandExecutionId}',
                  templated: true,
                },
              },
              id: '3',
              programId: '4',
              name: 'TestProgram_dev',
              description: 'description for TestProgram_dev',
              type: 'dev',
            },
            {
              _links: {
                self: {
                  href: '/api/program/4/environment/10',
                  templated: false,
                },
                'http://ns.adobe.com/adobecloud/rel/variables': {
                  href: '/api/program/4/environment/10/variables',
                },
                'http://ns.adobe.com/adobecloud/rel/commerceCommandExecution': {
                  href: '/api/program/4/environment/10/runtime/commerce/cli/',
                },
                'http://ns.adobe.com/adobecloud/rel/commerceCommandExecution/id': {
                  href: '/api/program/4/environment/10/runtime/commerce/command-execution/{commandExecutionId}',
                  templated: true,
                },
              },
              id: '10',
              programId: '4',
              name: 'TestProgram_dev2',
              description: 'description for TestProgram_dev2',
              type: 'dev',
            },
            {
              _links: {
                self: {
                  href: '/api/program/4/environment/11',
                  templated: false,
                },
                'http://ns.adobe.com/adobecloud/rel/variables': {
                  href: '/api/program/4/environment/11/variables',
                },
              },
              id: '11',
              programId: '4',
              name: 'TestProgram_dev3',
              description: 'description for TestProgram_dev3',
              type: 'dev',
            },
          ],
        },
        _totalNumberOfItems: 3,

      }
    }
  },
  )
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/environment/3', 'DELETE', {
    status: 400,
    headers: {
      'content-type': 'application/problem+json',
    },
    body: {
      type: 'http://ns.adobe.com/adobecloud/random-exception-with-no-title',
      errors: [
        'some error',
      ],
    },
  })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/environment/11', 'DELETE', 204)

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs?service=author&name=aemerror&days=1', {
    _links: {
      self: {
        href: '/api/program/4/environment/1/logs?service=author&type=aemerror&days=1',
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
    },
    service: ['author'],
    name: ['aemerror'],
    days: 1,
    _embedded: {
      downloads: [
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': {
              href: '/api/program/4/environment/1/logs/download?service=author&name=aemerror&date=2019-09-8',
              templated: false,
            },
            'http://ns.adobe.com/adobecloud/rel/logs/tail': {
              href: 'https://filestore/logs/author_aemerror_2019-09-8.log',
            },
          },
          service: 'author',
          name: 'aemerror',
          date: '2019-09-8',
          programId: 4,
          environmentId: 1,
        },
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': {
              href: '/api/program/4/environment/1/logs/download?service=author&name=aemerror&date=2019-09-7',
              templated: false,
            },
          },
          service: 'author',
          name: 'aemerror',
          date: '2019-09-7',
          programId: 4,
          environmentId: 1,
        },
      ],
    },
  })

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs?service=publish&name=aemerror&days=1', {
    _links: {
      self: {
        href: '/api/program/4/environment/1/logs?service=publish&type=aemerror&days=1',
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
    },
    service: ['author'],
    name: ['aemerror'],
    days: 1,
    _embedded: {
      downloads: [
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': {
              href: '/api/program/4/environment/1/logs/download?service=publish&name=aemerror&date=2019-09-8',
              templated: false,
            },
            'http://ns.adobe.com/adobecloud/rel/logs/tail': {
              href: 'https://filestore/logs/publish_aemerror_2019-09-8.log',
            },
          },
          service: 'publish',
          name: 'aemerror',
          date: '2019-09-8',
          programId: 4,
          environmentId: 1,
        },
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': {
              href: '/api/program/4/environment/1/logs/download?service=publish&name=aemerror&date=2019-09-7',
              templated: false,
            },
          },
          service: 'publish',
          name: 'aemerror',
          date: '2019-09-7',
          programId: 4,
          environmentId: 1,
        },
      ],
    },
  })

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs?service=preview&name=aemerror&days=1', {
    _links: {
      self: {
        href: '/api/program/4/environment/1/logs?service=author&type=aemerror&days=1',
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
    },
    service: ['preview'],
    name: ['aemerror'],
    days: 1,
    _embedded: {
      downloads: [
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': [{
              href: '/api/program/4/environment/1/logs/download?service=preview&name=aemerror&date=2019-09-8&index=1',
              templated: false,
            }, {
              href: '/api/program/4/environment/1/logs/download?service=preview&name=aemerror&date=2019-09-8&index=2',
              templated: false,
            }],
            'http://ns.adobe.com/adobecloud/rel/logs/tail': {
              href: 'https://filestore/logs/author_aemerror_2019-09-8.log',
            },
          },
          service: 'author',
          name: 'aemerror',
          date: '2019-09-8',
          programId: 4,
          environmentId: 1,
        },
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': {
              href: '/api/program/4/environment/1/logs/download?service=author&name=aemerror&date=2019-09-7',
              templated: false,
            },
          },
          service: 'author',
          name: 'aemerror',
          date: '2019-09-7',
          programId: 4,
          environmentId: 1,
        },
      ],
    },
  })

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs?service=preview&name=aemaccess&days=1', {
    _links: {
      self: {
        href: '/api/program/4/environment/1/logs?service=preview&type=aemaccess&days=1',
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
    },
    service: ['preview'],
    name: ['aemaccess'],
    days: 1,
    _embedded: {
      downloads: [
        {
          service: 'preview',
          name: 'aemaccess',
          date: '2019-09-8',
          programId: 4,
          environmentId: 1,
        },
      ],
    },
  })

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs?service=author&name=aemaccess&days=1', {
    _links: {
      self: {
        href: '/api/program/4/environment/1/logs?service=author&type=aemaccess&days=1',
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
    },
    service: ['author'],
    name: ['aemaccess'],
    days: 1,
    _embedded: {
    },
  })

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs/download?service=author&name=aemerror&date=2019-09-8', {
    redirect: 'https://filestore/logs/author_aemerror_2019-09-8.log.gz',
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs/download?service=author&name=aemerror&date=2019-09-7', {
    redirect: 'https://filestore/logs/author_aemerror_2019-09-7.log.gz',
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs/download?service=preview&name=aemerror&date=2019-09-8&index=1', {
    redirect: 'https://filestore/logs/author_aemerror_2019-09-7.log.gz',
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs/download?service=preview&name=aemerror&date=2019-09-8&index=2', {
    redirect: 'https://filestore/logs/author_aemerror_2019-09-7.log.gz',
  })

  fetchMock.mock('https://filestore/logs/author_aemerror_2019-09-8.log.gz', () => {
    return new nodeFetch.Response(fs.createReadStream(path.join(__dirname, 'data/file.log.gz')))
  })
  fetchMock.mock('https://filestore/logs/author_aemerror_2019-09-7.log.gz', () => {
    return new nodeFetch.Response(fs.createReadStream(path.join(__dirname, 'data/file.log.gz')))
  })

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs?service=publish&name=empty&days=1', {
    _links: {
      self: {
        href: '/api/program/4/environment/1/logs?service=publish&name=empty&days=1',
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
    },
    service: ['publish'],
    name: ['empty'],
    days: 1,
    _embedded: {
      downloads: [
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': {
              href: '/api/program/4/environment/2/logs/download?service=publish&name=empty&date=2019-09-7',
              templated: false,
            },
          },
          service: 'publish',
          name: 'aemerror',
          date: '2019-09-8',
          programId: 4,
          environmentId: 2,
        },
      ],
    },
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/2/logs/download?service=publish&name=empty&date=2019-09-7', {})

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs?service=publish&name=aemerror&days=2', {
    _links: {
      self: {
        href: '/api/program/4/environment/1/logs?service=publish&type=aemerror&days=1',
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
    },
    service: ['publish'],
    name: ['aemerror'],
    days: 1,
    _embedded: {
      downloads: [
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': {
              href: '/api/program/4/environment/2/logs/download?service=publish&name=aemerror&date=2019-09-7',
              templated: false,
            },
          },
          service: 'publish',
          name: 'aemerror',
          date: '2019-09-8',
          programId: 4,
          environmentId: 2,
        },
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': {
              href: '/api/program/4/environment/2/logs/download?service=publish&name=aemerror&date=2019-09-6',
              templated: false,
            },
          },
          service: 'publish',
          name: 'aemerror',
          date: '2019-09-7',
          programId: 4,
          environmentId: 2,
        },
      ],
    },
  })

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs?service=publish&name=404&days=1', {
    _links: {
      self: {
        href: '/api/program/4/environment/1/logs?service=publish&name=404&days=1',
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
    },
    service: ['publish'],
    name: ['404'],
    days: 1,
    _embedded: {
      downloads: [
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': {
              href: '/api/program/4/environment/2/logs/download?service=publish&name=404&date=2019-09-7',
              templated: false,
            },
          },
          service: 'publish',
          name: '404',
          date: '2019-09-8',
          programId: 4,
          environmentId: 2,
        },
      ],
    },
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/2/logs/download?service=publish&name=404&date=2019-09-7', 404)

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs?service=publish&name=redirect_fails&days=1', {
    _links: {
      self: {
        href: '/api/program/4/environment/1/logs?service=publish&name=404&days=1',
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
    },
    service: ['publish'],
    name: ['redirect_fails'],
    days: 1,
    _embedded: {
      downloads: [
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': {
              href: '/api/program/4/environment/2/logs/download?service=publish&name=redirect_fails&date=2019-09-7',
              templated: false,
            },
          },
          service: 'publish',
          name: '404',
          date: '2019-09-8',
          programId: 4,
          environmentId: 2,
        },
      ],
    },
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/2/logs/download?service=publish&name=redirect_fails&date=2019-09-7', {
    redirect: 'https://filestore/logs/bad.log.gz',
  })
  fetchMock.mock('https://filestore/logs/bad.log.gz', 404)

  fetchMock.mock({ url: 'https://filestore/logs/author_aemerror_2019-09-8.log', method: 'HEAD', name: 'tail-log-head' }, {
    headers: {
      'content-length': '500',
    },
  })
  fetchMock.mock({
    url: 'https://filestore/logs/author_aemerror_2019-09-8.log',
    headers: { range: 'bytes=500-' },
    name: 'tail-log-first',
  }, () => {
    const logResponse = new Readable()
    logResponse.push('some log message\n')
    logResponse.push(null)
    return {
      status: 206,
      headers: {
        'content-length': '1000',
      },
      body: logResponse,
    }
  }, { sendAsJson: false })
  fetchMock.mock({
    url: 'https://filestore/logs/author_aemerror_2019-09-8.log',
    headers: { range: 'bytes=1500-' },
    name: 'tail-log-second',
  }, () => {
    const logResponse = new Readable()
    logResponse.push('some second log message\n')
    logResponse.push(null)
    return {
      status: 206,
      headers: {
        'content-length': '1000',
      },
      body: logResponse,
    }
  }, { sendAsJson: false })

  let tailLogAuthorAemerrorThirdCalled = false

  fetchMock.mock({
    url: 'https://filestore/logs/author_aemerror_2019-09-8.log',
    headers: { range: 'bytes=2500-' },
    name: 'tail-log-third',
  }, () => {
    if (!tailLogAuthorAemerrorThirdCalled) {
      tailLogAuthorAemerrorThirdCalled = true
      return {
        status: 416,
      }
    } else {
      const logResponse = new Readable()
      logResponse.push('this will fail\n')
      logResponse.push(null)
      return {
        status: 200,
        headers: {
          'content-length': '1000',
        },
        body: logResponse,
      }
    }
  }, { sendAsJson: false })

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/logs?service=author&name=aemrequest&days=1', {
    _links: {
      self: {
        href: '/api/program/4/environment/1/logs?service=author&type=aemrequest&days=1',
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
    },
    service: ['author'],
    name: ['aemrequest'],
    days: 1,
    _embedded: {
      downloads: [
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': {
              href: '/api/program/4/environment/1/logs/download?service=author&name=aemrequest&date=2019-09-8',
              templated: false,
            },
            'http://ns.adobe.com/adobecloud/rel/logs/tail': {
              href: 'https://filestore/logs/author_aemrequest_2019-09-8.log',
            },
          },
          service: 'author',
          name: 'aemrequest',
          date: '2019-09-8',
          programId: 4,
          environmentId: 1,
        },
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/logs/download': {
              href: '/api/program/4/environment/1/logs/download?service=author&name=aemrequest&date=2019-09-7',
              templated: false,
            },
          },
          service: 'author',
          name: 'aemrequest',
          date: '2019-09-7',
          programId: 4,
          environmentId: 1,
        },
      ],
    },
  })

  let tailLogRequestHeadCallCount = 0

  fetchMock.mock({ url: 'https://filestore/logs/author_aemrequest_2019-09-8.log', method: 'HEAD', name: 'tail-log-aemrequest-head' }, () => {
    tailLogRequestHeadCallCount++
    return {
      headers: {
        'content-length': tailLogRequestHeadCallCount === 2 ? '3500' : '500',
      },
    }
  })
  fetchMock.mock({
    url: 'https://filestore/logs/author_aemrequest_2019-09-8.log',
    headers: { range: 'bytes=500-' },
    name: 'tail-log-aemrequest-first',
  }, () => {
    const logResponse = new Readable()
    logResponse.push('some request log message\n')
    logResponse.push(null)
    return {
      status: 206,
      headers: {
        'content-length': '200',
      },
      body: logResponse,
    }
  }, { sendAsJson: false })
  fetchMock.mock({
    url: 'https://filestore/logs/author_aemrequest_2019-09-8.log',
    headers: { range: 'bytes=700-' },
    name: 'tail-log-aemrequest-second',
  }, () => {
    const logResponse = new Readable()
    logResponse.push('some second request log message\n')
    logResponse.push(null)
    return {
      status: 206,
      headers: {
        'content-length': '1000',
      },
      body: logResponse,
    }
  }, { sendAsJson: false })

  let tailLogAemrequestThirdCallCount = 0

  fetchMock.mock({
    url: 'https://filestore/logs/author_aemrequest_2019-09-8.log',
    headers: { range: 'bytes=1700-' },
    name: 'tail-log-aemrequest-third',
  }, () => {
    tailLogAemrequestThirdCallCount++
    if (tailLogAemrequestThirdCallCount < 3) {
      return {
        status: 416,
      }
    } else {
      const logResponse = new Readable()
      logResponse.push('this will fail\n')
      logResponse.push(null)
      return {
        status: 200,
        headers: {
          'content-length': '1000',
        },
        body: logResponse,
      }
    }
  }, { sendAsJson: false })

  mockResponseWithMethod('https://filestore/logs/publish_aemerror_2019-09-8.log', 'HEAD', {
    headers: {
      'content-length': 500,
    },
  })
  mockResponseWithMethod('https://filestore/logs/publish_aemerror_2019-09-8.log', 'GET', 404)

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/3/logs?service=author&name=aemerror&days=1', 404)
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/1/variables', {
    _links: {
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      self: {
        href: '/api/program/4/environment/1/variables',
        templated: false,
      },
    },
    _embedded: {
      variables: [
        {
          name: 'KEY',
          value: 'value',
          type: 'string',
        },
        {
          name: 'I_AM_A_SECRET',
          type: 'secretString',
        },
      ],
    },
    _totalNumberOfItems: 2,
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/3/variables', {
    _links: {
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      self: {
        href: '/api/program/4/environment/3/variables',
        templated: false,
      },
    },
    _embedded: {
      variables: [
      ],
    },
    _totalNumberOfItems: 0,
  })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/ipAllowlists', 'GET', {
    _embedded: {
      ipAllowlists: [{
        id: '1',
        name: 'test',
        ipCidrSet: ['1.1.1.1/5'],
        programId: '4',
        bindings: [{
          environmentId: '5',
          tier: 'publish',
          _links: {
            self: {
              href: '/api/program/4/ipAllowlist/1/binding/1',
              templated: false,
            },
          },
        }, {
          environmentId: '6',
          tier: 'publish',
          _links: {
            self: {
              href: '/api/program/4/ipAllowlist/1/binding/2',
              templated: false,
            },
          },
        }],
        _links: {
          self: {
            href: '/api/program/4/ipAllowlist/1',
            templated: false,
          },
          'http://ns.adobe.com/adobecloud/rel/ipAllowlistBindings': {
            href: '/api/program/4/ipAllowlist/1/bindings',
            templated: false,
          },
        },
      }, {
        id: '2',
        name: 'test2-cannotbeupdated',
        ipCidrSet: ['1.1.1.1/5'],
        programId: '4',
        bindings: [],
        _links: {
          self: {
            href: '/api/program/4/ipAllowlist/2',
            templated: false,
          },
          'http://ns.adobe.com/adobecloud/rel/ipAllowlistBindings': {
            href: '/api/program/4/ipAllowlist/2/bindings',
            templated: false,
          },
        },
      }],
    },
  })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/ipAllowlists', 'POST', (url, opts) => {
    const body = JSON.parse(opts.body)
    if (body.name === 'test') {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/problem+json',
        },
        body: {
          type: 'http://ns.adobe.com/adobecloud/ipallowlist-generic-exception',
          status: 400,
          title: 'IP Allowlist exception',
          errors: [{ code: 'IP_ALLOWLIST_NAME_ALREADY_EXISTS', message: 'IP Allowlist name should be unique' }],
        },
      }
    } else {
      return {
        id: '3',
        name: body.name,
        ipCidrSet: body.ipCidrSet,
        programId: '4',
      }
    }
  })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/ipAllowlist/1', 'PUT', 204)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/ipAllowlist/1/bindings', 'POST', 204)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/ipAllowlist/1/binding/1', 'DELETE', 204)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/ipAllowlist/1/binding/2', 'DELETE', 400)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/ipAllowlist/1', 'DELETE', 204)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/ipAllowlist/2', 'PUT', 400)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/ipAllowlist/2', 'DELETE', 400)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/ipAllowlist/2/bindings', 'POST', 400)

  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5', 'DELETE', {
    status: 400,
    headers: {
      'content-type': 'application/problem+json',
    },
    body: {
      type: 'http://ns.adobe.com/adobecloud/random-exception-with-a-title',
      title: 'Test Exception',
      errors: [
        'some error',
      ],
    },
  })

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/5', {
    id: '5',
    name: 'test1',
    enabled: true,
    _links: {
      self: {
        href: '/api/program/5',
      },
      'http://ns.adobe.com/adobecloud/rel/pipelines': {
        href: '/api/program/5/pipelines',
      },
      'http://ns.adobe.com/adobecloud/rel/environments': {
        href: '/api/program/5/environments',
      },
    },
  })
  const pipeline5 = {
    id: '5',
    name: 'test1',
    status: 'IDLE',
    phases: [
      {
        name: 'VALIDATE',
        type: 'VALIDATE',
      },
      {
        name: 'BUILD_1',
        type: 'BUILD',
        repositoryId: '1',
        branch: 'yellow',
      },
    ],
    _links: {
      self: {
        href: '/api/program/5/pipeline/5',
      },
      'http://ns.adobe.com/adobecloud/rel/execution': {
        href: '/api/program/5/pipeline/5/execution',
      },
      'http://ns.adobe.com/adobecloud/rel/executions': {
        href: '/api/program/5/pipeline/5/executions',
      },
      'http://ns.adobe.com/adobecloud/rel/execution/id': {
        href: '/api/program/5/pipeline/5/execution/{executionId}',
        templated: true,
      },
      'http://ns.adobe.com/adobecloud/rel/variables': {
        href: '/api/program/5/pipeline/5/variables',
      },
    },
  }

  let useEmptyEmbeddedObjectForProgram5Pipelines = false

  fetchMock.resetProgram5EmbeddedPipelines = () => {
    useEmptyEmbeddedObjectForProgram5Pipelines = false
  }

  fetchMock.setProgram5EmbeddedPipelinesToEmptyObject = () => {
    useEmptyEmbeddedObjectForProgram5Pipelines = true
  }

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/5/pipelines', () => {
    if (useEmptyEmbeddedObjectForProgram5Pipelines) {
      return {
        _embedded: {},
      }
    } else {
      return {
        _embedded: {
          pipelines: [
            pipeline5,
            {
              id: '6',
              name: 'test2',
              status: 'BUSY',
              _links: {
                self: {
                  href: '/api/program/5/pipeline/6',
                },
                'http://ns.adobe.com/adobecloud/rel/execution': {
                  href: '/api/program/5/pipeline/6/execution',
                },
                'http://ns.adobe.com/adobecloud/rel/execution/id': {
                  href: '/api/program/5/pipeline/6/execution/{executionId}',
                  templated: true,
                },
              },
            },
            {
              id: '7',
              name: 'test3',
              status: 'BUSY',
              _links: {
                self: {
                  href: '/api/program/5/pipeline/7',
                },
                'http://ns.adobe.com/adobecloud/rel/execution': {
                  href: '/api/program/5/pipeline/7/execution',
                },
                'http://ns.adobe.com/adobecloud/rel/execution/id': {
                  href: '/api/program/5/pipeline/7/execution/{executionId}',
                  templated: true,
                },
                'http://ns.adobe.com/adobecloud/rel/variables': {
                  href: '/api/program/5/pipeline/7/variables',
                },
                'http://ns.adobe.com/adobecloud/rel/cache': {
                  href: '/api/program/5/pipeline/7/cache',
                },
              },
            },
            {
              id: '8',
              name: 'test4',
              status: 'IDLE',
              phases: [
                {
                  name: 'VALIDATE',
                  type: 'VALIDATE',
                },
                {
                  name: 'BUILD_1',
                  type: 'BUILD',
                  repositoryId: '1',
                  branch: 'yellow',
                },
              ],
              _links: {
                self: {
                  href: '/api/program/5/pipeline/8',
                },
                'http://ns.adobe.com/adobecloud/rel/execution': {
                  href: '/api/program/5/pipeline/8/execution',
                },
                'http://ns.adobe.com/adobecloud/rel/execution/id': {
                  href: '/api/program/5/pipeline/8/execution/{executionId}',
                  templated: true,
                },
                'http://ns.adobe.com/adobecloud/rel/variables': {
                  href: '/api/program/5/pipeline/8/variables',
                },
                'http://ns.adobe.com/adobecloud/rel/cache': {
                  href: '/api/program/5/pipeline/8/cache',
                },
              },
            },
            {
              id: '9',
              name: 'test5',
              status: 'IDLE',
              phases: [
                {
                  name: 'VALIDATE',
                  type: 'VALIDATE',
                },
                {
                  name: 'DEPLOY_1',
                  type: 'DEPLOY',
                },
              ],
              _links: {
                self: {
                  href: '/api/program/5/pipeline/8',
                },
                'http://ns.adobe.com/adobecloud/rel/execution': {
                  href: '/api/program/5/pipeline/8/execution',
                },
                'http://ns.adobe.com/adobecloud/rel/execution/id': {
                  href: '/api/program/5/pipeline/8/execution/{executionId}',
                  templated: true,
                },
                'http://ns.adobe.com/adobecloud/rel/variables': {
                  href: '/api/program/5/pipeline/8/variables',
                },
              },
            },
          ],
        },
      }
    }
  })

  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution', 'GET', 404)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution', 'PUT', {
    status: 201,
    headers: {
      location: 'https://cloudmanager.adobe.io/api/program/4/pipeline/8555/execution/12742',
    },
    body: require('./data/newExecution.json'),
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/5/environments', {
    _embedded: {
      environments: [],
    },
  })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/5', 'DELETE', 204)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/5', 'PATCH', (url, opts) => {
    const parsed = JSON.parse(opts.body)
    const newPipeline = _.cloneDeep(pipeline5)
    const buildPhase = newPipeline.phases.find(phase => phase.type === 'BUILD')
    buildPhase.branch = parsed.phases[0].branch
    if (parsed.phases[0].repositoryId) {
      buildPhase.repositoryId = parsed.phases[0].repositoryId
    }
    return newPipeline
  })

  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/8', 'PATCH', 405)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/8', 'DELETE', {
    status: 400,
    headers: {
      'content-type': 'application/problem+json',
    },
    body: {
      type: 'http://ns.adobe.com/adobecloud/random-exception-with-a-message',
      title: 'Test Exception',
      errors: {
        something: { message: 'some error message' },
      },
    },
  })

  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/6/execution', 'GET', require('./data/execution1000.json'))
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/6/execution', 'PUT', 412)

  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7', 'DELETE', {
    status: 400,
    headers: {
      'content-type': 'application/problem+json',
    },
    body: {
      type: 'http://ns.adobe.com/adobecloud/random-exception-with-a-message',
      title: 'Test Exception',
      errors: [
        { message: 'some error message' },
      ],
    },
  })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution', 'PUT', 404)
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/5/pipeline/5/variables', {
    _links: {
      'http://ns.adobe.com/adobecloud/rel/pipeline': {
        href: '/api/program/5/pipeline/5',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/5',
        templated: false,
      },
      self: {
        href: '/api/program/5/pipeline/5/variables',
        templated: false,
      },
    },
    _embedded: {
      variables: [
        {
          name: 'KEY',
          value: 'value',
          type: 'string',
        },
        {
          name: 'I_AM_A_SECRET',
          type: 'secretString',
        },
      ],
    },
    _totalNumberOfItems: 2,
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/5/pipeline/7/variables', 404)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/cache', 'DELETE', {})
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/8/variables', 'GET', {
    _links: {
      'http://ns.adobe.com/adobecloud/rel/pipeline': {
        href: '/api/program/5/pipeline/8',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/5',
        templated: false,
      },
      self: {
        href: '/api/program/5/pipeline/8/variables',
        templated: false,
      },
    },
    _embedded: {
      variables: [
      ],
    },
    _totalNumberOfItems: 0,
  })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/8/variables', 'PATCH', {
    status: 400,
    headers: {
      'content-type': 'application/problem+json',
      'x-request-id': 'abcdefg',
    },
    body: {
      type: 'http://ns.adobe.com/adobecloud/validation-exception',
      title: 'Constraint Violations',
      errors: {
        'patchPipelineVariables.arg2[0].name': {
          field: 'patchPipelineVariables.arg2[0].name',
          code: 'VALIDATION_ERROR_CODE',
          message: 'must match "[a-zA-Z_][a-zA-Z_0-9.]*"',
          invalidValue: 'some-name',
        },
      },
    },
  })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/8/cache', 'DELETE', 500)

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/6', {
    id: '6',
    name: 'test2',
    enabled: false,
    _links: {
      self: {
        href: '/api/program/6',
      },
      'http://ns.adobe.com/adobecloud/rel/pipelines': {
        href: '/api/program/6/pipelines',
      },
      'http://ns.adobe.com/adobecloud/rel/environments': {
        href: '/api/program/6/environments',
      },
      'http://ns.adobe.com/adobecloud/rel/ipAllowlists': {
        href: '/api/program/6/ipAllowlists',
      },
    },
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/6/pipelines', 404)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/6/environments', 'GET', 404)

  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/6/ipAllowlists', 'GET', {
    _embedded: {
      ipAllowlists: [],
    },
  })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/6/ipAllowlists', 'POST', 400)

  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001', 'GET', require('./data/execution1001.json'))
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution/1002', 'GET', 404)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1003', 'GET', require('./data/execution1003.json'))
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1004', 'GET', require('./data/execution1004.json'))
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4596/step/8493/metrics', 'GET', require('./data/codequality-metrics.json'))
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4597/step/8494/metrics', 'GET', {})
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4597/step/8495/metrics', 'GET', 404)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4597/step/8498/metrics', 'GET', require('./data/experienceaudit-metrics.json'))
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4596/step/8493/logs', 'GET', {
    redirect: 'https://somesite.com/log.txt',
  })

  fetchMock.mock('https://somesite.com/log.txt', () => {
    const logResponse = new Readable()
    logResponse.push('some log line\n')
    logResponse.push('some other log line\n')
    logResponse.push(null)
    return logResponse
  }, { sendAsJson: false })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4596/step/8493/logs?file=somethingspecial', 'GET', {
    redirect: 'https://somesite.com/special.txt',
  })
  const specialLogResponse = new Readable()
  specialLogResponse.push('some special log line\n')
  specialLogResponse.push('some other special log line\n')
  specialLogResponse.push(null)
  fetchMock.mock('https://somesite.com/special.txt', specialLogResponse, { sendAsJson: false })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4597/step/8494/logs', 'GET', 404)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4598/step/8500/logs', 'GET', {})

  let executionForPipeline7 = '1001'
  const pipeline7Executions = {
    1001: require('./data/execution1001.json'),
    1003: require('./data/execution1003.json'),
    1005: require('./data/execution1005.json'),
    1006: require('./data/execution1006.json'),
    1007: require('./data/execution1007.json'),
    1008: require('./data/execution1008.json'),
    1009: require('./data/execution1009.json'),
    1010: require('./data/execution1010.json'),
    1011: require('./data/execution1011.json'),
    1012: require('./data/execution1012.json'),
    1013: require('./data/execution1013.json'),
    1014: require('./data/execution1014.json'),
    1015: require('./data/execution1015.json'),
    1016: require('./data/execution1016.json'),
    1017: require('./data/execution1017.json'),
    1018: require('./data/execution1018.json'),
  }
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution', 'GET', () => pipeline7Executions[executionForPipeline7])
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1006/phase/4596/step/8493/metrics', 'GET', require('./data/codequality-metrics.json'))

  fetchMock.setPipeline7Execution = function (id) {
    executionForPipeline7 = id
  }
  fetchMock.mock((url, opts) => url === 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1005/phase/4596/step/8492/cancel' &&
      opts.method === 'PUT' && opts.body === JSON.stringify({ cancel: true }),
  202, {
    name: 'cancel-1005',
  })
  fetchMock.mock((url, opts) => url === 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1006/phase/4596/step/8493/cancel' &&
      opts.method === 'PUT' && opts.body === JSON.stringify({ override: false }),
  202, {
    name: 'cancel-1006',
  })
  fetchMock.mock((url, opts) => url === 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1007/phase/8567/step/15490/cancel' &&
      opts.method === 'PUT' && opts.body === JSON.stringify({ approved: false }),
  202, {
    name: 'cancel-1007',
  })
  fetchMock.mock((url, opts) => url === 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1007/phase/8567/step/15490/advance' &&
      opts.method === 'PUT' && opts.body === JSON.stringify({ approved: true }),
  202, {
    name: 'advance-1007',
  })
  fetchMock.mock((url, opts) => url === 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1006/phase/4596/step/8493/advance' &&
      opts.method === 'PUT' && JSON.parse(opts.body).metrics.length === 1 && JSON.parse(opts.body).metrics[0].override === true,
  202, {
    name: 'advance-1006',
  })
  fetchMock.mock((url, opts) => url === 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1007/phase/8567/step/15492/advance' &&
      opts.method === 'PUT' && opts.body === JSON.stringify({ resume: false }),
  202, {
    name: 'cancel-1008',
  })
  fetchMock.mock((url, opts) => url === 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1007/phase/8567/step/15492/advance' &&
      opts.method === 'PUT' && opts.body === JSON.stringify({ resume: true }),
  202, {
    name: 'advance-1008',
  })
  fetchMock.mock((url, opts) => url === 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1013/phase/8567/step/15492/cancel' &&
      opts.method === 'PUT' && opts.body === JSON.stringify({ start: false }),
  202, {
    name: 'cancel-1013',
  })
  fetchMock.mock((url, opts) => url === 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1013/phase/8567/step/15492/advance' &&
      opts.method === 'PUT' && opts.body === JSON.stringify({ start: true }),
  202, {
    name: 'advance-1013',
  })
  fetchMock.mock((url, opts) => url === 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1014/phase/8567/step/15490/cancel' &&
      opts.method === 'PUT' && opts.body === JSON.stringify({ approved: false }),
  500, {
    name: 'cancel-1014',
  })
  fetchMock.mock((url, opts) => url === 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1016/phase/8567/step/15490/advance' &&
      opts.method === 'PUT' && opts.body === JSON.stringify({ approved: true }),
  500, {
    name: 'advance-1016',
  })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1017/phase/4596/step/8492/logs?file=error', 'GET', 404)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1017/phase/4596/step/8492/logs?file=noredirect', 'GET', {
    garbage: 'true',
  })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1017/phase/4596/step/8492/logs', 'GET', {
    redirect: 'https://filestore/for-tailing.txt',
  })
  fetchMock.mock({
    url: 'https://filestore/for-tailing.txt',
    headers: { range: 'bytes=0-' },
    name: 'tail-step-log-1017-first',
  }, () => {
    const logResponse = new Readable()
    logResponse.push('some log message\n')
    logResponse.push(null)
    return {
      status: 206,
      headers: {
        'content-length': '1000',
      },
      body: logResponse,
    }
  }, { sendAsJson: false })
  fetchMock.mock({
    url: 'https://filestore/for-tailing.txt',
    headers: { range: 'bytes=1000-' },
    name: 'tail-step-log-1017-second',
  }, () => {
    const logResponse = new Readable()
    logResponse.push('some second log message\n')
    logResponse.push(null)
    return {
      status: 206,
      headers: {
        'content-length': '1000',
      },
      body: logResponse,
    }
  }, { sendAsJson: false })

  let execution1017StepLogCounter = 0
  fetchMock.mock({
    url: 'https://filestore/for-tailing.txt',
    headers: { range: 'bytes=2000-' },
    name: 'tail-step-log-1017-third',
  }, () => {
    execution1017StepLogCounter++
    if (execution1017StepLogCounter === 1) {
      return {
        status: 416,
      }
    } else {
      const logResponse = new Readable()
      logResponse.push('some third log message\n')
      logResponse.push(null)
      return {
        status: 206,
        headers: {
          'content-length': '1000',
        },
        body: logResponse,
      }
    }
  }, { sendAsJson: false })

  let execution1017StepCounter = 0
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1017/phase/4596/step/8492', () => {
    execution1017StepCounter++
    if (execution1017StepCounter < 4) {
      return pipeline7Executions[1017]._embedded.stepStates[1]
    } else {
      const cloned = _.cloneDeep(pipeline7Executions[1017]._embedded.stepStates[1])
      cloned.status = 'FINISHED'
      return cloned
    }
  })

  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1018/phase/4596/step/8492/logs', 'GET', {
    redirect: 'https://filestore/for-tailing1018.txt',
  })
  fetchMock.mock({
    url: 'https://filestore/for-tailing1018.txt',
    headers: { range: 'bytes=0-' },
    name: 'tail-step-log-1018-first',
  }, () => {
    const logResponse = new Readable()
    logResponse.push('some log message\n')
    logResponse.push(null)
    return {
      status: 206,
      headers: {
        'content-length': '1000',
      },
      body: logResponse,
    }
  }, { sendAsJson: false })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1018/phase/4596/step/8492', 500)

  fetchMock.mock('https://cloudmanager.adobe.io/api/program/7', 404)
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/10/variables', 404)
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/environment/11/variables', 'GET', {
    _links: {
      'http://ns.adobe.com/adobecloud/rel/environment': {
        href: '/api/program/4/environment/1',
        templated: false,
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
        templated: false,
      },
      self: {
        href: '/api/program/4/environment/3/variables',
        templated: false,
      },
    },
    _embedded: {
      variables: [
      ],
    },
    _totalNumberOfItems: 0,
  })
  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/environment/11/variables', 'PATCH', {
    status: 400,
    headers: {
      'content-type': 'application/problem+json',
    },
    body: {
      type: 'http://ns.adobe.com/adobecloud/validation-exception',
      errors: [
        'some error',
      ],
    },
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/9', {
    id: '9',
    name: 'test4',
    enabled: true,
    _links: {
      self: {
        href: '/api/program/9',
      },
      'http://ns.adobe.com/adobecloud/rel/ipAllowlists': {
        href: '/api/program/9/ipAllowlists',
      },
    },
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/9/ipAllowlists', 400)

  // Commerce command execution mocks
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/3/runtime/commerce/command-execution/', 403)
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/6/environment/7/runtime/commerce/command-execution/8', 404)

  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/environment/10/runtime/commerce/command-execution/1', 'GET', {
    id: 1,
    status: 'RUNNNG', // PENDING, RUNNING, COMPLETED, FAILED
    type: 'bin/magento', // bin/magento, bin/ece-tools
    command: 'test command to be executed',
    message: 'One line message on the progress of command',
    options: ['Optional', 'inputs provided part of the command'],
    startedAt: 'timestamp UTC',
    completedAt: 'timestamp utc',
    startedBy: 'test runner',
    _links: {
      self: {
        href: '/api/program/4/environment/10/runtime/commerce/command-execution/1',
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
      },
      'http://ns.adobe.com/adobecloud/rel/environments': {
        href: '/api/program/4/environments',
      },
      'http://ns.adobe.com/adobecloud/rel/commerceCommandExecutions': {
        href: '/api/program/4/environment/10/runtime/commerce/command-executions',
      },
    },
  })

  mockResponseWithMethod('https://cloudmanager.adobe.io/api/program/4/environment/10/runtime/commerce/cli/', 'POST', {
    status: 201,
    data: {
      test: 'test success data',
    },
  })
  fetchMock.mock('https://cloudmanager.adobe.io/api/program/4/environment/3/runtime/commerce/cli/', 403)
})
