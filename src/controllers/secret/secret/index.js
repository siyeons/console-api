import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createSecret = async (params) => {
    if (['CREDENTIALS','CONFIG'].indexOf(params.secret_type) === -1) {
        throw new Error('Wrong enum value. (secret_type = CREDENTIALS | CONFIG');
    }
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Secret.create(params);

    return response;
};

const updateSecret = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Secret.update(params);

    return response;
};



const deleteSecret = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Secret.delete(params);

    return response;
};


const getSecret = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Secret.get(params);

    return response;
};

const listSecrets = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Secret.list(params);

    return response;
};


const statSecrets = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Secret.stat(params);

    return response;
};


export {
    createSecret,
    updateSecret,
    deleteSecret,
    getSecret,
    listSecrets,
    statSecrets
};
