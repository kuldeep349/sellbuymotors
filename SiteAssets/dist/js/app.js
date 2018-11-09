var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
    $routeProvider
            .when("/", {
                templateUrl: "pages/index.html"
            })
            .when("/search-car", {
                templateUrl: "pages/search_car.html"
            })
            .when("/green", {
                templateUrl: "green.htm"
            })
            .when("/blue", {
                templateUrl: "blue.htm"
            });
});