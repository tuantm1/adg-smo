MetronicApp.controller('ReportKE24Ctr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope) {
        }]);
MetronicApp.controller('ReportKE25Ctr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope) {
        }]);
MetronicApp.controller('ReportKE26Ctr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope) {
        }]);
MetronicApp.controller('DSDHCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope) {
            // $scope.submit = function (start, end) {
            //     let data = {
            //         ID_USER: $rootScope.userData.id_user,
            //         zstart: zstart,
            //         zend: zend
            //     };
            //     ApiQuery.post("/REPORT_DSDH", data).then(function (res) {
            //         console.log(res);
            //         saveAs("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + res.data.ZRAWDATA, "dsdh" + "_" + zstart + '/' + zend + ".xlsx");
            //         window.open($scope.urlHref, "_blank");
            //         $scope.urlHref = '';
            //     });
            // }
            $scope.submit = function (start, end, status) {
                let data = {
                    ID_USER: $rootScope.userData.id_user,
                    zstart: zstart,
                    zend: zend,
                    zstatus: status
                };
                ApiQuery.post("/REPORT_DSDH", data).then(function (res) {
                    console.log(res);
                    saveAs("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + res.data.ZRAWDATA, "dsdh" + "_" + zstart + '/' + zend + ".xlsx");
                    window.open($scope.urlHref, "_blank");
                    $scope.urlHref = '';
                });
            }
        }]);