MetronicApp.controller('ConfigTemplateCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            $rootScope.listConfigTem = [];

            ApiQuery.post('/GET_TEMP', {id_user: $rootScope.userData.id_user}).then(function (res) {
                $rootScope.listConfigTem = res.data.RES;
            });

            $scope.assignTemp = function (idTemp) {
                $rootScope.idTemp = idTemp;
                ApiQuery.post("/authentication", {ID_USER: $rootScope.userData.id_user}).then(function (res) {
                    if (res.data.RETURN.TYPE === 'S') {
                        $scope.userChild = res.data.GT_USER;
                    }
                })
            };
            $scope.assign = function () {
                $scope.userChoose = [];
                $scope.userChild.forEach(function (value) {
                    if (value.choose === true) {
                        $scope.userChoose.push(value);
                    }
                });

                ApiQuery.post("/assign_temp", {
                    ID_TEMP: $rootScope.idTemp,
                    GT_USER: $scope.userChoose
                }).then(function (res) {
                    if (res.data.RETURN.TYPE === 'S') {
                        bootbox.alert({
                            message: "Assign thành công",
                            callback: function () {
                            }
                        });
                    }
                });
                delete $rootScope.idTemp;
            };

            $scope.del = function (id, name) {
                bootbox.confirm({
                    title: "Xóa Mẫu đơn hàng?",
                    message: "Xóa mẫu đơn hàng " + name + "?",
                    buttons: {
                        confirm: {
                            label: 'Đồng Ý',
                            className: 'btn-success'
                        },
                        cancel: {
                            label: 'Hủy bỏ',
                            className: 'btn-danger'
                        }
                    },
                    callback: function (result) {
                        if (result === true) {
                            ApiQuery.post("/DELETE_TEMP", {ID_TEMP: id}).then(function (res) {
                                if (res.data.RETURN.TYPE === 'S') {
                                    $state.reload();
                                }
                            })
                        }
                    }
                });
            }
        }]);


