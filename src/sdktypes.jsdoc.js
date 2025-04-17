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

/*
 * THIS FILE IS GENERATED. DO NOT EDIT BY HAND. RUN 'npm run generate-jsdoc-types' to re-generate.
 * Manually created types should go in types.jsdoc.js
 */

/* eslint no-multiple-empty-lines: "off", no-trailing-spaces: "off" */


/**
 * A lightweight representation of a Program
 *
 * @typedef {object} EmbeddedProgram
 * @property {string} id - Identifier of the program. Unique within the space.
 * @property {string} name - Name of the program
 * @property {boolean} enabled - Whether this Program has been enabled for Cloud Manager usage
 * @property {string} tenantId - Tenant Id
 * @property {string} status - Status of the program
 * @property {string} createdAt - Created time
 * @property {string} updatedAt - Date of last change
 */


/**
 * A representation of a CI/CD Pipeline
 *
 * @typedef {object} Pipeline
 * @property {string} id - Identifier of the pipeline. Unique within the program.
 * @property {string} programId - Identifier of the program. Unique within the space.
 * @property {string} name - Name of the pipeline
 * @property {string} trigger - How should the execution be triggered. ON_COMMIT: each time one or more commits are pushed and the Pipeline is idle then a execution is triggered. MANUAL: triggerd through UI or API.
 * @property {string} status - Pipeline status
 * @property {string} createdAt - Create date
 * @property {string} updatedAt - Update date
 * @property {string} lastStartedAt - Last pipeline execution start
 * @property {string} lastFinishedAt - Last pipeline execution end
 * @property {PipelinePhase[]} phases - Pipeline phases in execution order
 * @property {string} type - Pipeline type
 */


/**
 * Describes a phase of a pipeline
 *
 * @typedef {object} PipelinePhase
 * @property {string} name - Name of the phase
 * @property {string} type - Type of the phase
 * @property {string} repositoryId - Identifier of the source repository. The code from this repository will be build at the start of this phase. 
Mandatory if type=BUILD
 * @property {string} branch - Name of the tracked branch or a fully qualified git tag (e.g. refs/tags/v1). 
 Assumed to be `master` if missing.
 * @property {string} environmentId - Identifier of the target environment. Mandatory if type=DEPLOY
 * @property {string} environmentType - Type of environment (for example stage or prod, readOnly = true)
 * @property {PipelineStep[]} steps - Steps to be included in the phase in execution order. Might be added or not, depending on permissions or configuration
 */


/**
 * A representation of an execution of a CI/CD Pipeline.
 *
 * @typedef {object} PipelineExecution
 * @property {string} id - Pipeline execution identifier
 * @property {string} programId - Identifier of the program. Unique within the space.
 * @property {string} pipelineId - Identifier of the pipeline. Unique within the space.
 * @property {string} artifactsVersion - Version of the artifacts generated during this execution
 * @property {string} user - AdobeID who started the pipeline. Empty for auto triggered builds
 * @property {string} status - Status of the execution
 * @property {string} trigger - How the execution was triggered.
 * @property {string} pipelineExecutionMode - The mode in which the execution occurred. EMERGENCY mode will skip certain steps and is only available to select AMS customers
 * @property {string} createdAt - Timestamp at which the execution was created
 * @property {string} updatedAt - Timestamp at which the status of the execution last changed
 * @property {string} finishedAt - Timestamp at which the execution completed
 * @property {string} pipelineType - Pipeline type
 */


/**
 * Describes the status of a particular pipeline execution step for display purposes
 *
 * @typedef {object} PipelineExecutionStepState
 * @property {string} id
 * @property {string} stepId
 * @property {string} phaseId
 * @property {string} action - Name of the action
 * @property {string} repository - Target repository
 * @property {string} branch - Target branch
 * @property {string} environment - Target environment
 * @property {string} environmentId - Target environment id
 * @property {string} environmentType - Target environment type
 * @property {string} startedAt - Timestamp at which the step state started running
 * @property {string} finishedAt - Timestamp at which the step completed
 * @property {string} commitId - Target commit id
 * @property {object} details - Additional details of the step
 * @property {string} status - Action status
 */


