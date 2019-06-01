var app = angular.module("myApp", ["ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "/tpl/home.html"
    })
    .when("/search/:woeid", {
        templateUrl : "/tpl/search.html"
    })
    .when("/weather/:woeid", {
        templateUrl : "/tpl/detail.html"
    })

});

app.controller("WeatherController", function($scope){
    $scope.cities = [   {"city":"Istanbul"}, 
                        {"city": "Berlin"}, 
                        {"city": "London"},
                        {"city": "Helsinki"}, 
                        {"city": "Dublin"},
                        {"city":"Vancouver"}];
   
});

app.component('weather', {
    bindings: { city: '<'},  
    template : 
        '<div class="col-md-12">' +
            '<div class="col-md-1">' +
                '<img class="weather_img" src="/img/{{item.status}}" >' + 
            '</div>' +
            '<div class="col-md-2">' + 
                '<h3>{{item.city}}</h3>' +
            '</div>' +
            '<div class="col-md-2">' + 
                '<h3>{{item.temperature }}</h3>' +
            '</div>' +
            '<div class="col-md-2">' + 
                '<h3>{{item.maximum}}</h3>' +
            '</div>' +
            '<div class="col-md-2">' + 
                '<h3>{{item.minimum}}</h3>' +
            '</div>' +
        '</div>',    
    controller: function WeatherListController($element, $http, $scope) {
        $ctrl = this;
        let expression = $element.attr("city");

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd = '0'+dd
        } 

        if(mm<10) {
            mm = '0'+mm
        } 

        today = yyyy + '-' + mm + '-' + dd;

        $scope.$parent.$watch(expression, function(value){        
             $http({
                method: 'GET',
                url: '/weather.php?command=search&keyword='+value
            }).then(function successCallback(response) {
                var city = response.data[0]['title'];
                var woeid = response.data[0]['woeid'];
                
                $http({
                    method: 'GET',
                    url: '/weather.php?command=location&woeid='+woeid
                }).then(function successCallback(response) {
                   var weathers = response.data.consolidated_weather;
                   for(var i = 0; i < weathers.length; i++){
                        if(weathers[i].applicable_date == today){
                            var item = {
                                "city": response.data.title,
                                "temperature": Math.round(weathers[i].the_temp * 1000) / 1000,
                                "maximum": Math.round(weathers[i].max_temp * 1000) / 1000,
                                "minimum": Math.round(weathers[i].min_temp * 1000) / 1000,
                                "status": weathers[i].weather_state_name + ".jpg"
                            };
                            $scope.item = item;
                        }
                   }
                }, function errorCallback(response) {
                });



            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        });       
    }
   
});


app.controller("WeatherSearchController", ['$scope','$routeParams', function($scope,$routeParams){
    var keyword = $routeParams.woeid;
    $scope.city = keyword;
}]);
app.controller("WeatherDetailController", ['$http', '$scope','$routeParams', function($http,$scope,$routeParams){
    var keyword = $routeParams.woeid;
    $scope.weathers = [];
    $http({
        method: 'GET',
        url: '/weather.php?command=location&woeid='+keyword
    }).then(function successCallback(response) {
       $scope.City = response.data.title
        var weather_list = response.data.consolidated_weather;
        for(var i = 0;  i < weather_list.length; i++){
            var item = {
                "city": response.data.title,
                "date": weather_list[i].applicable_date,
                "temperature": Math.round(weather_list[i].the_temp * 1000) / 1000,
                "maximum": Math.round(weather_list[i].max_temp * 1000) / 1000,
                "minimum": Math.round(weather_list[i].min_temp * 1000) / 1000,
                "status": weather_list[i].weather_state_name + ".jpg"
            };
            $scope.weathers.push(item);
        }
        
    }, function errorCallback(response) {
    });
    //$scope.city = keyword;
}]);