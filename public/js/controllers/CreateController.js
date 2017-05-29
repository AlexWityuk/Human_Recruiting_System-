app.controller('createController', ['$scope','$http', 'localStorageService','$location',
    function ($scope, $http, localStorageService, $location) {
    $scope.datauser = {};
    $scope.datauser.contacts = [];
    $scope.datauser.skillname = [];
    $scope.userContactTypes = localStorageService.get('userContactTypes');
    $scope.userSkillNames = localStorageService.get('userSkillNames');
    $scope.regex = /^[a-zA-Z0-9а-яА-Я]*$/;
    //$scope.modelSelectSkillNames=$scope.userSkillNames[0];
    $scope.modelForm = {
        Nameupdate: "",
        Familyupdate: "",
        contacts: [],
        skillname: []
    };
    $scope.itr_contacts = 0;
    $scope.itr_skillname = 0
    $scope.createCompetitor = function(){
        angular.element('#overlay').css('display','block');
    }
    $scope.addContact = function(){
        var type = angular.element('#select_type_contact').val();
        $scope.datauser.contacts.push(['', type,'']);
        $scope.modelForm.contacts[$scope.itr_contacts] = ['', type,''];
        $scope.itr_contacts++;
    }
    $scope.deletContact = function(index){
        if ($scope.datauser.contacts[index][0].length == 0){
            this.datauser.contacts.splice(index, 1);
            $scope.itr_contacts--;
        }
    }
    $scope.addSkill = function(){
        $scope.datauser.skillname.push(["", this.modelSelectSkillNames.skillnames,""]);
        $scope.modelForm.skillname[$scope.itr_skillname] = ["", this.modelSelectSkillNames.skillnames,""]
        $scope.itr_skillname++;
    }
    $scope.deletSkill = function(index){
        if ($scope.datauser.skillname[index][0].length === 0){
            this.datauser.skillname.splice(index, 1);
            $scope.itr_skillname--;
        }
    }
    /********Add Competitior***************/
    $scope.submitForm = function(){
        var id = $('input[name=userid]').val();
        id = parseInt(id);
        console.log($scope.modelForm);
        $http({
            method  : 'POST',
            url     : '/users',
            data:  this.modelForm,
            headers : { 'Content-Type': 'application/json' }
        })
            .success(function(data, status) {
                alert('Соискатель добавлен успешно.');
                angular.element('#overlay').css('display','none');
                //$location.path('/home.html');
                window.location.reload();
            })
            .error(function(data){
                console.log('Error: ' + data);
            });
    }
    $scope.Redirect_to_home = function(){
        angular.element('#overlay').css('display','none');
    }
}]);
