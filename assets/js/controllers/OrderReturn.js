MetronicApp.controller('OrderReturnCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http', '$timeout',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http, $timeout) {
            $rootScope.start = moment().subtract(6, 'days');
            $rootScope.end = moment();
            $scope.va03 = [];
            $rootScope.itemsReturn = [];
            $scope.listOrderReturn = [];

            function cb(start, end) {
                $rootScope.totalItems = 0;
                $('#reportrange span').html(start.format('DD/MM/YYYY') + ' - ' + end.format('DD/MM/YYYY'));
                ApiQuery.post("/get_order", {id_user: $rootScope.userData.id_user, order_type : 'ZRE0'}).then(function (res) {
                    res.data.RES.forEach(function (val) {
                        if (val.ZTYPE === '1') {
                            if (val.ITEMS.length !== 0) {
                                val.itemText = "";
                                val.ITEMS.forEach(function (value) {
                                    // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                                    val.itemText += value.NAME
                                });

                            }

                            ApiQuery.post('/GET_NOTI_MESSAGE', {
                                ID_ORDER: val.ID_ORDER,
                                ID_USER: $rootScope.userData.id_user
                            }).then(function (res) {
                                if (res.data.RETURN.TYPE === "S") {
                                    $scope.check = res.data.ZCHECK;
                                    // $scope.check = parseInt($scope.check, 10);
                                    val.check = parseInt($scope.check, 10);
                                }
                            });
                            $scope.listOrderReturn.push(val);

                        }
                    });

                })
            }

            $('#reportrange').daterangepicker({
                startDate: $rootScope.start,
                endDate: $rootScope.end,
                ranges: range
            }, cb);
            cb($rootScope.start, $rootScope.end);

            $scope.create_return_order = function () {
                $scope.va03.forEach(function (value) {
                    if (value.choose === true) {
                        $rootScope.itemsReturn.push(value);
                    }
                });
                $state.go('OrderReturn.create')
            };

            $scope.approve = function (id_order) {
                ApiQuery.post("/approve_order", {
                    ID_USER: $rootScope.userData.id_user,
                    ID_ORDER: id_order
                }).then(function (res) {
                    $state.reload();
                })
            };
        }]);

MetronicApp.controller('OrderReturnListCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http', '$timeout',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http, $timeout) {
            $rootScope.start = moment().subtract(6, 'days');
            $rootScope.end = moment();
            $scope.va03 = [];
            $rootScope.itemsReturn = [];

            function cb(start, end) {
                $rootScope.totalItems = 0;
                $('#reportrange span').html(start.format('DD/MM/YYYY') + ' - ' + end.format('DD/MM/YYYY'));
                ApiQuery.post('/get_va03', {
                    ID_USER: $rootScope.userData.id_user,
                    ZSTART: start,
                    ZEND: end
                }).then(function (res) {
                    $scope.va03 = res.data.GT_VA03;
                    $scope.va03.forEach(function (value) {
                        value.DATE = value.DATE.slice(6, 8) + '/' + value.DATE.slice(4, 6) + '/' + value.DATE.slice(0, 4);
                        value.choose = false;
                        // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                        value.TYPE = 'O';
                        value.Z_RETURN = '1';
                        value.NAME = value.ITEM;
                    })

                })
            }

            $('#reportrange').daterangepicker({
                startDate: $rootScope.start,
                endDate: $rootScope.end,
                ranges: range
            }, cb);
            cb($rootScope.start, $rootScope.end);

            $scope.create_return_order = function () {
                $scope.va03.forEach(function (value) {
                    if (value.choose === true) {
                        $rootScope.itemsReturn.push(value);
                    }
                });
                $state.go('OrderReturn.create')
            };
        }]);

MetronicApp.controller('CreateOrderReturnCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            ApiQuery.post('/GET_MARA', {
                ID_USER: $rootScope.userData.id_user
            }).then(function (res) {
                $scope.maras = res.data.MARAS;
            });
            ApiQuery.post('/GET_ORDER_TYPE').then(function (res) {
                if (res.data.RETURN.TYPE === "S") {
                    $scope.orderTypes = res.data.GT_ORDER_TYPE;
                }
            });

            ApiQuery.post('/GET_DC', {}).then(function (res) {
                $scope.dc = res.data.GT_DC;
            });
            $scope.theOrder = {
                NAME: 'Đơn hàng trả lại',
                ORDER_TYPE: 'ZRE0',
                DC: $rootScope.itemsReturn[0].DC,
                DIVISION: $rootScope.itemsReturn[0].DIVISION,
                ITEMS: $rootScope.itemsReturn
            };
            $scope.submit = function () {
                $scope.theOrder.ID_USER = $rootScope.userData.id_user;
                $scope.theOrder.STATUS = "P";
                $scope.theOrder.Z_DATE = $scope.theDate;
                ApiQuery.post('/CREATE_ORDER', {request: $scope.theOrder}).then(function (res) {
                    bootbox.alert({
                        message: "Đơn hàng số " + res.data.SALESDOCUMENT + " tạo thành công",
                        callback: function () {
                            $state.go('Order.list');
                        }
                    })
                    // $state.go('Order.list');
                });
            }
        }]).directive('dateFormatter', [
    function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function postLink(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (data) {
                    var out = moment(data).format('YYYYMMDD');
                    return out;
                });

                ngModel.$formatters.push(function (data) {
                    var out = moment(data, 'YYYYMMDD').toDate();
                    return out;
                });
            }
        };
    }
]);