MetronicApp.controller('ConfigTemplateCreateCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'ApiQuery', '$timeout', 'UserModel', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, ApiQuery, $timeout, UserModel, $rootScope, $http, ApiUrl) {
            $rootScope.gt_mara = [];

            $scope.loadMara = function (division) {
                ApiQuery.post('/GET_MARA', {
                    ID_USER: $rootScope.userData.id_user,
                    division: division
                }).then(function (res) {
                    $scope.maras = res.data.MARAS;
                    $rootScope.gt_mara = res.data.MARAS;
                });
            };

            $('.select-yourself').selectize({
                valueField: 'MATNR',
                labelField: 'MAKTX',
                searchField: 'MAKTX',
                preload: true,
                options: $rootScope.gt_mara,
                create: false,
                load: function (query, callback) {
                    if (!query.length) return callback();
                    callback($rootScope.gt_mara);
                }
            });

            $scope.disable = false;
            $scope.myConfig2 = {
                maxItems: 1,
                valueField: 'MATNR',
                labelField: 'MAKTX',
                searchField: 'MAKTX',
                preload: true,
                options: $rootScope.gt_mara,
                dropdownParent: 'body',
                create: false,
                load: function (query, callback) {
                    if (!query.length) return callback();
                    callback($rootScope.gt_mara);
                }
            };

            $scope.character_group = character_group;
            ApiQuery.post('/GET_DIVISION', {}).then(function (res) {
                $scope.division = res.data.GT_DIVISION;
            });
            ApiQuery.post('/GET_DC', {}).then(function (res) {
                $scope.dc = res.data.GT_DC;
            });

            ApiQuery.post('/GET_ORDER_TYPE').then(function (res) {
                if (res.data.RETURN.TYPE === "S") {
                    $scope.orderTypes = res.data.GT_ORDER_TYPE;
                }
            });


            $scope.edit = function (matnr) {
                $rootScope.characters = [];
                $rootScope.material = matnr;
                ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: matnr}).then(function (res) {
                    $scope.get_characteristic = res.data.DATA;
                    ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: matnr}).then(function (res2) {
                        res.data.DATA.forEach(function (value) {
                            res2.data.GT_CHARACTER.forEach(function (value2) {
                                if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                    if (value.VALUE2.length !== 0) {
                                        $rootScope.characters.push({
                                            ATNAM: value.ATNAM,
                                            SMBEZ: value.SMBEZ,
                                            value: value2.ZVALUE,
                                            zgroup: value2.ZGROUP,
                                            zsort: value2.ZSORT,
                                            value_default: value.VALUE2
                                        });
                                    } else {
                                        $rootScope.characters.push({
                                            ATNAM: value.ATNAM,
                                            SMBEZ: value.SMBEZ,
                                            value: value2.ZVALUE,
                                            zgroup: value2.ZGROUP,
                                            zsort: value2.ZSORT,
                                            value_default: []
                                        });
                                    }
                                }
                            })
                        })
                    });
                    $scope.checkGroup = function (value) {
                        let index = $rootScope.characters.findIndex(item => item.zgroup === value);
                        if (index !== -1) {
                            return true;
                        }
                        return false;
                    };
                    $('#myModal').modal('show');

                });
            };
            $scope.submitPopup = function () {
                $('#myModal').modal('hide');
                $scope.listTems.forEach(function (value) {
                    if (value.MATNR === $rootScope.material) {
                        value.CHARACTERISTICS = $rootScope.characters;
                        $rootScope.characters = [];
                    }
                });
            };

            $scope.configTem = {
                id: 1,
                id_user: $rootScope.userData.id_user,
                name: "",
                DC: "",
                order_type: "",
                note: "",
                DIVISION: '',
                items: []
            };
            ApiQuery.post('/GET_PAYMENT_TERMS').then(function (res) {
                $scope.paymentTerms = [];
                if (res.data.RETURN.TYPE === "S") {
                    $scope.paymentTerms = res.data.GT_PAYMENT_TERM;
                }
            });
            $scope.listTems = [{
                ID: 1,
                TYPE: "T",
                NAME: '',
                MATNR: 0,
                QUANTITY: 0,
                SALE_UNIT: "",
                CHARACTERISTICS: [],
                Z_RETURN: false
            }];
            jQuery('select').on('select2:select', function (e) {
                $timeout(function () {
                    $(e.target).trigger("change");
                    jQuery(".js-validation-material").valid();
                }, 200);
            });


            $scope.addNew = function () {
                $scope.listTems.push({
                    ID: $scope.listTems.length + 1,
                    CHARACTERISTICS: [],
                    TYPE: "T",
                    NAME: '',
                    MATNR: 0,
                    ZTERM: '',
                    QUANTITY: 0,
                    SALE_UNIT: "",
                    Z_RETURN: false
                })
            };


            $scope.loadUnit = function (index, matnr) {
                $scope.maras.forEach(function (value) {
                    if (value.MATNR === matnr) {
                        $scope.listTems[index].NAME = value.MAKTG;
                        $scope.listTems[index].SALE_UNIT = value.MEINS;
                        if (value.LABOR === '002') {
                            $scope.listTems[index].Z_RETURN = true;
                        } else {
                            $scope.listTems[index].Z_RETURN = false;
                        }
                    }
                })
            };

            $scope.save = function () {
                $scope.listTems.forEach(function (value) {
                    value.TEMPLATE_ID = $scope.configTem.id;
                    if (value.Z_RETURN === true) {
                        value.Z_RETURN = 1;
                    }
                    if (value.Z_RETURN === false) {
                        value.Z_RETURN = 2;
                    }
                });
                // if ($scope.configTem.DIVISION !== '02' && !check_data($scope.listTems[0].CHARACTERISTICS)) {
                //     bootbox.alert({
                //         message: "Mời lưu thuộc tính mẫu",
                //         callback: function () {
                //         }
                //     })
                // } else
                if (check_data($scope.configTem.DC) === false || check_data($scope.configTem.name) === false || check_data($scope.configTem.order_type) === false) {
                    bootbox.alert({
                        message: "Mời nhập đủ thông tin",
                        callback: function () {
                        }
                    });

                } else {
                    $scope.listTems.forEach(function (value3) {
                        if (value3.CHARACTERISTICS.length === 0) {
                            ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value3.MATNR}).then(function (res) {
                                $scope.get_characteristic = res.data.DATA;
                                ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value3.MATNR}).then(function (res2) {
                                    res.data.DATA.forEach(function (value) {
                                        res2.data.GT_CHARACTER.forEach(function (value2) {
                                            if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                                if (value.VALUE2.length !== 0) {
                                                    value3.CHARACTERISTICS.push({
                                                        ATNAM: value.ATNAM,
                                                        SMBEZ: value.SMBEZ,
                                                        value: value2.ZVALUE,
                                                        zgroup: value2.ZGROUP,
                                                        value_default: value.VALUE2
                                                    });
                                                } else {
                                                    value3.CHARACTERISTICS.push({
                                                        ATNAM: value.ATNAM,
                                                        SMBEZ: value.SMBEZ,
                                                        value: value2.ZVALUE,
                                                        zgroup: value2.ZGROUP,
                                                        value_default: []
                                                    });
                                                }
                                            }
                                        })
                                    })
                                });

                            });
                        }
                    });
                    $scope.configTem.items = $scope.listTems;
                    setTimeout(
                        function () {
                            ApiQuery.post('/CREATE_TEMP', {request: $scope.configTem}).then(function (res) {
                                if (res.data.RETURN.TYPE === 'S') {
                                    bootbox.alert({
                                        message: "Thêm Mẫu đơn hàng thành công",
                                        callback: function () {
                                            $state.go('ConfigTemplate.list');
                                        }
                                    });
                                }
                            })
                        }, 1000);
                }
                ;

            };

            $scope.delTem = function (temID) {
                $scope.listTems.splice(temID, 1);
            };
            $timeout(function () {
            }, 500);
        }]);

