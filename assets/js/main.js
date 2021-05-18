/***
 Metronic AngularJS App Main Script
 ***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router",
    "ui.bootstrap",
    "oc.lazyLoad",
    "ngSanitize",
    "ngResource",
    "ngTable",
    "base64",
    "flow",
    "angular-jwt",
    // "ui.select",
    "ngFileUpload",
    'angularUtils.directives.dirPagination',
    'selectize'
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);

//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config(['$controllerProvider', function ($controllerProvider) {
    // this option might be handy for migrating old apps, but please don't use it
    // in new ones!
    $controllerProvider.allowGlobals();
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
 *********************************************/

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function ($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: true, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        assetsPath: './assets',
        globalPath: './assets/global',
        layoutPath: './assets/layouts/layout4'
    };

    $rootScope.settings = settings;

    return settings;
}]);

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.$on('$viewContentLoaded', function () {

        //App.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
    });
}]);

/***
 Layout Partials.
 By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
 initialization can be disabled and Layout.init() should be called on page load complete as explained above.
 ***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope', '$rootScope', '$state', function ($scope, $rootScope, $state) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initHeader(); // init header

    });
    $scope.notificatons = function (index) {
        $rootScope.noti.splice(index, 1);
        $state.go('Order.list')
    };
    $scope.logMeOut = function () {
        $rootScope.userData = {};
        window.localStorage.removeItem('__the_token');
        window.localStorage.removeItem('__menus');
        $state.go('loginPage');
    }
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$state', '$scope', function ($state, $scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initSidebar($state); // init sidebar
    });
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('PageHeadController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Quick Sidebar */
MetronicApp.controller('QuickSidebarController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        setTimeout(function () {
            QuickSidebar.init(); // init quick sidebar        
        }, 2000)
    });
}]);

/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initFooter(); // init footer
    });
}]);

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", "TokenProvider", "authManager", "jwtHelper", 'ApiQuery',
    function ($rootScope, settings, $state, TokenProvider, authManager, jwtHelper, ApiQuery) {
        $rootScope.$state = $state; // state to be accessed from view
        $rootScope.$settings = settings; // state to be accessed from view

        // authManager.checkAuthOnRefresh();
        // authManager.redirectWhenUnauthenticated();
        $rootScope.$on('tokenHasExpired', function () {
            // $state.go('loginPage');
        });

        $rootScope.menu_group = [];
        $rootScope.action = [];
        $rootScope.role = [];
        if (window.localStorage.getItem('__menus') != null) {
            $rootScope.menu_group = JSON.parse(window.localStorage.getItem('__menus'));
            $rootScope.menu_group.forEach(function (value) {
                value.ACTION.forEach(function (val) {
                    $rootScope.action.push(val);
                    $rootScope.role.push(val.FUNCTIONMODULE);
                });
            });
        }

        if (window.localStorage.getItem('__the_token') != null) {
            $rootScope.noti = [];
            $rootScope.userData = JSON.parse(window.localStorage.getItem('__the_token'));
            $rootScope.header = decodeURIComponent($rootScope.userData.name);


            // ApiQuery.post('/NOTIFICATION', {ID_USER: $rootScope.userData.id_user}).then(function (res) {
            //
            //     console.log(res.data.GT_NOTI);
            //     res.data.GT_NOTI.forEach(function (val) {
            //         $rootScope.noti.push(val);
            //     });
            //     console.log($rootScope.noti.length);
            // });
            // if ($rootScope.userData.us_type === 'P') {
            //     ApiQuery.post('/NOTIFICATION', {ID_USER: $rootScope.userData.id_peer}).then(function (res) {
            //         res.data.GT_NOTI.forEach(function (val) {
            //             $rootScope.noti.push(val);
            //         });
            //     });
            // };
        }

        $rootScope.hasPermission = function ($permission) {
            if (typeof $rootScope.userData == "undefined" || typeof $rootScope.userData.permissions == "undefined") return false;
            return $rootScope.userData.permissions.indexOf($permission) > -1;
        }

    }]);

