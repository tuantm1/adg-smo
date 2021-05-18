MetronicApp.factory('UserModel', ['$resource', 'ApiUrl', function ($resource, ApiUrl) {
    return $resource(ApiUrl + '/taskuser/:ten_tk.json', {ten_tk: '@ten_tk'}, {
        'update': {method: 'PUT'}
    });
}]);
MetronicApp.factory('AccountModel', ['$resource', 'ApiUrl', function ($resource, ApiUrl) {
    return $resource(ApiUrl + '/account/:accountId.json', {accountId: '@account_id'}, {
        'update': {method: 'PUT'}
    });
}]);
MetronicApp.factory('BillModel', ['$resource', 'ApiUrl', function ($resource, ApiUrl) {
    return $resource(ApiUrl + '/bill/:billId.json', {billId: '@bill_id'}, {
        'update': {method: 'PUT'}
    });
}]);
MetronicApp.factory('StatisticalModel', ['$resource', 'ApiUrl', function ($resource, ApiUrl) {
    return $resource(ApiUrl + '/statistical/:statisticalId.json', {statisticalId: '@statistical_id'}, {
        'update': {method: 'PUT'}
    });
}]);
MetronicApp.factory('ReportModel', ['$resource', 'ApiUrl', function ($resource, ApiUrl) {
    return $resource(ApiUrl + '/report/:reportId.json', {reportId: '@report_id'}, {
        'update': {method: 'PUT'}
    });
}]);
