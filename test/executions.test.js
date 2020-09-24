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

const { Writable } = require('stream')
const { codes } = require('../src/SDKErrors')
const sinon = require('sinon')

/* global createSdkClient, fetchMock */ // for linter

let writable
let written = ''

beforeEach(() => {
  const write = sinon.stub().callsFake((chunk, enc, callback) => callback())
  writable = new Writable({ write })

  writable.on('finish', () => {
    written = write.args.map(args => args[0]).map(a => a.toString('utf8')).join('')
  })
})

test('getCurrentExecution - failure', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getCurrentExecution('5', '5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_EXECUTION({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution (404 Not Found)' })
  )
})

test('getCurrentExecution - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getCurrentExecution('5', '6')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toMatchObject({
    id: '1000',
    programId: '5',
    pipelineId: '6'
  })
})

test('getExecution - failure', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecution('5', '5', '1002')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_EXECUTION({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution/1002 (404 Not Found)' })
  )
})

test('getExecutionStepDetails - success', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecution('5', '7', '1001')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toHaveProperty('_embedded.stepStates')

  const actual = await result
  expect(actual._embedded.stepStates).toHaveLength(12)
})

test('getExecution - bad pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecution('5', '100', '1001')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE({ messageValues: ['100', '5'] })
  )
})

test('getQualityGateResults - failure', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getQualityGateResults('5', '5', '1002', 'codeQuality')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_EXECUTION({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution/1002 (404 Not Found)' })
  )
})

test('getQualityGateResults - success', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getQualityGateResults('5', '7', '1001', 'codeQuality')

  await expect(result instanceof Promise).toBeTruthy()

  const actual = await result
  await expect(actual.metrics).toMatchObject(expect.arrayContaining([{
    actualValue: 'A',
    comparator: 'GTE',
    expectedValue: 'B',
    id: '69602',
    kpi: 'security_rating',
    override: false,
    passed: true,
    severity: 'critical'
  }]))
  await expect(actual.metrics).toHaveLength(8)
})

test('cancelCurrentExecution - bad pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '10')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE({ messageValues: ['10', '5'] })
  )
})

test('cancelCurrentExecution - build running', async () => {
  fetchMock.setPipeline7Execution('1005')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('cancel-1005')).toBeTruthy()
})

test('cancelCurrentExecution - code quality waiting', async () => {
  fetchMock.setPipeline7Execution('1006')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('cancel-1006')).toBe(true)
})

test('cancelCurrentExecution - code quality waiting with no cancel (error state)', async () => {
  fetchMock.setPipeline7Execution('1009')

  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_CANCEL_LINK({ messageValues: 'codeQuality' })
  )
})

test('cancelCurrentExecution - approval waiting', async () => {
  fetchMock.setPipeline7Execution('1007')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('cancel-1007')).toBe(true)
})

test('cancelCurrentExecution - deploy waiting', async () => {
  fetchMock.setPipeline7Execution('1008')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('cancel-1008')).toBe(true)
})

test('cancelCurrentExecution - deploy waiting with no advance (error state)', async () => {
  fetchMock.setPipeline7Execution('1010')

  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_ADVANCE_LINK({ messageValues: 'deploy' })
  )
})

test('advanceCurrentExecution - bad pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '10')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE({ messageValues: ['10', '5'] })
  )
})

test('advanceCurrentExecution - build running', async () => {
  fetchMock.setPipeline7Execution('1005')

  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_WAITING_STEP({ messageValues: '7' })
  )
})

test('advanceCurrentExecution - code quality waiting', async () => {
  fetchMock.setPipeline7Execution('1006')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('advance-1006')).toBe(true)
})

test('advanceCurrentExecution - approval waiting', async () => {
  fetchMock.setPipeline7Execution('1007')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('advance-1007')).toBe(true)
})

test('getExecutionStepLog - failure', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '5', '1002', 'codeQuality')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_EXECUTION({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution/1002 (404 Not Found)' })
  )
})

test('getExecutionStepLog - success', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '7', '1001', 'codeQuality', undefined, writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  expect(written).toEqual('some log line\nsome other log line\n')
})

test('getExecutionStepLog - success v2', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '7', '1001', 'codeQuality', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  expect(written).toEqual('some log line\nsome other log line\n')
})

test('getExecutionStepLog - success alternate file', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '7', '1001', 'codeQuality', 'somethingspecial', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  expect(written).toEqual('some special log line\nsome other special log line\n')
})

test('getExecutionStepLog - not found', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '7', '1001', 'stageDeploy', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_LOG({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4597/step/8494/logs (404 Not Found)' })
  )
})

test('getExecutionStepLog - empty', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '7', '1001', 'prodDeploy', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_NO_LOG_REDIRECT({ messageValues: ['https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4598/step/8500/logs', '{}'] })
  )
})

test('getExecutionStepLog - missing step', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '7', '1003', 'devDeploy', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_STEP_STATE({ messageValues: ['devDeploy', '1003'] })
  )
})

test('getExecutionStepLog - bad pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '100', '1001', 'build', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE({ messageValues: ['100', '5'] })
  )
})