MetronicApp.controller('DetailOrderReturnCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http', '$filter',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http, $filter) {
            // upload images
            $scope.imageStrings = [];
            $scope.message = '';
            $scope.processFiles = function (files, idOrder) {
                angular.forEach(files, function (flowFile, i) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        var uri = event.target.result;
                        $scope.imageStrings[i] = uri;
                        $scope.xstring = uri.split("base64,")[1];
                    };
                    fileReader.readAsDataURL(flowFile.file);
                });
                setTimeout(function () {
                    ApiQuery.post('/UPLOAD', {ID_ORDER: idOrder, XSTRING: $scope.xstring}).then(function (res) {
                        if (res.data.RETURN.TYPE === 'S') {
                            bootbox.alert({
                                message: "Upload ảnh thành công!!!",
                                callback: function () {
                                    $('#myModalImage').hide();
                                    $('.modal-backdrop').hide();
                                    $state.reload();
                                }
                            })
                        }
                    });
                }, 1000);
            };

            ApiQuery.post('/GET_PAYMENT_TERMS').then(function (res) {
                $scope.paymentTerms = [];
                if (res.data.RETURN.TYPE === "S") {
                    $scope.paymentTerms = res.data.GT_PAYMENT_TERM;
                }
            });


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

            ApiQuery.post('/GET_NOTI_MESSAGE', {
                ID_ORDER: $stateParams.idOrder,
                ID_USER: $rootScope.userData.id_user
            }).then(function (res) {
                if (res.data.RETURN.TYPE === "S") {
                    $scope.check = res.data.ZCHECK;
                    $scope.check = parseInt($scope.check, 10);
                }
            });

            ApiQuery.post("/GET_DETAIL_ORDER", {ID_ORDER: $stateParams.idOrder}).then(function (res) {
                res.data.RESPONSE.ITEMS.forEach(function (value) {
                    // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                    if (value.Z_RETURN === "1") {
                        value.Z_RETURN = true;
                    }
                    if (value.Z_RETURN === "2") {
                        value.Z_RETURN = false;
                    }
                });
                $scope.theOrder = res.data.RESPONSE;
                $scope.theOrder.ZIMAGE = res.data.RESPONSE.ZIMAGE;
                $scope.items = res.data.RESPONSE.ITEMS;
            });

            $scope.closePopup = function () {
                $('#myModal').modal('hide');
            };

            $scope.edit = function (matnr) {
                $('#myModal').modal('show');
                ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: matnr}).then(function (res) {
                    $rootScope.characters = [];
                    $scope.items.forEach(function (value) {
                        value.CHARACTERISTICS.forEach(function (value2) {
                            res.data.DATA.forEach(function (value3) {
                                if (value3.ATNAM === value2.ATNAM) {
                                    value2.value_default = value3.VALUE2;
                                }
                            })
                        })
                        if (value.MATNR === matnr) {
                            $rootScope.characters = value.CHARACTERISTICS;
                        }
                    });
                });
            };

            $scope.submitPopup = function () {
                $('#myModal').modal('hide');
                $scope.theOrder.ITEMS.forEach(function (value) {
                    if (value.MATNR === $rootScope.material) {
                        value.CHARACTERISTICS = $rootScope.characters;
                    }
                });
            };

            $scope.update = function () {
                $scope.theOrder.ITEMS.forEach(function (value) {
                    value.TYPE = 'ORDER';
                    if (value.Z_RETURN === true) {
                        value.Z_RETURN = 1;
                    }
                    if (value.Z_RETURN === false) {
                        value.Z_RETURN = 2;
                    }
                });
                ApiQuery.post("/UPDATE_ORDER", {request: $scope.theOrder}).then(function (res) {
                    $state.go('Order.list');
                })
            };


            //chats
            $scope.chats = function (id_order) {
                $scope.cbValue = true;
                let zmessage = {
                    id_order: id_order,
                    id_user: $rootScope.userData.id_user,
                    ZMESSAGE: "",
                    Z_TIME: ""
                };
                ApiQuery.post("/MESSAGE", {ZMESSAGE: zmessage}).then(function (res) {
                    $scope.messengers = res.data.MESSAGES;
                    $scope.messengers.forEach(function (value) {
                        if (value.ID_USER === $rootScope.userData.id_user) {
                            value.type = 'in';
                        } else {
                            value.type = 'out'
                        }
                    });
                })
            };

            $scope.getKeys = function ($event, id_order, message) {
                if ($event.keyCode === 13) {
                    $scope.sendMessage(id_order, message);
                }
            };

            $scope.sendMessage = function (id_order, message) {
                let date = new Date();
                let zmessage = {
                    id_order: id_order,
                    id_user: $rootScope.userData.id_user,
                    ZMESSAGE: message,
                    Z_TIME: ("0" + date.getHours()).slice(-2) + "" + ("0" + date.getMinutes()).slice(-2) + "" + ("0" + date.getSeconds()).slice(-2) + ""
                };
                $scope.message = '';
                ApiQuery.post("/MESSAGE", {ZMESSAGE: zmessage}).then(function (res) {
                    $scope.messengers = res.data.MESSAGES;
                    $scope.messengers.forEach(function (value) {
                        if (value.ID_USER === $rootScope.userData.id_user) {
                            value.type = 'in';
                        } else {
                            value.type = 'out'
                        }
                    });
                })
            };
            $scope.closeModal = function (value) {
                $scope.cbValue = false;
            }

        }]);
