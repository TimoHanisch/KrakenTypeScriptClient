/// <reference path="../typings/index.d.ts" />


import request = require('request');
import crypto = require('crypto');
import querystring = require('querystring');

/**
 *
 */
export class KrakenClient {

    private config;

    public constructor(key: string, secret: string) {
        this.config = {
            url: 'https://api.kraken.com',
            version: '0',
            key: key,
            secret: secret,
            otp: null,
            timeout: 5000
        };
    }

    public set timeout(milliseconds: number) {
        this.config.timeout = milliseconds;
    }

    public getTime(callback: Function) {
        return this.publicMethod("Time", null, callback);
    }

    public getAssets(params, callback: Function) {
        return this.publicMethod("Assets", params, callback);
    }

    public getAssetPairs(params, callback: Function) {
        return this.publicMethod("AssetPairs", params, callback);
    }

    public getTicker(params, callback: Function) {
        return this.publicMethod("Ticker", params, callback);
    }

    public getDepth(params, callback: Function) {
        return this.publicMethod("Depth", params, callback);
    }

    public getTrades(params, callback: Function) {
        return this.publicMethod("Trades", params, callback);
    }

    public getSpread(params, callback: Function) {
        return this.publicMethod("Spread", params, callback);
    }

    public getOHLC(params, callback: Function) {
        return this.publicMethod("OHLC", params, callback);
    }

    public getBalance(callback: Function) {
        return this.privateMethod("Balance", null, callback);
    }

    public getTradeBalance(params, callback: Function) {
        return this.privateMethod("TradeBalanc", params, callback);
    }

    public getOpenOrders(params, callback: Function) {
        return this.privateMethod("OpenOrders", params, callback);
    }

    public getClosedOrders(params, callback: Function) {
        return this.privateMethod("ClosedOrders", params, callback);
    }

    public queryOrders(params, callback: Function) {
        return this.privateMethod("QueryOrders", params, callback);
    }

    public getTradesHistory(params, callback: Function) {
        return this.privateMethod("TradesHistory", params, callback);
    }

    public queryTrades(params, callback: Function) {
        return this.privateMethod("QueryTrades", params, callback);
    }

    public getOpenPositions(params, callback: Function) {
        return this.privateMethod("OpenPositions", null, callback);
    }

    public getLedgers(params, callback: Function) {
        return this.privateMethod("Ledgers", params, callback);
    }

    public queryLedgers(params, callback: Function) {
        return this.privateMethod("QueryLedgers", params, callback);
    }

    public getTradeVolume(params, callback: Function) {
        return this.privateMethod("TradeVolume", params, callback);
    }

    public addOrder(params, callback: Function) {
        return this.privateMethod("AddOrder", params, callback);
    }

    public cancelOrder(params, callback: Function) {
        return this.privateMethod("CancelOrder", params, callback);
    }

    public getDepositMethods(params, callback: Function) {
        return this.privateMethod("DepositMethods", params, callback);
    }

    public getDepositAddresses(params, callback: Function) {
        return this.privateMethod("DepositAddresses", params, callback);
    }

    public getDepositStatus(params, callback: Function) {
        return this.privateMethod("DepositStatus", params, callback);
    }

    public getWithdrawInfo(params, callback: Function) {
        return this.privateMethod("WithdrawInfo", params, callback);
    }

    public withdraw(params, callback: Function) {
        return this.privateMethod("Withdraw", params, callback);
    }

    public getWithdrawStatus(params, callback: Function) {
        return this.privateMethod("WithdrawStatus", params, callback);
    }

    public cancelWithdraw(params, callback: Function) {
        return this.privateMethod("WithdrawCancel", params, callback);
    }

    private publicMethod(method: string, params, callback: Function) {
        params = params || {};

        var path = '/' + this.config.version + '/public/' + method;
        var url = this.config.url + path;

        return this.rawRequest(url, {}, params, callback);
    }

    private privateMethod(method: string, params, callback: Function) {
        params = params || {};

        var path = '/' + this.config.version + '/private/' + method;
        var url = this.config.url + path;
        var currentMillis: Date = new Date();

        params.nonce = currentMillis.getTime() * 1000; // spoof milliseconds

        if (this.config.otp !== undefined) {
            params.otp = this.config.otp;
        }

        var signature = this.getMessageSignature(path, params, params.nonce);

        var headers = {
            'API-Key': this.config.key,
            'API-Sign': signature
        };

        return this.rawRequest(url, headers, params, callback);
    }

    private getMessageSignature(path: string, request, nonce: number) {
        var message = querystring.stringify(request);
        var secret = new Buffer(this.config.secret, 'base64');
        var hash = crypto.createHash('sha256');
        var hmac = crypto.createHmac('sha512', secret);

        var hash_digest = hash.update(nonce + message).digest('binary');
        var hmac_digest = hmac.update(path + hash_digest, 'binary').digest('base64');

        return hmac_digest;
    }

    private rawRequest(url: string, headers, params, callback: Function) {
        // Set custom User-Agent string
        headers['User-Agent'] = 'Kraken Typescript API Client';

        var options = {
            url: url,
            method: 'POST',
            headers: headers,
            form: params,
            timeout: this.config.timeout
        };

        var req = request.post(options, function (error, response, body) {
            var data;

            if (error) {
                return callback.call(this, new Error('Error in server response: ' + JSON.stringify(error)), null);
            }

            try {
                data = JSON.parse(body);
            } catch (e) {
                return callback.call(this, new Error('Could not understand response from server: ' + body), null);
            }
            //If any errors occured, Kraken will give back an array with error strings under
            //the key "error". We should then propagate back the error message as a proper error.
            if (data.error && data.error.length) {
                var krakenError = null;
                data.error.forEach(function (element) {
                    if (element.charAt(0) === "E") {
                        krakenError = element.substr(1);
                        return false;
                    }
                });
                if (krakenError) {
                    return callback.call(this, new Error('Kraken API returned error: ' + krakenError), null);
                }
            } else {
                return callback.call(this, null, data);
            }
        });
        return req;
    }
}