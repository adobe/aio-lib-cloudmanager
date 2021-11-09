/**
 * Find the first non-finished step in a pipeline execution
 * @param execution - the execution
 * @returns the step state or a falsy object if all steps are finished
 */
declare function getCurrentStep(execution: PipelineExecution): PipelineExecutionStepState;

/**
 * Find the first waiting step in a pipeline execution
 * @param execution - the execution
 * @returns the step state or a falsy object if no step is waiting
 */
declare function getWaitingStep(execution: PipelineExecution): PipelineExecutionStepState;

/**
 * Returns a Promise that resolves with a new CloudManagerAPI object.
 * @param orgId - the organization id
 * @param apiKey - the API key for your integration
 * @param accessToken - the access token for your integration
 * @param baseUrl - the base URL to access the API (defaults to https://cloudmanager.adobe.io)
 * @returns a Promise with a CloudManagerAPI object
 */
declare function init(orgId: string, apiKey: string, accessToken: string, baseUrl: string): Promise<CloudManagerAPI>;

/**
 * This class provides methods to call your Cloud Manager APIs.
 * Before calling any method initialize the instance by calling the `init` method on it
 * with valid values for tenantId, apiKey and accessToken
 */
declare class CloudManagerAPI {
    /**
     * Initializes a CloudManagerAPI object and returns it.
     * @param orgId - the organization id
     * @param apiKey - the API key for your integration
     * @param accessToken - the access token for your integration
     * @param baseUrl - the base URL to access the API (defaults to https://cloudmanager.adobe.io)
     * @returns a CloudManagerAPI object
     */
    init(orgId: string, apiKey: string, accessToken: string, baseUrl: string): Promise<CloudManagerAPI>;
    /**
     * The organization id
     */
    orgId: string;
    /**
     * The api key from your integration
     */
    apiKey: string;
    /**
     * The access token from your integration
     */
    accessToken: string;
    /**
     * The base URL for the API endpoint
     */
    baseUrl: string;
    /**
     * Obtain a list of programs for the target organization.
     * @returns an array of Programs
     */
    listPrograms(): Promise<EmbeddedProgram[]>;
    /**
     * Obtain a list of pipelines for the target program.
     * @param programId - the program id
     * @param options - options
     * @returns an array of Pipelines
     */
    listPipelines(programId: string, options: ListPipelineOptions): Promise<Pipeline[]>;
    /**
     * Create a new execution for a pipeline, returning the execution.
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param mode - the pipeline execution mode
     * @returns the new execution
     */
    createExecution(programId: string, pipelineId: string, mode: string): Promise<PipelineExecution>;
    /**
     * Start an execution for a pipeline, returning the url of the new execution
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param mode - the pipeline execution mode
     * @returns the execution url
     */
    startExecution(programId: string, pipelineId: string, mode: string): Promise<string>;
    /**
     * Invalidate the cache for a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @returns a truthy object
     */
    invalidatePipelineCache(programId: string, pipelineId: string): Promise<object>;
    /**
     * Get the current execution for a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @returns the execution
     */
    getCurrentExecution(programId: string, pipelineId: string): Promise<PipelineExecution>;
    /**
     * List the most recent executions for a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param limit - the maximum number of executions to return (defaults to 20)
     * @returns the list of executions
     */
    listExecutions(programId: string, pipelineId: string, limit?: number): Promise<PipelineExecution[]>;
    /**
     * Get an execution for a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param executionId - the execution id
     * @returns the execution
     */
    getExecution(programId: string, pipelineId: string, executionId: string): Promise<PipelineExecution>;
    /**
     * Get the quality gate results for a pipeline step
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param executionId - the execution id
     * @param action - the action name
     * @returns the execution
     */
    getQualityGateResults(programId: string, pipelineId: string, executionId: string, action: string): Promise<PipelineStepMetrics>;
    /**
     * Cancel current execution
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @returns a truthy value
     */
    cancelCurrentExecution(programId: string, pipelineId: string): Promise<object>;
    /**
     * Advance current execution
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @returns a truthy value
     */
    advanceCurrentExecution(programId: string, pipelineId: string): Promise<object>;
    /**
     * List environments for a program
     * @param programId - the program id
     * @returns a list of environments
     */
    listEnvironments(programId: string): Promise<Environment[]>;
    /**
     * Write step log to an output stream.
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param executionId - the execution id
     * @param action - the action
     * @param logFile - the log file to select a non-default value
     * @param outputStream - the output stream to write to
     * @returns a truthy value
     */
    getExecutionStepLog(programId: string, pipelineId: string, executionId: string, action: string, logFile: string, outputStream: any): Promise<object>;
    /**
     * Tail step log to an output stream.
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param action - the action
     * @param logFile - the log file to select a non-default value
     * @param outputStream - the output stream to write to
     * @returns the completed step state
     */
    tailExecutionStepLog(programId: string, pipelineId: string, action: string, logFile: string, outputStream: any): Promise<PipelineExecutionStepState>;
    /**
     * List the log options available for an environment
     * @param programId - the program id
     * @param environmentId - the environment id
     * @returns the log options for the environment
     */
    listAvailableLogOptions(programId: string, environmentId: string): Promise<LogOptionRepresentation[]>;
    /**
     * Download log files from the environment to a specified directory.
     * @param programId - the program id
     * @param environmentId - the environment id
     * @param service - the service specification
     * @param name - the log name
     * @param days - the number of days
     * @param outputDirectory - the output directory
     * @returns the list of downloaded logs
     */
    downloadLogs(programId: string, environmentId: string, service: string, name: string, days: number, outputDirectory: string): Promise<DownloadedLog[]>;
    /**
     * Delete a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @returns a truthy object
     */
    deletePipeline(programId: string, pipelineId: string): Promise<object>;
    /**
     * Update a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param changes - the changes
     * @returns the new pipeline definition
     */
    updatePipeline(programId: string, pipelineId: string, changes: PipelineUpdate): Promise<Pipeline>;
    /**
     * Get the link to the developer console
     * @param programId - the program id
     * @param environmentId - the environment id
     * @returns the console url
     */
    getDeveloperConsoleUrl(programId: string, environmentId: string): Promise<string>;
    /**
     * Get the list of variables for an environment
     * @param programId - the program id
     * @param environmentId - the environment id
     * @returns the variables
     */
    getEnvironmentVariables(programId: string, environmentId: string): Promise<Variable[]>;
    /**
     * Set the variables for an environment
     * @param programId - the program id
     * @param environmentId - the environment id
     * @param variables - the variables
     * @returns a truthy value
     */
    setEnvironmentVariables(programId: string, environmentId: string, variables: Variable[]): Promise<object>;
    /**
     * Get the list of variables for a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @returns the variables
     */
    getPipelineVariables(programId: string, pipelineId: string): Promise<Variable[]>;
    /**
     * Set the variables for a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param variables - the variables
     * @returns a truthy value
     */
    setPipelineVariables(programId: string, pipelineId: string, variables: Variable[]): Promise<object>;
    /**
     * Delete a program
     * @param programId - the program id
     * @returns a truthy value
     */
    deleteProgram(programId: string): Promise<object>;
    /**
     * Delete an environment
     * @param programId - the program id
     * @param environmentId - the environment id
     * @returns a truthy value
     */
    deleteEnvironment(programId: string, environmentId: string): Promise<object>;
    /**
     * List the program's defined IP Allow Lists
     * @param programId - the program id
     * @returns - the IP Allow Lists
     */
    listIpAllowlists(programId: string): Promise<IPAllowedList>;
    /**
     * Create IP Allow List
     * @param programId - the program id
     * @param name - the name
     * @param cidrBlocks - the CIDR blocks
     * @returns a truthy value
     */
    createIpAllowlist(programId: string, name: string, cidrBlocks: string[]): Promise<IPAllowedList>;
    /**
     * Update the CIDR blocks of an IP Allow List
     * @param programId - the program id
     * @param ipAllowlistId - the allow list id
     * @param cidrBlocks - the replacement CIDR blocks
     * @returns a truthy value
     */
    updateIpAllowlist(programId: string, ipAllowlistId: string, cidrBlocks: string[]): Promise<object>;
    /**
     * Update the CIDR blocks of an IP Allow List
     * @param programId - the program id
     * @param ipAllowlistId - the allow list id
     * @returns a truthy value
     */
    deleteIpAllowlist(programId: string, ipAllowlistId: string): Promise<object>;
    /**
     * Bind an IP Allow List to an environment
     * @param programId - the program id
     * @param ipAllowlistId - the allow list id
     * @param environmentId - the environment id
     * @param service - the service name
     * @returns a truthy value
     */
    addIpAllowlistBinding(programId: string, ipAllowlistId: string, environmentId: string, service: string): Promise<object>;
    /**
     * Unbind an IP Allow List from an environment
     * @param programId - the program id
     * @param ipAllowlistId - the allow list id
     * @param environmentId - the environment id
     * @param service - the service name
     * @returns a truthy value
     */
    removeIpAllowlistBinding(programId: string, ipAllowlistId: string, environmentId: string, service: string): Promise<object>;
    /**
     * Make a Post to Commerce API
     * @param programId - the program id
     * @param environmentId - the environment id
     * @param options - options
     * @returns a truthy value
     */
    postCommerceCommandExecution(programId: string, environmentId: string, options: any): Promise<object>;
    /**
     * Get status for an existing Commerce execution
     * @param programId - the program id
     * @param environmentId - the environment id
     * @param commandExecutionId - the command execution id
     * @returns a truthy value of the commerce execution
     */
    getCommerceCommandExecution(programId: string, environmentId: string, commandExecutionId: string): Promise<object>;
    /**
     * Get status for an existing Commerce execution
     * @param programId - the program id
     * @param environmentId - the environment id
     * @param type - filter for type of command
     * @param status - filter for status of command
     * @param command - filter for the type of command
     * @returns a truthy value of the commerce execution
     */
    getCommerceCommandExecutions(programId: string, environmentId: string, type: string, status: string, command: string): Promise<object>;
}

