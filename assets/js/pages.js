/* Setup Routing For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/login");
    // $urlRouterProvider.otherwise("/dashboard.html");

    $stateProvider

    // Dashboard
        .state('dashboard', {
            url: "/dashboard.html",
            templateUrl: "./assets/views/dashboard.html",
            data: {
                pageTitle: 'Trang chủ'
            },
            requireLogin: true,
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            './assets/js/controllers/DashboardController.js'
                        ]
                    });
                }]
            }
        })
        .state('loginPage', {
            url: '/login',
            data: {
                pageTitle: 'Đăng nhập',
                isLogin: true
            },
            requireLogin: false,
            templateUrl: './assets/views/login.html',
            controller: 'LoginCtrl',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            './assets/pages/css/login-3.min.css'
                        ]
                    });
                }]
            }
        })

        //customer
        .state('Customer', {
            url: '/customer',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('Customer.list', {
            url: '/',
            data: {
                pageTitle: 'Danh sách đại lý',
            },
            templateUrl: './assets/views/Customer/list.html',
            controller: 'CustomerCtr',
        }).state('Customer.detail', {
            url: '/customer-detail/{kunnr}',
            data: {
                pageTitle: 'Chi tiết công nợ đại lý',
            },
            templateUrl: './assets/views/Customer/detail.html',
            controller: 'CustomerDetailCtrl',
        })


    //user
        .state('UPLOAD', {
            url: '/upload',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('UPLOAD.list', {
            url: '/',
            data: {
                pageTitle: 'Danh sách Upload',
            },
            templateUrl: './assets/views/Upload/list.html',
            controller: 'UploadListCtrl',
        })

        //user
        .state('CREATEUSER', {
            url: '/user',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('CREATEUSER.list', {
            url: '/create-user',
            templateUrl: './assets/views/User/create.html',
            data: {
                pageTitle: 'Tạo mới tài khoản',
            },
            controller: 'UserCreateCtrl'
        })

        .state('CHANGEPASSWORD', {
            url: '/user',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('CHANGEPASSWORD.list', {
            url: '/changePassword/{userID}',
            templateUrl: './assets/views/User/changePassword.html',
            data: {
                pageTitle: 'Thay đổi mật khẩu',
            },
            controller: 'ChangePasswordCtr'
        })
        .state('User', {
            url: '/user',
            abstract: true,
            template: '<div data-ui-view></div>'
        })

        .state('User.list', {
            url: '/',
            data: {
                pageTitle: 'Danh sách tài khoản',
            },
            templateUrl: './assets/views/User/list.html',
            controller: 'UserListCtr',
        })
        .state('User.create', {
            url: '/create-user',
            templateUrl: './assets/views/User/create.html',
            data: {
                pageTitle: 'Tạo mới tài khoản',
            },
            controller: 'UserCreateCtrl'
        })

        .state('User.edit', {
            url: '/edit-user/{userID}/{action}',
            templateUrl: './assets/views/User/edit.html',
            data: {
                pageTitle: 'Chỉnh sửa tài khoản',
            },
            controller: 'UserEditCtrl'
        })

        .state('User.detail', {
            url: '/detail-user/{userID}',
            templateUrl: './assets/views/User/detail.html',
            data: {
                pageTitle: 'Chi tiết tài khoản',
            },
            controller: 'UserDetailCtrl'
        })
        .state('User.changePassword', {
            url: '/changePassword/{userID}',
            templateUrl: './assets/views/User/changePassword.html',
            data: {
                pageTitle: 'Thay đổi mật khẩu',
            },
            controller: 'ChangePasswordCtr'
        })

        //user group
        .state('AUTHENTICATION', {
            url: '/user-group',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('AUTHENTICATION.list', {
            url: '/create-user-group',
            templateUrl: './assets/views/UserGroup/create.html',
            data: {
                pageTitle: 'Tạo mới nhóm tài khoản',
            },
            controller: 'UserGroupCreateCtrl'
        })
        .state('UserGroup', {
            url: '/user-group',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('UserGroup.list', {
            url: '/',
            data: {
                pageTitle: 'Quản lý nhóm tài khoản',
            },
            templateUrl: './assets/views/UserGroup/list.html',
            controller: 'UserGroupListCtr',
        })
        .state('UserGroup.create', {
            url: '/create-user-group',
            templateUrl: './assets/views/UserGroup/create.html',
            data: {
                pageTitle: 'Tạo mới nhóm tài khoản',
            },
            controller: 'UserGroupCreateCtrl'
        })
        .state('UserGroup.edit', {
            url: '/edit-user-group/{usgrId}',
            templateUrl: './assets/views/UserGroup/edit.html',
            data: {
                pageTitle: 'Thay đổi nhóm tài khoản',
            },
            controller: 'UserGroupUpdateCtrl'
        })
        .state('UserGroup.detail', {
            url: '/detail-user-group/{usgrId}',
            templateUrl: './assets/views/UserGroup/detail.html',
            data: {
                pageTitle: 'Chi tiết nhóm tài khoản',
            },
            controller: 'UserGroupDetailCtrl'
        })

        //material
        .state('Material', {
            url: '/material',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('Material.list', {
            url: '/',
            data: {
                pageTitle: 'Quản lý mặt hàng',
            },
            templateUrl: './assets/views/Material/list.html',
            controller: 'MaterialCtr',
        })

        //order

        .state('APPROVE', {
            url: '/approve-order',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('APPROVE.list', {
            url: '/',
            data: {
                pageTitle: 'Danh sách đơn hàng',
            },
            templateUrl: './assets/views/Order/approveOrder.html',
            controller: 'ApproveOrderCtr',
        })

        .state('CREATEORDER', {
            url: '/order',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('CREATEORDER.list', {
            url: '/list-template/{temId}',
            data: {
                pageTitle: 'Tạo mới đơn đặt hàng',
            },
            templateUrl: './assets/views/Order/listTemplate.html',
            controller: 'ListTemplateOrderCtr',
        })
        .state('Order', {
            url: '/order',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('Order.list', {
            url: '/',
            data: {
                pageTitle: 'Danh sách đơn đặt hàng',
            },
            templateUrl: './assets/views/Order/inProcessingOrder.html',
            controller: 'InProcessingOrderCtr',
        })

        .state('Order.copy_list', {
            url: '/copy_order',
            data: {
                pageTitle: 'Sao chép đơn đặt hàng',
            },
            templateUrl: './assets/views/Order/copyOrder.html',
            controller: 'CopyOrderCtr',
        })

        .state('Order.delivery', {
            url: '/delivery',
            data: {
                pageTitle: 'Lịch giao hàng',
            },
            templateUrl: './assets/views/Order/delivery.html',
            controller: 'DeliveryOrderCtr',
        })

        .state('Order.list_template', {
            url: '/list-template/{temId}',
            data: {
                pageTitle: 'Danh sách đơn hàng mẫu',
            },
            templateUrl: './assets/views/Order/listTemplate.html',
            controller: 'ListTemplateOrderCtr',
        })

        .state('Order.create', {
            url: '/create/{temID}/{excel}',
            data: {
                pageTitle: 'Tạo mới đơn đặt hàng',
            },
            templateUrl: './assets/views/Order/createOrder.html',
            controller: 'CreateOrderCtr',
        })
        .state('Order.createByExcel', {
            url: '/create-by-excel/{temID}/{excel}',
            data: {
                pageTitle: 'Tạo mới đơn đặt hàng',
            },
            templateUrl: './assets/views/Order/createOrderByExcel.html',
            controller: 'CreateOrderByExcelCtr',
        })
        .state('Order.createByExcelPK', {
            url: '/create-by-excel-pk/{temID}/{excel}',
            data: {
                pageTitle: 'Tạo mới đơn đặt hàng',
            },
            templateUrl: './assets/views/Order/createPKByExcel.html',
            controller: 'CreateOrderByExcelPKCtr',
        })
        .state('Order.detail', {
            url: '/detail/{idOrder}',
            data: {
                pageTitle: 'Chi tiết đơn hàng',
            },
            templateUrl: './assets/views/Order/detailOrder.html',
            controller: 'DetailOrderCtr',
        })
        .state('Order.confirm', {
            url: '/confirm-order/{idOrder}',
            data: {
                pageTitle: 'Xem lại thông tin đặt hàng',
            },
            params:{
                idOrder: null
            },
            templateUrl: './assets/views/Order/confirmOrder.html',
            controller: 'ConfirmOrderCtr',
        })

        //order return
        .state('CREATEORDERRETURN', {
            url: '/order-return',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('CREATEORDERRETURN.list', {
            url: '/create-order-return',
            data: {
                pageTitle: 'Tạo yêu cầu trả lại hàng',
            },
            templateUrl: './assets/views/OrderReturn/list.html',
            controller: 'OrderReturnListCtr',
        })

        //order return
        .state('OrderReturn', {
            url: '/order-return',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('OrderReturn.listReturn', {

            url: '/create-order-return',
            data: {
                pageTitle: 'Danh sách yêu cầu trả lại hàng',
            },
            templateUrl: './assets/views/OrderReturn/list.html',
            controller: 'OrderReturnListCtr',
        })
        .state('OrderReturn.list', {
            url: '/',
            data: {
                pageTitle: 'Danh sách yêu cầu trả lại hàng',
            },
            templateUrl: './assets/views/OrderReturn/listOrderReturn.html',
            controller: 'OrderReturnCtr',

        })

        .state('OrderReturn.list_template', {
            url: '/list-template/{temId}',
            data: {
                pageTitle: 'Danh sách đơn hàng mẫu',
            },
            templateUrl: './assets/views/OrderReturn/listTemplate.html',
            controller: 'ListTemplateOrderReturnCtr',
        })

        .state('OrderReturn.create', {
            url: '/create',
            data: {
                pageTitle: 'Tạo yêu cầu trả lại hàng',
            },
            templateUrl: './assets/views/OrderReturn/createOrder.html',
            controller: 'CreateOrderReturnCtr',
        })
        .state('OrderReturn.detail', {
            url: '/detail/{idOrderReturn}',
            data: {
                pageTitle: 'Chi tiết đơn hàng trả lại',
            },
            templateUrl: './assets/views/OrderReturn/detailOrder.html',
            controller: 'DetailOrderReturnCtr',
        })

        //payment term
        .state('PaymentTerm', {
            url: '/payment-term',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('PaymentTerm.list', {
            url: '/',
            data: {
                pageTitle: 'Hình thức thanh toán',
            },
            templateUrl: './assets/views/PaymentTerm/list.html',
            controller: 'ListPaymentTermCtr',
        })

        //Order type
        .state('OrderType', {
            url: '/order-type',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('OrderType.list', {
            url: '/',
            data: {
                pageTitle: 'Danh sách loại đơn hàng',
            },
            templateUrl: './assets/views/OrderType/list.html',
            controller: 'OrderTypeListCtr',
        })
        .state('CREATETEMPLATE', {
            url: '/create-template',
            abstract: true,
            template: '<div data-ui-view></div>'
        })

        .state('CREATETEMPLATE.list', {
            url: '/create-config-template',
            templateUrl: './assets/views/ConfigTemplate/create.html',
            data: {
                pageTitle: 'Tạo mới mẫu đơn đặt hàng',
            },
            controller: 'ConfigTemplateCreateCtrl'
        })
        //config template
        .state('ConfigTemplate', {
            url: '/config-template',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('ConfigTemplate.list', {
            url: '/',
            data: {
                pageTitle: 'Quản lý mẫu đơn đặt hàng',
            },
            templateUrl: './assets/views/ConfigTemplate/list.html',
            controller: 'ConfigTemplateCtr',
        })

        .state('ConfigTemplate.edit', {
            url: '/edit-config-template/{temId}',
            templateUrl: './assets/views/ConfigTemplate/edit.html',
            data: {
                pageTitle: 'Chỉnh sửa đơn hàng mẫu',
            },
            controller: 'ConfigTemplateEditCtrl'
        })

        .state('ConfigTemplate.create', {
            url: '/create-config-template',
            templateUrl: './assets/views/ConfigTemplate/create.html',
            data: {
                pageTitle: 'Tạo mới mẫu đơn đặt hàng',
            },
            controller: 'ConfigTemplateCreateCtrl'
        })

        // bảng giá
        .state('Price', {
            url: '/bang-gia',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('Price.list', {
            url: '/',
            data: {
                pageTitle: 'Bảng giá',
            },
            templateUrl: './assets/views/Price/list.html',
            controller: 'PriceCtrl',
        })

        // sale out
        .state('SaleOut', {
            url: '/saleout',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('SaleOut.list', {
            url: '/',
            data: {
                pageTitle: 'Sale Out',
            },
            templateUrl: './assets/views/SaleOut/list.html',
            controller: 'SaleOutCtrl',
        })


        .state('Report', {
            url: '/report',
            abstract: true,
            template: '<div data-ui-view></div>'
        })

        .state('CREDIT', {
            url: '/credit',
            abstract: true,
            template: '<div data-ui-view></div>'
        })

        .state('CREDIT.list', {
            url: '/',
            data: {
                pageTitle: 'Danh sách yêu cầu bảo lãnh',
            },
            templateUrl: './assets/views/Credit/approveList.html',
            controller: 'CreditApproveListCtrl',
        })
        .state('CREDIT.detail', {
            url: '/credit-detail/{idCredit}',
            data: {
                pageTitle: 'Chi tiết yêu cầu bảo lãnh',
            },
            templateUrl: './assets/views/Credit/detail.html',
            controller: 'CreditApproveDetailCtrl',
        })
        .state('CREATECREDIT', {
            url: '/create-credit',
            abstract: true,
            template: '<div data-ui-view></div>'
        })

        .state('CREATECREDIT.list', {
            url: '/',
            data: {
                pageTitle: 'Danh sách đơn hàng cần bảo lãnh',
            },
            templateUrl: './assets/views/Credit/list.html',
            controller: 'CreditListCtrl',
        })
        .state('CREATECREDIT.create', {
            url: '/create/{idOrder}',
            data: {
                pageTitle: 'Bảo lãnh cho đơn đặt hàng',
            },
            templateUrl: './assets/views/Credit/create.html',
            controller: 'CreateCreditCtrl',
        })
        .state('CREATECREDIT.approveList', {
            url: '/approve-credit/',
            data: {
                pageTitle: 'Phê duyệt Yêu cầu bảo lãnh',
            },
            templateUrl: './assets/views/Credit/approveList.html',
            controller: 'CreditApproveListCtrl',
        })


        .state('Report.ke24', {
            url: '/report-ke24',
            data: {
                pageTitle: 'KE24',
            },
            templateUrl: './assets/views/Report/ke24.html',
            controller: 'ReportKE24Ctr',
        })
        .state('Report.ke25', {
            url: '/report-ke25',
            data: {
                pageTitle: 'KE25',
            },
            templateUrl: './assets/views/Report/ke25.html',
            controller: 'ReportKE25Ctr',
        })
        .state('Report.ke26', {
            url: '/report-ke26',
            data: {
                pageTitle: 'KE26',
            },
            templateUrl: './assets/views/Report/ke26.html',
            controller: 'ReportKE26Ctr',
        })


        // danh sach don hang ngoai tieu chuan
        .state('Ntc', {
            url: '/ntc',
            abstract: true,
            requireLogin: false,
            template: '<div data-ui-view></div>'
        })

        .state('Ntc.list', {
            url: '/',
            data: {
                pageTitle: 'Danh sách đơn hàng ngoài tiêu chuẩn',
            },
            templateUrl: './assets/views/Ntc/list.html',
            controller: 'NtcCtrl',
        })


        .state('Guarantee', {
            url: '/guarantee',
            abstract: true,
            requireLogin: false,
            template: '<div data-ui-view></div>'
        })

        .state('Guarantee.list', {
            url: '/',
            data: {
                pageTitle: 'Danh sách yêu cầu bảo hành',
            },
            templateUrl: './assets/views/Guarantee/list.html',
            controller: 'GuaranteeCtrl',
        })
        .state('DSDH', {
            url: '/bc-dsdh',
            abstract: true,
            requireLogin: false,
            template: '<div data-ui-view></div>'
        })
        .state('DSDH.list', {
            url: '/',
            data: {
                pageTitle: 'Báo cáo danh sách đơn hàng',
            },
            templateUrl: './assets/views/Report/dsdh.html',
            controller: 'DSDHCtrl',
        })

        .state('Guarantee.searchInformation', {
            url: '/search-information',
            data: {
                pageTitle: 'Thông tin bảo hành sản phẩm',
            },
            templateUrl: './assets/views/Guarantee/searchInformation.html',
            controller: 'GuaranteeSearchInformationCtrl',
        })

        .state('Guarantee.listInformation', {
            url: '/list-information',
            params: {
                searchGuarantee: null,
            },
            data: {
                pageTitle: 'Thông tin bảo hành sản phẩm',
            },
            templateUrl: './assets/views/Guarantee/listInformation.html',
            controller: 'GuaranteeInformationsCtrl',
        })

        .state('Guarantee.create', {
            url: '/create-request',
            params: {
                guaranteeInfo: null,
            },
            data: {
                pageTitle: 'Tạo yêu cầu bảo hành',
            },
            templateUrl: './assets/views/Guarantee/createGuarantee.html',
            controller: 'CreateGuaranteeCtrl',
        })

        //inbox
        .state('Inbox', {
            url: '/inbox',
            abstract: true,
            template: '<div data-ui-view></div>'
        })
        .state('Inbox.list', {
            url: '/',
            data: {
                pageTitle: 'Quản lý hòm thư',
            },
            templateUrl: './assets/views/Inbox/list.html',
            controller: 'InboxListCtrl',
        })
}]);
jQuery(function () {
    $("#datepicker").datepicker();
});