/**
 * @typedef {object} PipelineStepMetrics
 * @property {Metric[]} metrics - metrics
 */


/**
 * A representation of a specific metric generated by a CI/CD Pipeline step.
 *
 * @typedef {object} Metric
 * @property {string} id - KPI result identifier
 * @property {string} severity - Severity of the metric
 * @property {boolean} passed - Whether metric is considered passed
 * @property {boolean} override - Whether user override the failed metric
 * @property {string} actualValue - Expected value for the metric
 * @property {string} expectedValue - Expected value for the metric
 * @property {string} comparator - Comparator used for the metric
 * @property {string} kpi - KPI identifier
 */


/**
 * A representation of an Environment known to Cloud Manager.
 *
 * @typedef {object} Environment
 * @property {string} id - id
 * @property {string} programId - Identifier of the program. Unique within the space.
 * @property {string} name - Name of the environment
 * @property {string} description - Description of the environment
 * @property {string} type - Type of the environment
 * @property {string} status - Status of the environment
 * @property {string} region - Region of the environment
 * @property {LogOptionRepresentation[]} availableLogOptions - List of logs available in the environment
 */


/**
 * A named value than can be set on an Environment or Pipeline
 *
 * @typedef {object} Variable
 * @property {string} name - Name of the variable. Can only consist of a-z, A-Z, _ and 0-9 and cannot begin with a number.
 * @property {string} value - Value of the variable. Read-Write for non-secrets, write-only for secrets. The length of `secretString` values must be less than 500 characters. An empty value causes a variable to be deleted.
 * @property {string} type - Type of the variable. Default `string` if missing. `secretString` variables are encrypted at rest. The type of a variable be changed after creation; the variable must be deleted and recreated.
 * @property {string} service - Service of the variable. When not provided, the variable applies to all services. Currently the values 'author', 'publish', and 'preview' are supported. Note - this value is case-sensitive.
 * @property {string} status - Status of the variable
 */


/**
 * A representation of a ContentSet custom
 *
 * @typedef {object} ContentSet
 * @property {string} id - Identifier of the Content Set
 * @property {string} name - The name of the content set
 * @property {ContentSetPath[]} paths - Included asset paths
 * @property {string} programId - Identifier of the program. Unique within the space.
 * @property {string} createdAt - Create date
 * @property {string} updatedAt - Update date
 */


/**
 * The Content Flow Execution
 *
 * @typedef {object} ContentFlow
 * @property {string} contentSetId - The content set id
 * @property {string} contentSetName - The content set name
 * @property {string} srcEnvironmentId - Source environment id
 * @property {string} srcEnvironmentName - Source environment name
 * @property {string} destEnvironmentId - Destination environment id
 * @property {string} destEnvironmentName - Destination environment name
 * @property {string} tier - The tier, for example author
 * @property {string} status - Status of the flows
 * @property {string} destProgramId - Destination program id
 * @property {undefined} resultDetails - Details of this content flow result
 */


/**
 * @typedef {object} LogOptionRepresentation
 * @property {string} service - Name of the service in environment. Example: author
 * @property {string} name - Name of the log for service in environment. Example: aemerror
 */


/**
 * Describes an __IP Allowed List Binding__
 *
 * @typedef {object} IPAllowedListBinding
 * @property {integer} id - Identifier of the IP Allowed List Binding to an Environment
 * @property {string} tier - Tier of the environment.
 * @property {string} status - Status of the binding.
 * @property {integer} programId - Identifier of the program.
 * @property {integer} ipAllowListId - Identifier of the IP allow list.
 * @property {integer} environmentId - Identifier of the environment.
 */


/**
 * Describes an __IP Allowed List__
 *
 * @typedef {object} IPAllowedList
 * @property {integer} id - Identifier of the IP Allowed List
 * @property {string} name - Name of the IP Allowed List
 * @property {integer} programId - Identifier of the program.
 * @property {string[]} ipCidrSet - IP CIDR Set
 * @property {IPAllowedListBinding[]} bindings - IP Allowlist bindings
 */


