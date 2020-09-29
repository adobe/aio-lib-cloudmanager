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

/* global PipelineExecution, PipelineExecutionStepState */ // for linter

/**
 * Find the first non-finished step in a pipeline execution
 *
 * @param {PipelineExecution} execution the execution
 * @returns {PipelineExecutionStepState} the step state or a falsy object if all steps are finished
 */
function getCurrentStep (execution) {
  return (execution && execution._embedded && execution._embedded.stepStates && execution._embedded.stepStates.filter(ss => ss.status !== 'FINISHED')[0]) || undefined
}

/**
 * Find the first waiting step in a pipeline execution
 *
 * @param {PipelineExecution} execution the execution
 * @returns {PipelineExecutionStepState} the step state or a falsy object if no step is waiting
 */
function getWaitingStep (execution) {
  return (execution && execution._embedded && execution._embedded.stepStates && execution._embedded.stepStates.filter(ss => ss.status === 'WAITING')[0]) || undefined
}

/** @private */
function findStepState (execution, action) {
  let gates

  switch (action) {
    case 'security':
      return execution.embeddedArray('stepStates').find(stepState => stepState.action === 'securityTest')
    case 'performance':
      gates = execution.embeddedArray('stepStates').filter(stepState => stepState.action === 'loadTest' || stepState.action === 'assetsTest' || stepState.action === 'reportPerformanceTest')
      if (gates) {
        return gates[gates.length - 1]
      } else {
        return
      }
    case 'devDeploy':
      return execution.embeddedArray('stepStates').find(stepState => stepState.action === 'deploy' && stepState.environmentType === 'dev')
    case 'stageDeploy':
      return execution.embeddedArray('stepStates').find(stepState => stepState.action === 'deploy' && stepState.environmentType === 'stage')
    case 'prodDeploy':
      return execution.embeddedArray('stepStates').find(stepState => stepState.action === 'deploy' && stepState.environmentType === 'prod')
    default:
      return execution.embeddedArray('stepStates').find(stepState => stepState.action === action)
  }
}

/** @private */
function isWithinFiveMinutesOfUTCMidnight (date) {
  const currentUTCHours = date.getUTCHours()
  const currentUTCMinutes = date.getUTCMinutes()
  if ((currentUTCHours === 23 && currentUTCMinutes >= 55) || (currentUTCHours === 0 && currentUTCMinutes <= 5)) {
    return true
  } else {
    return false
  }
}

/** @private */
async function sleep (msec) {
  return new Promise(resolve => setTimeout(resolve, msec))
}

module.exports = {
  getCurrentStep,
  getWaitingStep,
  findStepState,
  isWithinFiveMinutesOfUTCMidnight,
  sleep
}
