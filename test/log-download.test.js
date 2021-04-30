
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

const fs = require('fs')
const del = require('del')
const { codes } = require('../src/SDKErrors')

/* global createSdkClient */ // for linter

const outputDirectory = './log-output'

beforeEach(() => {
  if (fs.existsSync(outputDirectory)) {
    del.sync(outputDirectory)
  }
})

afterEach(() => {
  del.sync(outputDirectory)
})

test('download-logs - failure -- no environment', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.downloadLogs('5', '17', 'author', 'aemerror')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_ENVIRONMENT({ messageValues: ['17', '5'] }),
  )
})

test('download-logs - failure -- no link', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.downloadLogs('4', '2', 'author', 'aemerror')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_LOGS_LINK_ENVIRONMENT({ messageValues: ['2', '4'] }),
  )
})

test('download-logs - failure -- logs link 404', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.downloadLogs('4', '3', 'author', 'aemerror', '1')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_LOGS({ messageValues: ['https://cloudmanager.adobe.io/api/program/4/environment/3/logs?service=author&name=aemerror&days=1 (404 Not Found)'] }),
  )
})

test('download-logs - success', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.downloadLogs('4', '1', 'author', 'aemerror', '1', outputDirectory)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toHaveLength(2)
  await expect(result).resolves.toMatchObject([{
    path: outputDirectory + '/1-author-aemerror-2019-09-8.log',
  },
  {
    path: outputDirectory + '/1-author-aemerror-2019-09-7.log',
  }])
})

test('download-logs - failure - download url is empty object', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.downloadLogs('4', '1', 'publish', 'empty', '1', outputDirectory)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_NO_LOG_REDIRECT({ messageValues: ['https://cloudmanager.adobe.io/api/program/4/environment/2/logs/download?service=publish&name=empty&date=2019-09-7', '{}'] }),
  )
})

test('download-logs - failure - download url return 404', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.downloadLogs('4', '1', 'publish', '404', '1', outputDirectory)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_LOG({ messageValues: ['https://cloudmanager.adobe.io/api/program/4/environment/2/logs/download?service=publish&name=404&date=2019-09-7 (404 Not Found)'] }),
  )
})

test('download-logs - failure - redirect url return 404', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.downloadLogs('4', '1', 'publish', 'redirect_fails', '1', outputDirectory)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_LOG_DOWNLOAD({ messageValues: ['https://filestore/logs/bad.log.gz', './log-output/1-publish-404-2019-09-8.log', '404', 'Not Found'] }),
  )
})
