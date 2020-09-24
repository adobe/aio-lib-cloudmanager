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
    listPipelines(programId: string, options: ListProgramOptions): Promise<Pipeline[]>;
}

/**
 * Options to the listPipeline function
 * @property busy - if true, only busy pipelines will be returned
 */
declare type ListProgramOptions = {
    busy: boolean;
};

/**
 * Describes an __Embedded Program__
 * @property id - Identifier of the program. Unique within the space.
 * @property name - Name of the program
 * @property enabled - Whether this Program has been enabled for Cloud Manager usage
 * @property tenantId - Tenant Id
 */
declare type EmbeddedProgram = {
    id: string;
    name: string;
    enabled: boolean;
    tenantId: string;
};

/**
 * Describes a __CI/CD Pipeline__
 * @property id - Identifier of the pipeline. Unique within the program.
 * @property programId - Identifier of the program. Unique within the space.
 * @property name - Name of the pipeline
 * @property trigger - How should the execution be triggered. ON_COMMIT: each time a PR is available and the Pipeline is idle then a execution is triggered. MANUAL: triggerd through UI or API. SCHEDULE: recurring schedule (not yet implemented}
 * @property status - Pipeline status
 * @property createdAt - Create date
 * @property updatedAt - Update date
 * @property lastStartedAt - Last pipeline execution start
 * @property lastFinishedAt - Last pipeline execution end
 * @property phases - Pipeline phases in execution order
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
 */
declare type PipelinePhase = {
    name: string;
    type: string;
    repositoryId: string;
    branch: string;
    environmentId: string;
};

