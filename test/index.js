import userTest from 'test/identity/user-test';
import assert from 'assert';
import supertest from 'supertest';
import should from 'should';
import mongoose from 'mongoose';

export {
    mongoose,
    supertest,
    assert
};

describe('WEB CONSOLE API TESTS', () => {
    userTest.UserserviceCommon(supertest, should, assert);
});