MetronicApp.factory('ApiQuery', function ($http, ApiUrl) {
    // var config = {
    //     withCredentials: true
    // };
    return {
        get: function (url, data) {
            var param = jQuery.param(data);
            return $http.get(ApiUrl + url + (param.length > 0 ? '?' + param : ''));
        },
        post: function (url, data) {
            return $http.post(ApiUrl + url, data, {withCredentials: true, crossDomain: true});
        },
        put: function (url, data) {
            return $http.put(ApiUrl + url, data);
        },
        request: function (type, url, data) {
            return $http({
                method: type.toUpperCase(),
                url: ApiUrl + url,
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Accept': '*/*',
                    'Access-Control-Allow-Origin': '*'
                    // 'Authorization': 'Basic ZnB0LXZpbmhuZDp2aW5obmQ='
                },
                data: {
                    data: data
                }
            });

            // return $http({
            //     method: type.toUpperCase(),
            //     url: ApiUrl + url,
            //     headers: {
            //         'Content-Type': undefined
            //     },
            //     data: {
            //         data: data
            //     }
            // });
        },
        delete: function (url, data) {
            return $http.delete(ApiUrl + url, data);
        }
    }
});

MetronicApp.config(['$httpProvider', 'jwtOptionsProvider', function ($httpProvider, jwtOptionsProvider) {
    jwtOptionsProvider.config({
        tokenGetter: function () {
            var $theToken = window.localStorage.getItem('__the_token');
            if ($theToken != null) {
                return $theToken;
            } else {
                window.localStorage.removeItem('__the_token');
                return null;
            }
        },
        unauthenticatedRedirector: ['$state', function ($state) {
            $state.go('loginPage');
        }],
        whiteListedDomains: [
            // 'localhost',
            // '127.0.0.1',
            // '192.168.1.5',
            // '192.168.0.102',
            // '207.148.69.28',
            // 'tctadmin.adhemera.com',
            'erp-dev.habeco.vn:8421'
        ],
        // config: [{withCredentials:true}]
    });
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    $httpProvider.interceptors.push('jwtInterceptor');
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
}]);

MetronicApp.factory('TokenProvider', function ($http, $rootScope, ApiUrl) {
    return {
        grant: function (e, p) {
            $rootScope.isRequestingKC = true;
            return $http({
                method: 'POST',
                url: ApiUrl.replace('/v1', '') + '/users/token.json',
                skipAuthorization: true,
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: {
                    grant_type: 'password',
                    // username: u,
                    email: e,
                    password: p
                }
            });
        },
        logout: function () {
            var $theToken = window.localStorage.getItem('__the_token');
            $theToken = JSON.parse($theToken);
            return $http({
                method: 'DELETE',
                url: ApiUrl.replace('/v1', '') + '/users/token.json',
                skipAuthorization: true,
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: $.param(Object.assign({
                    client_id: RestSSO.resource,
                    client_secret: RestSSO.credentials.secret
                }, $theToken))
            });
        }
    }
});

MetronicApp.filter('isEmpty', function () {
    return function (object) {
        if (object == null || object == undefined) {
            return false;
        }
        return Object.keys(object).length > 0
    }
});
// MetronicApp.factory('socket', function ($rootScope) {
//     var socket = io.connect('http://localhost:3000');
//     return {
//         on: function (eventName, callback) {
//             socket.on(eventName, function () {
//                 var args = arguments;
//                 $rootScope.$apply(function () {
//                     callback.apply(socket, args);
//                 });
//             });
//         },
//         emit: function (eventName, data, callback) {
//             socket.emit(eventName, data, function () {
//                 var args = arguments;
//                 $rootScope.$apply(function () {
//                     if (callback) {
//                         callback.apply(socket, args);
//                     }
//                 });
//             })
//         }
//     };
// })
