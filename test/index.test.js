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

/* global sdk, createSdkClient, gOrgId, gApiKey, gAccessToken */ // for linter

test('sdk init test', async () => {
  const sdkClient = await createSdkClient()

  expect(sdkClient.orgId).toBe(gOrgId)
  expect(sdkClient.apiKey).toBe(gApiKey)
  expect(sdkClient.accessToken).toBe(gAccessToken)
})

test('sdk init test - no orgId', async () => {
  return expect(sdk.init(null, gApiKey, gAccessToken)).rejects.toEqual(
    new codes.ERROR_SDK_INITIALIZATION({ messageValues: 'orgId' })
  )
})

test('sdk init test - no apiKey', async () => {
  return expect(sdk.init(gOrgId, null, gAccessToken)).rejects.toEqual(
    new codes.ERROR_SDK_INITIALIZATION({ messageValues: 'apiKey' })
  )
})

test('sdk init test - no accessToken', async () => {
  return expect(sdk.init(gOrgId, gApiKey, null)).rejects.toEqual(
    new codes.ERROR_SDK_INITIALIZATION({ messageValues: 'accessToken' })
  )
})
