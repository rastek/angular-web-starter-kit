'use strict';

App.controller('AppCtrl', [
    '$scope', '$location', '$resource', '$rootScope', function ($scope, $location, $resource, $rootScope) {
        // Uses the url to determine if the selected
        // menu item should have the class active.
        $scope.$location = $location;
        $scope.$watch('$location.path()', function (path) {
            $scope.activeNavId = path || '/';
            return $scope.activeNavId;
        });
        /* getClass compares the current url with the id.
         * If the current url starts with the id it returns 'active'
         * otherwise it will return '' an empty string. E.g.
         *
         *   # current url = '/products/1'
         *   getClass('/products') # returns 'active'
         *   getClass('/orders') # returns ''
         */
        $scope.getClass = function (id) {
            if ($scope.activeNavId.substring(0, id.length) === id) {
                return 'active';
            } else {
                return '';
            }
        };

        $scope.closeMenu = function closeMenu() {
            $('body').removeClass('open');
            $('.app-bar').removeClass('open');
            $('.navdrawer-container').removeClass('open');
        };

        $scope.toggleMenu = function toggleMenu() {
            $('body').toggleClass('open');
            $('.app-bar').toggleClass('open');
            $('.navdrawer-container').toggleClass('open');
        }
        ;
    }
]);