/**
 * Copyright IBM Corporation 2017
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var circuitBreakerController = function circuitBreakerController($http) {
    var self = this;
    self.hostURL = "http://kitura-starter-spatterdashed-preliberality.stage1.mybluemix.net";
    self.hostPort = undefined;
    self.hostMessage = "Current microservice endpoint is " + self.hostURL;
    self.circuitMessage = "Waiting on user action.";
    self.endpointMessage = "Unknown (waiting on user action).";
    
    self.changeURL = function changeURL(host, port) {
        self.hostMessage = "Working...";
        $http.post('/changeEndpoint', {host: host, port: port})
        .then(function onSuccess(response) {
            self.hostMessage = "URL successfully changed to " + response.data;
        },
        function onFailure(response) {
            var errStr = 'Failure with error code ' + response.status;
            if (response.data) {
                errStr += ': ' + response.data;
            }
            self.hostMessage = errStr;
        });
    };
    
    self.disableEndpoint = function disableEndpoint() {
        self.circuitMessage = "Working...";
        $http.get('/changeEndpointState/disable')
        .then(function onSuccess(response) {
            self.circuitMessage = "Change successful. The endpoint has been disabled.";
            self.endpointMessage = "The endpoint is currently disabled.";
        },
        function onFailure(response) {
            var errStr = 'Failure with error code ' + response.status;
            if (response.data) {
                errStr += ': ' + response.data;
            }
            self.circuitMessage = errStr;
        });
    };
    
    self.enableEndpoint = function enableEndpoint() {
        self.circuitMessage = "Working...";
        $http.get('/changeEndpointState/enable')
        .then(function onSuccess(response) {
            self.circuitMessage = "Change successful. The endpoint has been enabled.";
            self.endpointMessage = "The endpoint is currently enabled.";
        },
        function onFailure(response) {
            var errStr = 'Failure with error code ' + response.status;
            if (response.data) {
                errStr += ': ' + response.data;
            }
            self.circuitMessage = errStr;
        });
    };

    
    self.invokeService = function invokeService() {
        self.circuitMessage = "Working...";
        $http.get('/invokeCircuit', {timeout: 10000})
        .then(function onSuccess(response) {
            self.circuitMessage = "Request successful. Payload received: " + JSON.stringify(response.data);
            self.endpointMessage = "The endpoint is currently enabled.";
        },
        function onFailure(response) {
            switch (response.status) {
            case 400:
                self.circuitMessage = "Bad request. URL invalid.";
                break;
            case 417:
                self.circuitMessage = "Request failed.";
                self.endpointMessage = "The endpoint is currently disabled.";
                break;
            case 500:
                self.circuitMessage = "Internal server error. Could not parse response from Kitura-Starter.";
                break;
            default:
                self.circuitMessage = "Unknown error " + response.status + ": " + response.statusText + ".";
                break;
            }
        });
    };
};
