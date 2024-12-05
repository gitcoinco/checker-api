"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
// Function to make a GraphQL request and return the response data
function fetchGraphQL(endpoint, query) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.post(endpoint, { query: query })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.data];
            }
        });
    });
}
// Function to compare human and AI evaluations for a specific pool
function compareEvaluations(chainId, poolId) {
    return __awaiter(this, void 0, void 0, function () {
        var humanEvalServer, aiEvalServer, humanEvaluationQuery, aiEvaluationQuery, humanData, aiData, humanApplications, aiApplications_1, uncertainApplications_1, matchingApplications_1, nonMatchingApplications_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    humanEvalServer = 'https://grants-stack-indexer-v2.gitcoin.co/graphql';
                    aiEvalServer = 'https://api.checker.gitcoin.co/graphql';
                    humanEvaluationQuery = "\n      query MyQuery {\n        round(chainId: ".concat(chainId, ", id: \"").concat(poolId, "\") {\n          applications {\n            id\n            status\n          }\n        }\n      }\n    ");
                    aiEvaluationQuery = "\n      query MyQuery {\n        applications(filter: {pool: {alloPoolId: {equalTo: \"".concat(poolId, "\"}}}) {\n          alloApplicationId\n          evaluations {\n            evaluationStatus\n          }\n        }\n      }\n    ");
                    return [4 /*yield*/, fetchGraphQL(humanEvalServer, humanEvaluationQuery)];
                case 1:
                    humanData = _a.sent();
                    return [4 /*yield*/, fetchGraphQL(aiEvalServer, aiEvaluationQuery)];
                case 2:
                    aiData = _a.sent();
                    humanApplications = humanData.round.applications;
                    aiApplications_1 = aiData.applications;
                    uncertainApplications_1 = [];
                    matchingApplications_1 = [];
                    nonMatchingApplications_1 = [];
                    // Compare human applications with AI applications
                    humanApplications.forEach(function (humanApp) {
                        var aiApp = aiApplications_1.find(function (aiApp) { return aiApp.alloApplicationId === humanApp.id; });
                        if (aiApp !== undefined && aiApp.evaluations.length > 0) {
                            var aiStatus = aiApp.evaluations[0].evaluationStatus;
                            if (aiStatus === humanApp.status) {
                                // If AI evaluation exists and status matches humanApp.status, push to matching list
                                matchingApplications_1.push({
                                    id: humanApp.id,
                                    humanStatus: humanApp.status,
                                    aiStatus: aiStatus,
                                });
                            }
                            else if (aiStatus === 'UNCERTAIN') {
                                // If AI evaluation status is uncertain, push to uncertain list
                                uncertainApplications_1.push({
                                    id: humanApp.id,
                                    humanStatus: humanApp.status,
                                    aiStatus: aiStatus,
                                });
                            }
                            else {
                                // If evaluation exists but status does not match, push to non-matching list
                                nonMatchingApplications_1.push({
                                    id: humanApp.id,
                                    humanStatus: humanApp.status,
                                    aiStatus: aiStatus,
                                });
                            }
                        }
                        else {
                            // If no evaluation exists, push to non-matching list
                            nonMatchingApplications_1.push({
                                id: humanApp.id,
                                humanStatus: humanApp.status,
                                aiStatus: 'No Evaluation',
                            });
                        }
                    });
                    // Print the results for the current pool
                    console.log("Results for Pool ".concat(poolId, " (Chain ID: ").concat(chainId, "):"));
                    console.log("Matching Applications: ".concat(matchingApplications_1.length, "/").concat(humanApplications.length));
                    matchingApplications_1.forEach(function (app) {
                        console.log("ID: ".concat(app.id, ", Human Status: ").concat(app.humanStatus, ", AI Status: ").concat(app.aiStatus));
                    });
                    console.log("Uncertain Applications: ".concat(uncertainApplications_1.length, "/").concat(humanApplications.length));
                    uncertainApplications_1.forEach(function (app) {
                        console.log("ID: ".concat(app.id, ", Human Status: ").concat(app.humanStatus, ", AI Status: ").concat(app.aiStatus));
                    });
                    console.log("Non-Matching Applications: ".concat(nonMatchingApplications_1.length, "/").concat(humanApplications.length));
                    nonMatchingApplications_1.forEach(function (app) {
                        console.log("ID: ".concat(app.id, ", Human Status: ").concat(app.humanStatus, ", AI Status: ").concat(app.aiStatus));
                    });
                    console.log('\n\n\n---\n\n\n');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error fetching data from servers:', error_1);
                    throw new Error('Failed to compare evaluations');
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Iterate through an array of pool and chainId pairs
var poolsToCheck = [
    { chainId: 42161, poolId: '608' },
    { chainId: 42161, poolId: '609' },
    { chainId: 42161, poolId: '610' },
    { chainId: 42161, poolId: '611' },
    // Add more pools as needed
];
void (function () { return __awaiter(void 0, void 0, void 0, function () {
    var _i, poolsToCheck_1, _a, chainId, poolId;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _i = 0, poolsToCheck_1 = poolsToCheck;
                _b.label = 1;
            case 1:
                if (!(_i < poolsToCheck_1.length)) return [3 /*break*/, 4];
                _a = poolsToCheck_1[_i], chainId = _a.chainId, poolId = _a.poolId;
                return [4 /*yield*/, compareEvaluations(chainId, poolId)];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); })();