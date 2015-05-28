(function () {
    var app = angular.module('PixSlap', ['ngAnimate', 'ui.bootstrap']);

    app.controller('TabController', function () {
        this.tab = 1;
        this.isSet = function (currentTab) {
            return this.tab === currentTab;
        };
        this.setTab = function (currentTab) {
            this.tab = currentTab;
        };
    });

    app.controller('CheckboxController', function () {
        this.isChecked = 0;

        this.setChecked = function ($event) {
            $event.preventDefault();
            if (this.isChecked == 1) {
                this.removeChecked();
                console.log('remove checekd');
            }
            else {
                console.log('set checekd');
                this.isChecked = 1;
            }
        };

        this.removeChecked = function () {
            this.isChecked = 0;
        };
    });

    app.directive('histogram', function () {
        return {
            restrict: 'E',
            controller: function ($scope) {
                this.caption = $scope.caption;
                this.max = $scope.max;
                this.columns = [];
                var arr = $scope.values.split(',');
                for (var i = 0; i < arr.length; i++) {
                    var col = arr[i].split('#');
                    this.columns[i] = {
                        pos: i * 22,
                        value: col[0] * 100 / this.max,
                        color: '#' + col[1]
                    }
                }
            },
            controllerAs: 'hist',
            scope: {
                caption: '@caption',
                max: '@max',
                values: '@values'
            },
            templateUrl: '/pixslap/scripts/app/templates/histogram.html'
        };
    });

    app.directive('histogramLegend', function () {
        return {
            restrict: 'E',
            controller: function ($scope) {
                this.caption = $scope.caption;
                this.color = $scope.color;
            },
            controllerAs: 'legend',
            scope: {
                caption: '@caption',
                color: '@color'
            },
            templateUrl: '/pixslap/scripts/app/templates/histogram-legend.html'
        };
    });

    app.directive('circleDiagram', function () {
        return {
            restrict: 'E',
            controller: function ($scope, $interval) {
                var $this = this;
                $this.percent = $scope.percent;
                $this.color = $scope.color;
                $this.value = $scope.value;
                $this.caption = $scope.caption;
                $this.canvasId = $scope.machine;
                $this.fillfront = $scope.fillfront;
                $this.fillback = $scope.fillback;

                /**
                 * Build Circle Diagram
                 * @param percent int
                 * @constructor
                 */
                $scope.getSnapshot = function (percent) {
                    this.Percent = percent;
                    this.Radius = null;
                    this.Grad = 360 * percent / 100;
                    this.Points = {};
                    this.FillFront = '#000';
                    this.FillBack = '#fff';

                    this.getAB = function () {
                        this.Points.a = [this.Radius, 0].join();
                        this.Points.b = [this.Radius, this.Radius].join();
                        return this;
                    };

                    /**
                     * Set Fill Color
                     * @param fillfront hex color with '#'
                     * @param fillback hex color with '#'
                     * @returns {$this.Snapshot}
                     */
                    this.setFill = function (fillfront, fillback) {
                        this.FillFront = fillfront;
                        this.FillBack = fillback;
                        return this;
                    };

                    /**
                     * Set Radius
                     * @param Radius int
                     * @returns {$this.Snapshot}
                     */
                    this.setRadius = function (Radius) {
                        this.Radius = Radius;
                        return this
                    };

                    this.getBuild = function () {
                        if (this.Percent > 0 && this.Percent < 25) {
                            this.getI();
                        }

                        if (this.Percent > 25 && this.Percent < 50) {
                            this.getII();
                        }

                        if (this.Percent > 50 && this.Percent < 75) {
                            this.getIII();
                        }

                        if (this.Percent > 75 && this.Percent < 100) {
                            this.getIV();
                        }

                        return this;
                    };

                    this.getI = function () {
                        var x = this.Radius + this.Radius * Math.sin(this.Grad * Math.PI / 180);
                        var y = this.Radius - this.Radius * Math.cos(this.Grad * Math.PI / 180);

                        this.Points.c = [x, y].join();
                        this.Points.d = [100, 0].join();

                        return this;
                    };

                    this.getII = function () {
                        var x = this.Radius + this.Radius * Math.cos((this.Grad - 90) * Math.PI / 180);
                        var y = this.Radius + this.Radius * Math.sin((this.Grad - 90) * Math.PI / 180);

                        this.Points.c = [x, y].join();
                        this.Points.d = [100, 100].join() + ' ' + [100, 0].join();

                        return this;
                    };

                    this.getIII = function () {
                        var x = this.Radius - this.Radius * Math.sin((this.Grad - 180) * Math.PI / 180);
                        var y = this.Radius + this.Radius * Math.cos((this.Grad - 180) * Math.PI / 180);

                        this.Points.c = [x, y].join();
                        this.Points.d = [0, 100].join() + ' ' + [0, 0].join();

                        this.inverseFillColor();
                        return this;
                    };

                    this.getIV = function () {
                        var x = this.Radius - this.Radius * Math.cos((this.Grad - 270) * Math.PI / 180);
                        var y = this.Radius - this.Radius * Math.sin((this.Grad - 270) * Math.PI / 180);

                        this.Points.c = [x, y].join();
                        this.Points.d = [0, 0].join();

                        this.Points.a1 = [0, 0].join();
                        this.Points.b1 = [0, 100].join();
                        this.Points.c1 = [100, 100].join();
                        this.Points.d1 = [100, 0].join();

                        this.inverseFillColor();
                        return this;
                    };

                    this.inverseFillColor = function () {
                        var front = this.FillFront;
                        this.FillFront = this.FillBack;
                        this.FillBack = front;

                        return this;
                    };
                };

                $this.snapshot = (new $scope.getSnapshot($this.percent))
                    .setRadius(50)
                    .setFill($this.fillfront, $this.fillback)
                    .getAB()
                    .getBuild();
            },
            controllerAs: 'circle',
            scope: {
                percent: '@',
                color: '@',
                value: '@',
                caption: '@',
                machine: '@',
                fillfront: '@',
                fillback: '@'
            },
            templateUrl: '/pixslap/scripts/app/templates/circle-diagram.html'
        };
    });

    app.directive('weekHistogram', function(){
        return {
            restrict: 'E',
            controller: function($scope){
                console.log($scope.title, 'title');
                console.log($scope.max, 'max');
                console.log(JSON.parse($scope.data), 'data');
            },
            controllerAs:'week',
            scope: {
                title:'@',
                max:'@',
                data:'@'
            },
            templateUrl: '/pixslap/scripts/app/templates/week-histogram.html'
        };
    });
})
();
