'use strict';

UiBootstrapDemo.controller('DatepickerDemoCtrl', ['$scope', function ($scope) {
    $scope.activeDate = null;
    $scope.selectedDates = [new Date().setHours(0, 0, 0, 0)];
    $scope.type = 'individual';

    $scope.identity = angular.identity;

    $scope.removeFromSelected = function (dt) {
        $scope.selectedDates.splice($scope.selectedDates.indexOf(dt), 1);
    };

    $scope.selectDate = function (date) {
        var selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        $scope.activeDate = selectedDate;
        $scope.selectedDates = [];
    };

    $scope.today = function () {
        var newDate = new Date();
        newDate.setHours(0, 0, 0, 0);
        $scope.selectDate(newDate);
    };
    $scope.today();

    $scope.clear = function () {
        if ($scope.selectedDates.length == 0) {
            return;
        }
        $scope.selectedDates = [];
        $scope.type = 'individual';
        $scope.identity = angular.identity;
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events =
        [
            {
                date: tomorrow,
                status: 'full'
            },
            {
                date: afterTomorrow,
                status: 'partially'
            }
        ];

    $scope.getDayClass = function (date, mode) {
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }

        return '';
    };
}]);