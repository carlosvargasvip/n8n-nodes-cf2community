import {
	ICredentialType,
	INodeProperties,
	IAuthenticateGeneric,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

export class Cf2Api implements ICredentialType {
	name = 'cf2Api';
	displayName = 'CF2 API';
	documentationUrl = 'https://your-documentation-url'; // Add documentation URL if needed
	properties: INodeProperties[] = [
			{
					displayName: 'Workspace Subdomain',
					name: 'workspace',
					type: 'string',
					default: '',
					placeholder: 'your-workspace',
					description: 'The workspace subdomain to use in the API URL (e.g., workspacevalue in workspacevalue.myclickfunnels.com)',
			},
			{
					displayName: 'API Key',
					name: 'apiKey',
					type: 'string',
					typeOptions: {
							password: true, // This will hide the API key input for security
					},
					default: '',
					description: 'The API Key to authenticate requests.',
			},
			{
					displayName: 'Team',
					name: 'teamId',
					type: 'options',
					typeOptions: {
							loadOptionsMethod: 'getTeams', // Method to fetch the teams dynamically
					},
					default: '',
					description: 'Select a team to use for the request.',
			},
			{
					displayName: 'Workspace',
					name: 'workspaceId',
					type: 'options',
					typeOptions: {
							loadOptionsDependsOn: ['teamId'], // Wait for the teamId to be selected
							loadOptionsMethod: 'getWorkspaces', // Method to fetch the workspaces dynamically
					},
					default: '',
					description: 'Select a workspace after choosing a team.',
			},
	];

	authenticate: IAuthenticateGeneric = {
			type: 'generic',
			properties: {
					headers: {
							Authorization: '={{"Bearer " + $credentials.apiKey}}',
					},
			},
	};

	baseUrl = '={{"https://" + $credentials.workspace + ".myclickfunnels.com/api/v2"}}';

	// Method to fetch the teams
	async getTeams(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
			const credentials = await this.getCredentials('cf2Api');

			// Construct the URL for the teams endpoint
			const baseUrl = `https://${credentials.workspace}.myclickfunnels.com/api/v2/teams`;

			// Perform the GET request to fetch the teams
			const responseData = await this.helpers.httpRequest({
					url: baseUrl,
					method: 'GET',
					headers: {
							Accept: 'application/json',
							Authorization: `Bearer ${credentials.apiKey}`,
					},
			});

			// Map the response data to populate the dropdown
			return responseData.map((team: { id: number; name: string }) => ({
					name: team.name,  // Display name for the dropdown
					value: team.id,   // The team ID
			}));
	}

	// Method to fetch the workspaces based on the selected team
	async getWorkspaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
			const credentials = await this.getCredentials('cf2Api');
			const teamId = this.getCurrentNodeParameter('teamId'); // Get the selected team ID

			// Construct the URL for the workspaces endpoint, using the selected team ID
			const baseUrl = `https://${credentials.workspace}.myclickfunnels.com/api/v2/teams/${teamId}/workspaces`;

			// Perform the GET request to fetch the workspaces
			const responseData = await this.helpers.httpRequest({
					url: baseUrl,
					method: 'GET',
					headers: {
							Accept: 'application/json',
							Authorization: `Bearer ${credentials.apiKey}`,
					},
			});

			// Map the response data to populate the dropdown
			return responseData.map((workspace: { id: number; name: string }) => ({
					name: workspace.name,  // Display name for the dropdown
					value: workspace.id,   // The workspace ID
			}));
	}
}
