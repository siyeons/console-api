import grpcClient from '@lib/grpc-client';
import { getKeyArrays, emptyReturnable, getDataSourceParam, getParamArr} from '@/add-ons/aws-health/lib/aws-health';
import _ from 'lodash';

const listAWSHealth = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    params['query'] = { only: ['service_account_id']};
    console.log('params: ', params);

    const serviceAccountGroup = await identityV1.ServiceAccount.list(params);
    const serviceAccounts = [];

    let logs = [];
    if(!_.isEmpty(serviceAccountGroup.results)){
        serviceAccountGroup.results.map((account)=> {
            serviceAccounts.push(account.service_account_id);
        });
    }

    if(serviceAccounts.length == 0){
        return emptyReturnable(params.domain_id);

    } else {

        const monitoringV1 = await grpcClient.get('monitoring', 'v1');
        const dataSource = await monitoringV1.DataSource.list(getDataSourceParam(params.domain_id));
        const dataSources = getKeyArrays(dataSource, 'data_source_id');

        if(!dataSources){
            return emptyReturnable(params.domain_id);
        }
        console.log(`number of dataSource_ids: ${dataSources.length}, number of serviceAccounts_ids: ${serviceAccounts.length}`  );
        console.log(`dataSource_ids: ${dataSources}, serviceAccounts_ids: ${serviceAccounts}`  );

        const getLogParam =  getParamArr(dataSources, serviceAccounts, params.domain_id, params.date_subtractor);

        const loggerData = [];
        let successCount = 0;
        let failCount = 0;
        let failItems = {};

        let promises = getLogParam.map(async (singleParam) => {
            try {
                const singleResponse = await monitoringV1.Log.list(singleParam);
                const singleItemsLog = singleResponse.logs;

                if(singleItemsLog.length > 0){
                    Array.prototype.push.apply(loggerData, singleItemsLog);
                }
                //loggerData.push(singleResponse);
                successCount = successCount + 1;
            }
            catch (e) {
                const key = `${singleParam.data_source_id}_${singleParam.resource_id}`;
                failItems[key] = e.details || e.message;
                failCount = failCount + 1;
            }
        });

        await Promise.all(promises);

        if (successCount == 0) {
            let error = new Error(`Failed get aws-health. (success: ${successCount}, failure: ${failCount})`);
            error.fail_items = failItems;
            throw error;
        } else {
            const calculatedLogs = [];
            const obj = {};
            loggerData.map((singleLog)=> {
                const unique = singleLog.reference.resource_id;
                if(obj.hasOwnProperty(unique)) {

                    const newCount = singleLog.count + obj[unique].count;
                    obj[unique].count = newCount;

                } else {
                    calculatedLogs.push(unique);
                    obj[unique] = singleLog;
                }
            });

            logs = Object.values(obj);
        }

        return {
            logs: logs,
            domain_id: params.domain_id
        };
    }
};

export {
    listAWSHealth
};