/**
 * A lightweight representation of a Program
 * @property id - Identifier of the program. Unique within the space.
 * @property name - Name of the program
 * @property enabled - Whether this Program has been enabled for Cloud Manager usage
 * @property tenantId - Tenant Id
 * @property status - Status of the program
 * @property createdAt - Created time
 * @property updatedAt - Date of last change
 */
declare type EmbeddedProgram = {
    id: string;
    name: string;
    enabled: boolean;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
};

/**
 * A representation of a CI/CD Pipeline
 * @property id - Identifier of the pipeline. Unique within the program.
 * @property programId - Identifier of the program. Unique within the space.
 * @property name - Name of the pipeline
 * @property trigger - How should the execution be triggered. ON_COMMIT: each time one or more commits are pushed and the Pipeline is idle then a execution is triggered. MANUAL: triggerd through UI or API.
 * @property status - Pipeline status
 * @property createdAt - Create date
 * @property updatedAt - Update date
 * @property lastStartedAt - Last pipeline execution start
 * @property lastFinishedAt - Last pipeline execution end
 * @property phases - Pipeline phases in execution order
 * @property type - Pipeline type
 */
declare type Pipeline = {
    id: string;
    programId: string;
    name: string;
    trigger: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    lastStartedAt: string;
    lastFinishedAt: string;
    phases: PipelinePhase[];
    type: string;
};

