var assert = require("assert");
var request = require('request');
var sinon = require('sinon');
var KrakenAPI = require('../dist/kraken-api')


describe('KrakenClient', function () {
    describe('#rawRequest()', function () {

        it('When an error occured while calling the Kraken API an error should be returned', function (done) {
            sinon
                .stub(request, 'post')
                .yields("An error occured", null, null);
            var krakenClient = new KrakenAPI.KrakenClient("test-key", "test-secret");
            krakenClient.rawRequest("test-url", [], [], function (error, data) {
                assert.notEqual(error, null, "Error should not be null");
                assert.notEqual(error, undefined, "Error should not be undefined");
                assert.equal(error.name, "Error", "Error should be of type error");
                assert.notEqual(error.message, null, "Error should have a message");
                assert.notEqual(error.message, undefined, "Error should have a message");
            })
            request.post.restore();
            done();
        });


        it('When an error occured while parsing the returned data', function (done) {
            sinon
                .stub(request, 'post')
                .yields(null, null, "{falfa");
            var krakenClient = new KrakenAPI.KrakenClient("test-key", "test-secret");
            krakenClient.rawRequest("test-url", [], [], function (error, data) {
                assert.notEqual(error, null, "Error should not be null");
                assert.notEqual(error, undefined, "Error should not be undefined");
                assert.equal(error.name, "Error", "Error should be of type error");
                assert.notEqual(error.message, null, "Error should have a message");
                assert.notEqual(error.message, undefined, "Error should have a message");
            })
            request.post.restore();
            done();
        });
    });
});

