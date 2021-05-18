MetronicApp.controller('MaterialCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope) {
            $rootScope.characters = [];
            $scope.data = {
                I_COMPANYCODE: '1000',
                I_PLANT: '1002',
                I_FLAG: 'A',
                format: "json"
            };
            $scope.character_group = character_group;


            // if ($rootScope.pagination === undefined) {
            //     $rootScope.pagination = {
            //         current: 1,
            //         totalItems: 10
            //     };
            // }
            // $scope.$watch('pagination.current', function (val) {
            //     $rootScope.pagination.current = val;
            //     console.log(val);
            //     cb();
            // });
            //
            // function cb() {
            //     $rootScope.totalItems = 0;
            //     ApiQuery.post('/GET_MARA_MASTER', {
            //         ID_USER: $rootScope.userData.id_user,
            //         _page_number: $rootScope.pagination.current,
            //     }).then(function (res) {
            //         $rootScope.totalItems = 700;
            //         $scope.maras = res.data.MARAS;
            //     });
            // }


            ApiQuery.post('/GET_MARA', {
                ID_USER: $rootScope.userData.id_user
            }).then(function (res) {
                $scope.maras = res.data.MARAS;
            });
            $scope.getCharacteristic = function (matnr) {
                $rootScope.characters = [];
                ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: matnr}).then(function (res) {
                    if (res.data.GT_CHARACTER.length === 0) {
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: matnr}).then(function (res) {
                            res.data.DATA.forEach(function (value) {
                                if (value.VALUE2.length !== 0) {
                                    $rootScope.characters.push({
                                        MATNR: matnr,
                                        ATNAM: value.ATNAM,
                                        SMBEZ: value.SMBEZ,
                                        ZVALUE: value.AUSP1,
                                        ZSORT: value.ZSORT,
                                        value_default: value.VALUE2
                                    });
                                } else {
                                    $rootScope.characters.push({
                                        MATNR: matnr,
                                        ATNAM: value.ATNAM,
                                        SMBEZ: value.SMBEZ,
                                        ZVALUE: value.AUSP1,
                                        ZSORT: value.ZSORT,
                                        value_default: []
                                    });
                                }
                            });
                            $('#myModal').modal('show');
                        });
                    } else {
                        res.data.GT_CHARACTER.forEach(function (value) {
                            if (value.ZDEFAULT === 'X') {
                                $rootScope.characters.push({
                                    MATNR: matnr,
                                    ATNAM: value.ATNAM,
                                    SMBEZ: value.SMBEZ,
                                    ZVALUE: value.ZVALUE,
                                    ZSORT: value.ZSORT,
                                    zdefault: true,
                                    zgroup: value.ZGROUP
                                });
                            } else {
                                $rootScope.characters.push({
                                    MATNR: matnr,
                                    ATNAM: value.ATNAM,
                                    SMBEZ: value.SMBEZ,
                                    ZVALUE: value.ZVALUE,
                                    ZSORT: value.ZSORT,
                                    zdefault: false,
                                    zgroup: value.ZGROUP
                                });
                            }
                        });
                        $('#myModal').modal('show');
                    }
                });

            };
            $scope.submitCharacter = function () {
                $rootScope.characters.forEach(function (value) {
                    if (value.zdefault === true) {
                        value.zdefault = 'X';
                    } else {
                        value.zdefault = '';
                    }
                });
                ApiQuery.post("/CREATE_CHAR_DF", {GT_CHARACTER: $rootScope.characters}).then(function (res) {
                    $('#myModal').modal('hide');
                });

            }
        }]);