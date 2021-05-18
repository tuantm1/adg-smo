MetronicApp.controller('ListPaymentTermCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $http) {
            ApiQuery.post('/GET_PAYMENT_TERMS').then(function (res) {
                $scope.paymentTerms = [];
                if (res.data.RETURN.TYPE === "S"){
                    $scope.paymentTerms = res.data.GT_PAYMENT_TERM;
                }
            })
        }]);