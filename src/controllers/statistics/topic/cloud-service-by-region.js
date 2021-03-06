import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'query': {
            'aggregate': {
                'group': {
                    'keys': [
                        {
                            'key': 'provider',
                            'name': 'provider'
                        },
                        {
                            'key': 'region_code',
                            'name': 'region_name'
                        }
                    ],
                    'fields': [
                        {
                            'name': 'count',
                            'operator': 'count'
                        }
                    ]
                }
            },
            'filter': [
                {
                    'k': 'region_code',
                    'v': null,
                    'o': 'not'
                },
                {
                    'k': 'ref_cloud_service_type.is_major',
                    'v': true,
                    'o': 'eq'
                }
            ],
            'sort': {
                'name': 'count',
                'desc': true
            }
        },
        'resource_type': 'inventory.CloudService'
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    return requestParams;
};

const cloudServiceByRegion = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default cloudServiceByRegion;