/**
 * Describes a phase of a pipeline
 * @property name - Name of the phase
 * @property type - Type of the phase
 * @property repositoryId - Identifier of the source repository. The code from this repository will be build at the start of this phase.
 * Mandatory if type=BUILD
 * @property branch - Name of the tracked branch or a fully qualified git tag (e.g. refs/tags/v1).
 *  Assumed to be `master` if missing.
 * @property environmentId - Identifier of the target environment. Mandatory if type=DEPLOY
 * @property environmentType - Type of environment (for example stage or prod, readOnly = true)
 * @property steps - Steps to be included in the phase in execution order. Might be added or not, depending on permissions or configuration
 */
declare type PipelinePhase = {
    name: string;
    type: string;
    repositoryId: string;
    branch: string;
    environmentId: string;
    environmentType: string;
    steps: PipelineStep[];
};

/**
 * A representation of an execution of a CI/CD Pipeline.
 * @property id - Pipeline execution identifier
 * @property programId - Identifier of the program. Unique within the space.
 * @property pipelineId - Identifier of the pipeline. Unique within the space.
 * @property artifactsVersion - Version of the artifacts generated during this execution
 * @property user - AdobeID who started the pipeline. Empty for auto triggered builds
 * @property status - Status of the execution
 * @property trigger - How the execution was triggered.
 * @property pipelineExecutionMode - The mode in which the execution occurred. EMERGENCY mode will skip certain steps and is only available to select AMS customers
 * @property createdAt - Timestamp at which the execution was created
 * @property updatedAt - Timestamp at which the status of the execution last changed
 * @property finishedAt - Timestamp at which the execution completed
 * @property pipelineType - Pipeline type
 */
declare type PipelineExecution = {
    id: string;
    programId: string;
    pipelineId: string;
    artifactsVersion: string;
    user: string;
    status: string;
    trigger: string;
    pipelineExecutionMode: string;
    createdAt: string;
    updatedAt: string;
    finishedAt: string;
    pipelineType: string;
};

