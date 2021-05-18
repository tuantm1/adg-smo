MetronicApp.controller('UploadListCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            $scope.imageStrings = [];
            $scope.xstring = '';
            $scope.processFiles = function(files){
                console.log('aaaaaaaaa');
                angular.forEach(files, function(flowFile, i){
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        var uri = event.target.result;
                        $scope.imageStrings[i] = uri;
                        $scope.xstring = uri.split( "base64," )[ 1 ];
                    };
                    fileReader.readAsDataURL(flowFile.file);

                });
            };
        }]);
