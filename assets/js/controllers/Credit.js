MetronicApp.controller('CreditListCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http', '$timeout',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http, $timeout) {
            $rootScope.listOrder = [];

            ApiQuery.post("/credit", {id_user: $rootScope.userData.id_user}).then(function (res) {
                res.data.RES.forEach(function (val) {
                    val.STBL = regex_number(val.STBL);
                    if (val.ITEMS.length !== 0) {
                        val.itemText = "";
                        val.ITEMS.forEach(function (value) {
                            // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                            val.itemText += value.NAME
                        });
                    }
                    $rootScope.listOrder.push(val);

                });
            });
            $scope.approve = function (id_order) {
                ApiQuery.post("/get_order", {
                    ID_USER: $rootScope.userData.id_user,
                    ID_ORDER: id_order
                }).then(function (res) {
                    $state.reload();
                })
            };
            $scope.id_order = "";
            $scope.reason = "";
            $scope.rejectReason = function (id_order) {
                $scope.id_order = id_order;
                // $('#myModal2').modal('show');
            };
            $scope.reject = function (reason) {
                $('#myModal2').modal('hide');
                if (reason === '') {
                    bootbox.alert({
                        message: "Chưa có lý do từ chối đơn hàng!!!",
                        callback: function () {
                        }
                    })
                } else {
                    $scope.rejectReason = "Lý do từ chối: " + reason;
                    ApiQuery.post("/REJECT_ORDER", {
                        ID_USER: $rootScope.userData.id_user,
                        ID_ORDER: $scope.id_order,
                        REJECT_REASON: $scope.rejectReason
                    }).then(function (res) {
                        if (res.data.RETURN.TYPE === 'S') {
                            bootbox.alert({
                                message: "Đơn hàng bị từ chối!!!",
                                callback: function () {
                                    $state.reload();
                                    $('#myModal2').modal('hide');
                                }
                            })

                        }
                    });
                }
            }

        }]);