/**
 * Describes the status of a particular pipeline execution step for display purposes
 * @property action - Name of the action
 * @property repository - Target repository
 * @property branch - Target branch
 * @property environment - Target environment
 * @property environmentId - Target environment id
 * @property environmentType - Target environment type
 * @property startedAt - Timestamp at which the step state started running
 * @property finishedAt - Timestamp at which the step completed
 * @property details - Additional details of the step
 * @property status - Action status
 */
declare type PipelineExecutionStepState = {
    id: string;
    stepId: string;
    phaseId: string;
    action: string;
    repository: string;
    branch: string;
    environment: string;
    environmentId: string;
    environmentType: string;
    startedAt: string;
    finishedAt: string;
    details: any;
    status: string;
};

/**
 * @property metrics - metrics
 */
declare type PipelineStepMetrics = {
    metrics: Metric[];
};

/**
 * A representation of a specific metric generated by a CI/CD Pipeline step.
 * @property id - KPI result identifier
 * @property severity - Severity of the metric
 * @property passed - Whether metric is considered passed
 * @property override - Whether user override the failed metric
 * @property actualValue - Expected value for the metric
 * @property expectedValue - Expected value for the metric
 * @property comparator - Comparator used for the metric
 * @property kpi - KPI identifier
 */
declare type Metric = {
    id: string;
    severity: string;
    passed: boolean;
    override: boolean;
    actualValue: string;
    expectedValue: string;
    comparator: string;
    kpi: string;
};

/**
 * A representation of an Environment known to Cloud Manager.
 * @property id - id
 * @property programId - Identifier of the program. Unique within the space.
 * @property name - Name of the environment
 * @property description - Description of the environment
 * @property type - Type of the environment
 * @property status - Status of the environment
 * @property region - Region of the environment
 * @property availableLogOptions - List of logs available in the environment
 */
declare type Environment = {
    id: string;
    programId: string;
    name: string;
    description: string;
    type: string;
    status: string;
    region: string;
    availableLogOptions: LogOptionRepresentation[];
};

/**
 * A named value than can be set on an Environment or Pipeline
 * @property name - Name of the variable. Can only consist of a-z, A-Z, _ and 0-9 and cannot begin with a number.
 * @property value - Value of the variable. Read-Write for non-secrets, write-only for secrets. The length of `secretString` values must be less than 500 characters. An empty value causes a variable to be deleted.
 * @property type - Type of the variable. Default `string` if missing. `secretString` variables are encrypted at rest. The type of a variable be changed after creation; the variable must be deleted and recreated.
 * @property service - Service of the variable. When not provided, the variable applies to all services. Currently the values 'author', 'publish', and 'preview' are supported. Note - this value is case-sensitive.
 * @property status - Status of the variable
 */
declare type Variable = {
    name: string;
    value: string;
    type: string;
    service: string;
    status: string;
};

/**
 * @property service - Name of the service in environment. Example: author
 * @property name - Name of the log for service in environment. Example: aemerror
 */
declare type LogOptionRepresentation = {
    service: string;
    name: string;
};

/**
 * Describes an __IP Allowed List Binding__
 * @property id - Identifier of the IP Allowed List Binding to an Environment
 * @property tier - Tier of the environment.
 * @property status - Status of the binding.
 * @property programId - Identifier of the program.
 * @property ipAllowListId - Identifier of the IP allow list.
 * @property environmentId - Identifier of the environment.
 */
declare type IPAllowedListBinding = {
    id: string;
    tier: string;
    status: string;
    programId: string;
    ipAllowListId: string;
    environmentId: string;
};

/**
 * Describes an __IP Allowed List__
 * @property id - Identifier of the IP Allowed List
 * @property name - Name of the IP Allowed List
 * @property ipCidrSet - IP CIDR Set
 * @property programId - Identifier of the program.
 * @property bindings - IP Allowlist bindings
 */
declare type IPAllowedList = {
    id: string;
    name: string;
    ipCidrSet: string[];
    programId: string;
    bindings: IPAllowedListBinding[];
};

/**
 * Options to the listPipeline function
 * @property busy - if true, only busy pipelines will be returned
 */
declare type ListPipelineOptions = {
    busy: boolean;
};

/**
 * @property path - the path where the log was stored
 * @property url - the url of the log that was downloaded
 */
declare type DownloadedLog = {
    path: string;
    url: string;
};

/**
 * @property branch - the new branch
 * @property repositoryId - the new repository id
 */
declare type PipelineUpdate = {
    branch: string;
    repositoryId: string;
};