MetronicApp.controller('ConfigTemplateEditCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'ApiQuery', '$timeout', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, ApiQuery, $timeout, $rootScope, $http) {
            $scope.character_group = character_group;
            ApiQuery.post('/GET_DIVISION', {}).then(function (res) {
                $scope.division = res.data.GT_DIVISION;
            });
            ApiQuery.post('/GET_DC', {}).then(function (res) {
                $scope.dc = res.data.GT_DC;
            });
            ApiQuery.post('/GET_ORDER_TYPE').then(function (res) {
                if (res.data.RETURN.TYPE === "S") {
                    $scope.orderTypes = res.data.GT_ORDER_TYPE;
                }

            });
            ApiQuery.post('/GET_DETAIL_TEMP', {ID_TEMP: $stateParams.temId}).then(function (res) {
                res.data.RESPONSE.ITEMS.forEach(function (value) {
                    // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '');
                    if (value.Z_RETURN === "1") {
                        value.Z_RETURN = true;
                    }
                    if (value.Z_RETURN === "2") {
                        value.Z_RETURN = false;
                    }
                    ApiQuery.post('/GET_MARA', {
                        ID_USER: $rootScope.userData.id_user,
                        division: res.data.RESPONSE.DIVISION
                    }).then(function (res) {
                        $scope.maras = res.data.MARAS;
                    });
                });
                $scope.items = res.data.RESPONSE.ITEMS;
                $scope.items.forEach(function (value2) {
                    let flag = false;
                    ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value2.MATNR}).then(function (res2) {
                        res2.data.GT_CHARACTER.forEach(function (value) {
                            if (value.ZDEFAULT === 'X') {
                                for (let i = 0; i < value2.CHARACTERISTICS.length; i++) {
                                    if (value2.CHARACTERISTICS[i].ATNAM === value.ATNAM) {
                                        flag = false;
                                        i = value2.CHARACTERISTICS.length;
                                    } else {
                                        flag = true;
                                    }
                                }
                                if (flag === true) {
                                    value2.CHARACTERISTICS.push(value);
                                }
                            }
                        });
                    });
                });
                $scope.theConfigTem = res.data.RESPONSE;

                $scope.theConfigTem.ITEMS.forEach(function (value) {

                    if ($scope.maras.findIndex(item => item.MATNR === value.MATNR) !== -1) {
                        value.ZPRICE = $scope.maras.findIndex(item => item.MATNR === value.MATNR).ZPRICE;
                    }
                })

                $scope.SHIPTO_ID = "";
            });
            jQuery('select').on('select2:select', function (e) {
                $timeout(function () {
                    $(e.target).trigger("change");
                    jQuery(".js-validation-material").valid();
                }, 200);
            });

            $scope.addNew = function () {
                $scope.theConfigTem.ITEMS.push({

                    ID_ITEM: $scope.theConfigTem.ITEMS.length + 1,
                    ID_TEMPLATE: $scope.theConfigTem.ITEMS[0].ID_TEMPLATE,
                    CHARACTERISTICS: [],
                    NAME: '',
                    MATNR: 0,
                    QUANTITY: 0,
                    SALE_UNIT: "",
                    TYPE: "T",
                    Z_RETURN: false
                })
            };

            $scope.loadUnit = function (index, matnr) {
                $scope.maras.forEach(function (value) {
                    if (value.MATNR === matnr) {
                        $scope.theConfigTem.ITEMS[index].NAME = value.MAKTG;
                        $scope.theConfigTem.ITEMS[index].SALE_UNIT = value.MEINS;
                        $scope.theConfigTem.ITEMS[index].ZPRICE = value.ZPRICE;
                        if (value.LABOR === '002') {
                            $scope.theConfigTem.ITEMS[index].Z_RETURN = true;
                        } else {
                            $scope.theConfigTem.ITEMS[index].Z_RETURN = false;
                        }
                    }
                })
            };


            $scope.save = function () {
                $scope.theConfigTem.ITEMS.forEach(function (value) {
                    if (value.Z_RETURN === true) {
                        value.Z_RETURN = 1;
                    }
                    if (value.Z_RETURN === false) {
                        value.Z_RETURN = 2;
                    }

                });
                ApiQuery.post('/update_temp', {request: $scope.theConfigTem}).then(function (res) {
                    if (res.data.RETURN.TYPE === 'S') {
                        bootbox.alert({
                            message: "Sửa Mẫu đơn hàng thành công",
                            callback: function () {
                                $state.go('ConfigTemplate.list');
                            }
                        });
                    }
                });
            };

            $scope.edit = function (matnr) {
                ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: matnr}).then(function (res) {
                    $rootScope.characters = [];
                    $scope.items.forEach(function (value) {
                        value.CHARACTERISTICS.forEach(function (value2) {
                            res.data.DATA.forEach(function (value3) {
                                if (value3.ATNAM === value2.ATNAM) {
                                    value2.value_default = value3.VALUE2;
                                }
                            })
                        });
                        if (value.MATNR === matnr) {
                            $rootScope.characters = value.CHARACTERISTICS;
                        }
                        $scope.checkGroup = function (value) {
                            let index = $rootScope.characters.findIndex(item => item.ZGROUP === value);
                            if (index !== -1) {
                                return true;
                            }
                            return false;
                        }
                    });
                });
                $('#myModal').modal('show');
            };

            $scope.submitPopup = function () {
                $('#myModal').modal('hide');
            };

            $scope.delTem = function (temID) {
                $scope.theConfigTem.ITEMS.splice(temID, 1);
            };
            $timeout(function () {
            }, 500);
        }]);