MetronicApp.controller('CreditApproveDetailCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http', '$timeout',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http, $timeout) {

            $rootScope.listOrder = [];
            $scope.theCredit = {};
            $scope.loadCredit = function (id_parent, id_order) {
                ApiQuery.post('/GET_DETAIL_USER_BL', {
                    ID_USER: id_parent,
                    ID_ORDER: id_order
                }).then(function (res) {
                    ApiQuery.post('/GET_DIVISION', {}).then(function (res1) {
                        $scope.division = res1.data.GT_DIVISION;
                        let index = $scope.division.findIndex(item => 'CS' + item.SPART === res.data.GRADE);
                        if (index !== -1) {
                            $scope.theCredit.grade = $scope.division[index].VTEXT;
                        }
                    });
                    $scope.theCredit.hmcl = Math.round(res.data.HMCL);
                    let current_datetime = moment();
                    $scope.today = current_datetime.format('DD/MM/YYYY');
                    $scope.theCredit.zdate = $scope.today;
                    $scope.end_date = function (value) {
                        let newDate = moment().add(value, 'days');
                        $scope.theCredit.zend_date = newDate.format('DD/MM/YYYY');
                    }
                });
            };
            ApiQuery.post('/get_detail_bl', {ID_CREDIT: $stateParams.idCredit}).then(function (res2) {
                $scope.detailBl = res2.data.GT_CREDIT;
                $scope.detailBl.ZDAY = parseInt($scope.detailBl.ZDAY);

                $scope.theCredit.id_request = res2.data.GT_CREDIT.ID_REQUEST;
                $scope.theCredit.id_approve = res2.data.GT_CREDIT.ID_APPROVE;
                $scope.theCredit.status = res2.data.GT_CREDIT.STATUS;


                ApiQuery.post('/GET_DETAIL_USER_BL', {
                    ID_USER: $rootScope.userData.id_user,
                    ID_ORDER: res2.data.GT_CREDIT.ID_ORDER
                }).then(function (res) {
                    ApiQuery.post('/GET_DIVISION', {}).then(function (res1) {
                        $scope.division = res1.data.GT_DIVISION;
                        let index = $scope.division.findIndex(item => 'CS' + item.SPART === res.data.GRADE);
                        if (index !== -1) {
                            $scope.theCredit.grade = $scope.division[index].VTEXT;
                        }
                    });

                    $scope.theCredit.id_parent = $rootScope.userData.id_user;
                    $scope.theCredit.name_requester = res.data.USER.NAME;
                    // $scope.theCredit.parent_name = res.data.USER.PARENT_NAME;
                    // $scope.theCredit.id_approve = res.data.USER.PARENT_ID;
                    $scope.theCredit.PARENTS = res.data.PARENTS;
                    ApiQuery.post('/GET_DETAIL_USER', {ID_USER: res2.data.GT_CREDIT.ID_REQUEST}).then(function (res3) {
                        $scope.theCredit.PARENTS.push(res3.data.USER);
                    });

                    // $scope.theCredit.id_request = $rootScope.userData.id_user;
                    // $scope.theCredit.id_approve = res.data.USER.PARENT_ID;

                    $scope.theCredit.hmcl = Math.round(res.data.HMCL);
                    let current_datetime = moment();
                    $scope.today = current_datetime.format('DD/MM/YYYY');
                    $scope.theCredit.zdate = $scope.today;
                    $scope.theCredit.zdate = $scope.today;
                    let newDate = moment().add($scope.detailBl.ZDAY, 'days');
                    $scope.theCredit.zend_date = newDate.format('DD/MM/YYYY');
                });


                ApiQuery.post("/GET_DETAIL_ORDER", {ID_ORDER: res2.data.GT_CREDIT.ID_ORDER}).then(function (res) {
                    $scope.theOrder = res.data.RESPONSE;
                    $scope.theCredit.id_order = res.data.RESPONSE.ID_ORDER;
                    $scope.loadCredit($scope.theCredit.id_approve, $scope.theCredit.id_order);
                    $scope.theCredit.stbl = res.data.RESPONSE.STBL;
                    $scope.theCredit.zprice = res.data.RESPONSE.ZPRICE;
                    res.data.RESPONSE.ITEMS.forEach(function (value) {
                    });

                    ApiQuery.post('/GET_DETAIL_USER', {ID_USER: $scope.theOrder.ID_USER}).then(function (res1) {
                        ApiQuery.post('/GET_DETAIL_CUSTOMER', {KUNNR: res1.data.USER.KUNNR}).then(function (res) {
                            res.data.CUSTOMER.CZREDIT.forEach(function (value) {
                                if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                    let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                    if (index !== -1) {
                                        $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                        $scope.theOrder.credit_value = value.VALUE;
                                    }
                                }
                            });
                            res.data.CUSTOMER.ZCREDIT_CUS.forEach(function (value) {
                                if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                    let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                    if (index !== -1) {
                                        $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                        $scope.theOrder.credit_value_cus = value.Z_AMOUNT_L;
                                    }
                                }
                            })
                        });
                    });
                    // ApiQuery.post('/GET_MARA', {
                    //     ID_USER: $rootScope.userData.id_user,
                    //     division: res.data.RESPONSE.DIVISION
                    // }).then(function (res) {
                    //     $scope.maras = res.data.MARAS;
                    //
                    // });

                });
            })


            $scope.approve = function (id_order) {
                ApiQuery.post("/get_order", {
                    ID_USER: $rootScope.userData.id_user,
                    ID_ORDER: id_order
                }).then(function (res) {
                    $state.reload();
                })
            };
            $scope.id_order = "";
            $scope.reason = "";
            $scope.rejectReason = function (id_order) {
                $scope.id_order = id_order;
                // $('#myModal2').modal('show');
            };
            $scope.reject = function (reason) {
                $('#myModal2').modal('hide');
                if (reason === '') {
                    bootbox.alert({
                        message: "Chưa có lý do từ chối đơn hàng!!!",
                        callback: function () {
                        }
                    })
                } else {
                    $scope.rejectReason = "Lý do từ chối: " + reason;
                    ApiQuery.post("/REJECT_ORDER", {
                        ID_USER: $rootScope.userData.id_user,
                        ID_ORDER: $scope.id_order,
                        REJECT_REASON: $scope.rejectReason
                    }).then(function (res) {
                        if (res.data.RETURN.TYPE === 'S') {
                            bootbox.alert({
                                message: "Đơn hàng bị từ chối!!!",
                                callback: function () {
                                    $state.reload();
                                    $('#myModal2').modal('hide');
                                }
                            })

                        }
                    });
                }
            };
            $scope.save = function (value) {
                $scope.theCredit.id_approve = $scope.theCredit.id_parent;
                switch (value) {
                    case '1':
                        ApiQuery.post('/CREATE_CREDIT', {
                            theCredit: $scope.theCredit,
                            zstatus: value
                        }).then(function (res) {
                            $state.go('CREATECREDIT.list')
                        });
                        break;
                    case '2':
                        ApiQuery.post('/CREATE_CREDIT', {
                            theCredit: $scope.theCredit,
                            zstatus: value
                        }).then(function (res) {
                            $state.go('CREATECREDIT.list')
                        });
                        break;
                    case '3':
                        ApiQuery.post("/approve_order", {
                            ID_USER: $rootScope.userData.id_user,
                            ID_ORDER: $scope.theOrder.ID_ORDER
                        }).then(function (res) {
                            $state.reload();
                        });
                        break;
                    case '':
                        ApiQuery.post('/CREATE_CREDIT', {theCredit: $scope.theCredit}).then(function (res) {
                            $state.go('CREATECREDIT.list')
                        });
                        break;
                }

            };
            $scope.id_order = "";
            $scope.reason = "";
            $scope.rejectReason = function (id_order) {
                $scope.id_order = id_order;
                // $('#myModal2').modal('show');
            };
            $scope.reject = function (reason) {
                $('#myModal2').modal('hide');
                if (reason === '') {
                    bootbox.alert({
                        message: "Chưa có lý do từ chối đơn hàng!!!",
                        callback: function () {
                        }
                    })
                } else {
                    $scope.rejectReason = "Lý do từ chối: " + reason;
                    ApiQuery.post("/REJECT_ORDER", {
                        ID_USER: $rootScope.userData.id_user,
                        ID_ORDER: $scope.id_order,
                        REJECT_REASON: $scope.rejectReason
                    }).then(function (res) {
                        if (res.data.RETURN.TYPE === 'S') {
                            bootbox.alert({
                                message: "Đơn hàng bị từ chối!!!",
                                callback: function () {
                                    $state.reload();
                                    $('#myModal2').modal('hide');
                                }
                            })

                        }
                    });
                }
            }

        }]);
