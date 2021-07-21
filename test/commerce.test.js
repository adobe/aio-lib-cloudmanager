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

const { codes } = require('../src/SDKErrors')

/* global createSdkClient */ // for linter

test('postCommerceCLICommand - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.postCLICommand('1', '2', { data: 'some test data' })

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({
    status: 201,
    data: {
      test: 'test success data',
    },
  })
})

test('postCommerceCLICommand - error', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.postCLICommand('3', '4', { data: 'some test data' })

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_POST_COMMERCE({ messageValues: 'https://cloudmanager.adobe.io/program/3/environment/4/runtime/commerce/cli/ (403 Forbidden)' }),
  )
})