MetronicApp.controller('CreditApproveListCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http', '$timeout',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http, $timeout) {
            $rootScope.listOrder = [];
            ApiQuery.post("/APPROVE_CREDIT_LIST", {id_user: $rootScope.userData.id_user}).then(function (res) {
                $scope.listCredit = res.data.GT_CREDIT;
                res.data.RES.forEach(function (val) {
                    if (val.ITEMS.length !== 0) {
                        val.itemText = "";
                        val.ITEMS.forEach(function (value) {
                            // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                            val.itemText += value.NAME
                        });
                    }
                    $rootScope.listOrder.push(val);

                });
            });
            $scope.approve = function (id_order) {
                ApiQuery.post("/approve_order", {
                    ID_USER: $rootScope.userData.id_user,
                    ID_ORDER: id_order
                }).then(function (res) {
                    $state.reload();
                })
            };
            $scope.id_order = "";
            $scope.reason = "";
            $scope.rejectReason = function (id_order) {
                $scope.id_order = id_order;
                // $('#myModal2').modal('show');
            };


            $scope.reject = function (reason) {
                $('#myModal2').modal('hide');
                if (reason === '') {
                    bootbox.alert({
                        message: "Chưa có lý do từ chối đơn hàng!!!",
                        callback: function () {
                        }
                    })
                } else {
                    $scope.rejectReason = "Lý do từ chối: " + reason;
                    ApiQuery.post("/REJECT_ORDER", {
                        ID_USER: $rootScope.userData.id_user,
                        ID_ORDER: $scope.id_order,
                        REJECT_REASON: $scope.rejectReason
                    }).then(function (res) {
                        if (res.data.RETURN.TYPE === 'S') {
                            bootbox.alert({
                                message: "Đơn hàng bị từ chối!!!",
                                callback: function () {
                                    $state.reload();
                                    $('#myModal2').modal('hide');
                                }
                            })

                        }
                    });
                }
            }

        }]);
MetronicApp.controller('CreateCreditCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http', '$timeout',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http, $timeout) {
            $rootScope.listOrder = [];
            $scope.theCredit = {};

            ApiQuery.post('/GET_DETAIL_USER_BL', {
                ID_USER: $rootScope.userData.id_user,
                ID_ORDER: $stateParams.idOrder
            }).then(function (res) {
                ApiQuery.post('/GET_DIVISION', {}).then(function (res1) {
                    $scope.division = res1.data.GT_DIVISION;
                    let index = $scope.division.findIndex(item => 'CS' + item.SPART === res.data.GRADE);
                    if (index !== -1) {
                        $scope.theCredit.grade = $scope.division[index].VTEXT;
                    }
                });
                $scope.theCredit.id_request = $rootScope.userData.id_user;
                $scope.theCredit.name_requester = res.data.USER.DESCRIPTION;
                $scope.theCredit.PARENTS = res.data.PARENTS;

                // $scope.theCredit.hmcl = regex_number(res.data.HMCL);
                $scope.theCredit.hmcl = Math.round(res.data.HMCL);
                let current_datetime = moment();
                $scope.today = current_datetime.format('DD/MM/YYYY');
                $scope.theCredit.zdate = $scope.today;
                $scope.end_date = function (value) {
                    let newDate = moment().add(value, 'days');
                    $scope.theCredit.zend_date = newDate.format('DD/MM/YYYY');
                }
            });

            $scope.loadCredit = function (id_parent) {
                ApiQuery.post('/GET_DETAIL_USER_BL', {
                    ID_USER: id_parent,
                    ID_ORDER: $stateParams.idOrder
                }).then(function (res) {
                    ApiQuery.post('/GET_DIVISION', {}).then(function (res1) {
                        $scope.division = res1.data.GT_DIVISION;
                        let index = $scope.division.findIndex(item => 'CS' + item.SPART === res.data.GRADE);
                        if (index !== -1) {
                            $scope.theCredit.grade = $scope.division[index].VTEXT;
                        }
                    });
                    $scope.theCredit.hmcl = Math.round(res.data.HMCL);
                    let current_datetime = moment();
                    $scope.today = current_datetime.format('DD/MM/YYYY');
                    $scope.theCredit.zdate = $scope.today;
                    $scope.end_date = function (value) {
                        let newDate = moment().add(value, 'days');
                        $scope.theCredit.zend_date = newDate.format('DD/MM/YYYY');
                    }
                });
            };

            ApiQuery.post("/GET_DETAIL_ORDER", {ID_ORDER: $stateParams.idOrder}).then(function (res) {
                $scope.theOrder = res.data.RESPONSE;
                $scope.theCredit.id_order = res.data.RESPONSE.ID_ORDER;
                $scope.theCredit.id_parent = res.data.RESPONSE.ID_U;
                $scope.loadCredit($scope.theCredit.id_parent);
                $scope.theCredit.stbl = res.data.RESPONSE.STBL;
                $scope.theCredit.zprice = res.data.RESPONSE.ZPRICE;
                $scope.theCredit.stbl = res.data.RESPONSE.STBL;
                res.data.RESPONSE.ITEMS.forEach(function (value) {
                    // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                    // val.itemText += value.NAME
                });

                ApiQuery.post('/GET_DETAIL_USER', {ID_USER: $scope.theOrder.ID_USER}).then(function (res1) {
                    ApiQuery.post('/GET_DETAIL_CUSTOMER', {KUNNR: res1.data.USER.KUNNR}).then(function (res) {
                        res.data.CUSTOMER.CZREDIT.forEach(function (value) {
                            if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                if (index !== -1) {
                                    $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                    $scope.theOrder.credit_value = value.VALUE;
                                }
                            }
                        });
                        res.data.CUSTOMER.ZCREDIT_CUS.forEach(function (value) {
                            if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                if (index !== -1) {
                                    $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                    $scope.theOrder.credit_value_cus = value.Z_AMOUNT_L;
                                }
                            }
                        })
                    });
                });

                // ApiQuery.post('/GET_MARA', {
                //     ID_USER: $rootScope.userData.id_user,
                //     division: res.data.RESPONSE.DIVISION
                // }).then(function (res) {
                //     $scope.maras = res.data.MARAS;
                //
                // });
            });
            ApiQuery.post("/credit/", {id_user: $rootScope.userData.id_user}).then(function (res) {
                res.data.RES.forEach(function (val) {
                    if (val.ITEMS.length !== 0) {
                        val.itemText = "";
                        val.ITEMS.forEach(function (value) {
                            // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                            val.itemText += value.NAME
                        });
                    }
                    $rootScope.listOrder.push(val);

                });
            });
            $scope.approve = function (id_order) {
                ApiQuery.post("/get_order", {
                    ID_USER: $rootScope.userData.id_user,
                    ID_ORDER: id_order
                }).then(function (res) {
                    $state.reload();
                })
            };
            $scope.id_order = "";
            $scope.reason = "";
            $scope.rejectReason = function (id_order) {
                $scope.id_order = id_order;
                // $('#myModal2').modal('show');
            };
            $scope.reject = function (reason) {
                $('#myModal2').modal('hide');
                if (reason === '') {
                    bootbox.alert({
                        message: "Chưa có lý do từ chối đơn hàng!!!",
                        callback: function () {
                        }
                    })
                } else {
                    $scope.rejectReason = "Lý do từ chối: " + reason;
                    ApiQuery.post("/REJECT_ORDER", {
                        ID_USER: $rootScope.userData.id_user,
                        ID_ORDER: $scope.id_order,
                        REJECT_REASON: $scope.rejectReason
                    }).then(function (res) {
                        if (res.data.RETURN.TYPE === 'S') {
                            bootbox.alert({
                                message: "Đơn hàng bị từ chối!!!",
                                callback: function () {
                                    $state.reload();
                                    $('#myModal2').modal('hide');
                                }
                            })

                        }
                    });
                }
            };

            $scope.save = function (value) {
                document.getElementById("credit_create").disabled = true;
                $scope.theCredit.id_approve = $scope.theCredit.id_parent;
                switch (value) {
                    case '1':
                        ApiQuery.post('/CREATE_CREDIT', {
                            theCredit: $scope.theCredit,
                            zstatus: value
                        }).then(function (res) {
                            $state.go('CREATECREDIT.list')
                        });
                        break;
                    case '2':
                        ApiQuery.post('/CREATE_CREDIT', {
                            theCredit: $scope.theCredit,
                            zstatus: value
                        }).then(function (res) {
                            $state.go('CREATECREDIT.list')
                        });
                        break;
                    case '':
                        ApiQuery.post('/CREATE_CREDIT', {theCredit: $scope.theCredit}).then(function (res) {
                            $state.go('CREATECREDIT.list')
                        });
                        break;
                }

            }

        }]);
