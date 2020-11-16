class Api2 {

    constructor(uri, protocoll = "http") {
        this.url = uri;
        this.proto = protocoll;
        this.apiUri = this._apiUri();
        this.username = "";
        this.token ="";
        this.adminusers="";

    }
    login() {
        $("#maloginbtn").prop("disabled",true);
        $.ajax({
            url: this.apiUri + '/malogin',
            type: 'post',
            data: $('#maloginform').serialize(),
            success: function (data) {
                if(data.token!="null") {
                    api2.token = data.token;
                    api2.adminusers = data.msg;
                    $("#startdiv").removeClass("starter-template");
                    $("#startdiv").load("main.html");
                }
                else
                {
                    alert(data.msg);
                    $("#maloginbtn").prop("disabled",false);

                }
            }
        });
        this.username = $("#username").val();
    }
    logout() {
        $.ajax({
            url: this.apiUri + '/malogout',
            type: 'post',
            data: '{ "token": "' + api2.token + '", "username": "'+ api2.username + '" }',
            success: function (data) {
                api2.token = null;
                document.location="index.html";
            }
        });
    }
    check() {
        $("#checkbtn").prop("disabled",true);
        $.ajax({
            url: this.apiUri + '/check',
            type: 'post',
            data: $('#check').serialize(),
            success: function (data) {
                for(var i in data.result) {
                    $("#checkinfo").empty();

                    var entry = "<div class=\"row\"><div class=\"col-sm\">Platznummer</div><div class=\"col-sm\">Standort</div><div class=\"col-sm\">Von</div><div class=\"col-sm\">Bis</div></div>";

                    $("#checkinfo").append(entry);

                    for(var i in data.result) {

                        entry = "<div class=\"row look\"><div class=\"col-sm\">"+data.result[i].workspaceId+"</div><div class=\"col-sm\">"+data.result[i].institution+
                            "</div><div class=\"col-sm\">"+data.result[i].start.slice(0,16)+"</div><div class=\"col-sm\">"+data.result[i].end.slice(0, 16)+"</div>"+
                            "</div>";

                        $("#checkinfo").append(entry);
                    }
                }

                $("#checkbtn").prop("disabled",false);
            }
        });
    }
    setClosure() {

        var valid = true;

        var d = $("#data_scd").val();

        if(d.includes("-")) {
            alert("Fehler bei der Datumsangabe!");
            valid = false;
            return;
        }

        var vw = /^[0-3][0-9][/.][0-3][0-9][/.](?:[0-9][0-9])?[0-9][0-9]$/

        d.split(",").forEach(function(e) {
            if(!vw.test(e)) {
                alert("Fehler in der Datumsangabe!")
                valid = false;
                return;
            }
        });

        if(valid) {
            $.ajax({
                url: this.apiUri + '/modifyClosure',
                type: 'post',
                data: $('#closuretimes').serialize(),
                success: function (data) {
                    alert(data);
                }
            });
        }
    }
    getLocation(){
        $.ajax({
            url: this.apiUri + '/institutions',
            type: 'get',
            success: function (data) {
                data.split("#").forEach(function (e) {
                    $("#institutions").append("<option value=\"" + e + "\">" + e + "</option>");
                });
            }
        });
    }
    selectLocation(){
        $.ajax({
            url: this.apiUri + '/timeslots?institution='+$("#institutions").val(),
            type: 'get',
            success: function(data) {

                $("#data").val(JSON.stringify(data,null,10));

                var output = "";

                data.interval.forEach(function(e){
                    if(e.day=="2") output+= "Montag: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                    if(e.day=="3") output+= "Dienstag: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                    if(e.day=="4") output+= "Mittwoch: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                    if(e.day=="5") output+= "Donnerstag: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                    if(e.day=="6") output+= "Freitag: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                    if(e.day=="7") output+= "Samstag: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                    if(e.day=="1") output+= "Sonntag: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                    if(e.day==null) output+= e.from+" Uhr -"+e.until+" Uhr<br>";
                });

                //$("#open").html(output);

                $("#cb_sunday").prop("checked", false);
                $("#cb_monday").prop("checked", false);
                $("#cb_tuesday").prop("checked", false);
                $("#cb_wednesday").prop("checked", false);
                $("#cb_thursday").prop("checked", false);
                $("#cb_friday").prop("checked", false);
                $("#cb_saturday").prop("checked", false);

                var recclosredays = data.recclosuredays;
                if(recclosredays!=null)
                recclosredays.split(",").forEach(function (e){
                    if(e==1) $("#cb_sunday").prop("checked", true);
                    if(e==2) $("#cb_monday").prop("checked", true);
                    if(e==3) $("#cb_tuesday").prop("checked", true);
                    if(e==4) $("#cb_wednesday").prop("checked", true);
                    if(e==5) $("#cb_thursday").prop("checked", true);
                    if(e==6) $("#cb_friday").prop("checked", true);
                    if(e==7) $("#cb_saturday").prop("checked", true);
                });

                var specclosuredays = data.specclosuredays;
                $("#data_scd").val(specclosuredays);
                //$("#from_time").attr({"min": data.from, "max": data.until, "value": data.from});
                //$("#until_time").attr({"min": data.from, "max": data.until, "value": data.from});
                //$("#open").text(data.from+" Uhr -"+data.until+" Uhr");
            }
        });
    }
    getPlan() {
        $("#bookingplanok").prop("disabled", true);
        $.ajax({
            url: this.apiUri + '/plan',
            type: 'post',
            data: $('#bookingplan').serialize(),
            success: function (data) {

                $("#plandiv").empty();

                var entry = "<div class=\"row\"><div class=\"col-sm\">Platznummer</div><div class=\"col-sm\">Bibliotheksnummer</div><div class=\"col-sm\">Von</div><div class=\"col-sm\">Bis</div><div class=\"col-sm\"></div></div>";

                $("#plandiv").append(entry);

                for(var i in data.result) {

                    entry = "<div class=\"row look\"><div class=\"col-sm\">"+data.result[i].workspaceId+"</div><div class=\"col-sm\">"+data.result[i].readernumber+
                        "</div><div class=\"col-sm\">"+data.result[i].start.slice(0,16)+"</div><div class=\"col-sm\">"+data.result[i].end.slice(0, 16)+"</div>"+
                        "<div class=\"col-sm\"><button id=\"remove-"+data.result[i].bookingCode+"\" onclick=\"javascript:api2.remove('"+data.result[i].readernumber+"','"+data.result[i].bookingCode+"')\">Stornieren</button></div>"+
                        "</div>";

                    $("#plandiv").append(entry);
                }
                $("#bookingplanok").prop("disabled", false);
            }


        });
    }
    remove(readernumber, bookingCode) {

        var really = window.confirm("Buchung der Bibliotheksnummer "+readernumber+" wirklich stornieren?");

        if(!really) {
            return;
        }

        $("#remove-"+bookingCode).prop("disabled", true);
        $.ajax({
            url: this.apiUri + '/mastorno',
            type: 'post',
            data: '{ "token": "' + api2.token + '", "readernumber": "'+ readernumber + '", "bookingCode": "' +bookingCode+'" }',
            success: function (data) {
                alert(data.message);
            }
        });
    }
    loadexistingrules(){
        $.ajax({
           url: this.apiUri + '/rulesets',
           type: 'post',
           data: 'optiontype=1&username='+api2.username+'&token='+api2.token,
            success: function (data) {

               data.SpecialRulesets.forEach(function (e){
                   $("#existingRules").append("<b>Name: </b>"+e+" <a href=\"javascript:api2.editexistingrule('"+e+"')\">Bearbeiten</a> <a href=\"javascript:api2.removerule('"+e+"')\">Löschen</a><br>");
               });


            }
        });
    }
    removerule(rulename) {
        alert(rulename);
        $.ajax({
            url: this.apiUri + '/rulesets',
            type: 'post',
            data: 'optiontype=4&rulesetname=' + rulename+'&username='+api2.username+'&token='+api2.token,
            success: function (data) {
                alert("OK");
            }
        });
        $("#existingRules").html("");
        this.loadexistingrules();
    }
    followrequest(){
        $("#token").val(api2.token);
        $.ajax({
            url: this.apiUri+'/followrequest',
            type: 'post',
            data: $('#following').serialize(),
            success: function (data) {
                $("#report").html(data);
            }
        });
    }
    editexistingrule(rulename){
        $("#username").val(api2.username);
        $("#token").val(api2.token);
        $.ajax({
            url: this.apiUri + '/rulesets',
            type: 'post',
            data: 'optiontype=3&rulesetname=' + rulename+'&username='+api2.username+'&token='+api2.token,
            success: function (data) {

                //alert("Wird geladen...");
                $("#newRuleset").load("newruleset.html", function()
                {

                    $("#rulesetname").val(data.name);

                    setTimeout(function(){
                        $("#institutions").val(data.institution);

                        var t = "";
                        if(data.type=="Bibliotheksschließung")
                            t="1";
                        if(data.type=="Platzblockade")
                            t="2";
                        if(data.type=="Bereichsschließung")
                            t="3";
                        if(data.type=="Öffnungszeitenänderung")
                            t="4";

                        $("#rulesettype").val(t);

                        var d = "";
                        if(data.day=="null")
                            d="0";
                        else d=data.day;
                        $("#day").val(d);



                        }, 1000);

                    $("#institutions").val(data.institution);
                    $("#starttime").prop("value",data.starttime);
                    $("#startdate").prop("value",data.startdate);
                    $("#endtime").prop("value",data.endtime);
                    $("#enddate").prop("value",data.enddate);

                    $("#closing").prop("value",data.closing);
                    $("#opening").prop("value",data.opening);

                    $("#infotext").prop("value",data.infotext);
                    $("#area").prop("value",data.area);
                    $("#workspaceids").prop("value",data.workspaceids);

                    $("#rulebtn").text("Update");
                    $("#isnewrule").prop("value","0");
                });
            }
        });
    }
    unhide(){
      var allowed = false;
      api2.adminusers.split(",").forEach(function (e){
         if(api2.username==e) allowed = true;
      });

      if(allowed) {
          $("#infectionfollowingbtn").css("visibility","visible");
          $("#closuretimesbtn").css("visibility","visible");
          $("#specialrulesbtn").css("visibility","visible");
      }

    }
    createnewrule(){
        $("#username").val(api2.username);
        $("#token").val(api2.token);
        $.ajax({
            url: this.apiUri + '/rulesets',
            type: 'post',
            data: $('#newruleset').serialize(),
            success: function (data) {
                alert("OK");
            }
        });
    }
    _apiUri() {
        return this.proto + '://' + this.url
    }
    precontrol() {
        var selectedItem = $("#rulesettype").val();
        if(selectedItem==1) //Bibliotheksschließung
        {
            clean();
            $("#rulesetname").css("background-color","#FFB700");
            $("#institutions").css("background-color","#FFB700");
            $("#startdate").css("background-color","#FFB700");
            $("#starttime").css("background-color","#FFB700");
            $("#enddate").css("background-color","#FFB700");
            $("#endtime").css("background-color","#FFB700");
            $("#infotext").css("background-color","#FFB700");
        }
        if(selectedItem==2) //Platzblockade
        {
            clean();
            $("#rulesetname").css("background-color","#FFB700");
            $("#institutions").css("background-color","#FFB700");
            $("#startdate").css("background-color","#FFB700");
            $("#starttime").css("background-color","#FFB700");
            $("#enddate").css("background-color","#FFB700");
            $("#endtime").css("background-color","#FFB700");
            $("#workspaceids").css("background-color","#FFB700");

        }
        if(selectedItem==3) //Bereichsschließung
        {
            clean();
            $("#rulesetname").css("background-color","#FFB700");
            $("#institutions").css("background-color","#FFB700");
            $("#startdate").css("background-color","#FFB700");
            $("#starttime").css("background-color","#FFB700");
            $("#enddate").css("background-color","#FFB700");
            $("#endtime").css("background-color","#FFB700");
            $("#workspaceids").css("background-color","#FFB700");
            $("#area").css("background-color","#FFB700");
        }
        if(selectedItem==4) //Öffnungszeitenänderung
        {
            clean();
            $("#rulesetname").css("background-color","#FFB700");
            $("#institutions").css("background-color","#FFB700");
            $("#startdate").css("background-color","#FFB700");
            $("#starttime").css("background-color","#FFB700");
            $("#enddate").css("background-color","#FFB700");
            $("#endtime").css("background-color","#FFB700");
            $("#infotext").css("background-color","#FFB700");
            $("#opening").css("background-color","#FFB700");
            $("#day").css("background-color","#FFB700");
            $("#closing").css("background-color","#FFB700");
        }
    }
}

// let api2 = new Api2 ("seats.ub.uni-leipzig.de/api/booking");
 let api2 = new Api2 ("localhost:12105/booking");
//let api2 = new Api2 ("172.18.85.108:12105/booking");

function clean() {
    $("#rulesetname").css("background-color","#FFFFFF");
    $("#institutions").css("background-color","#FFFFFF");
    $("#startdate").css("background-color","#FFFFFF");
    $("#starttime").css("background-color","#FFFFFF");
    $("#enddate").css("background-color","#FFFFFF");
    $("#endtime").css("background-color","#FFFFFF");
    $("#infotext").css("background-color","#FFFFFF");
    $("#opening").css("background-color","#FFFFFF");
    $("#day").css("background-color","#FFFFFF");
    $("#closing").css("background-color","#FFFFFF");
    $("#workspaceids").css("background-color","#FFFFFF");
    $("#area").css("background-color","#FFFFFF");
}

function checkreservation() {
    $("#startdiv").load("check.html");
}

function selectbookingplan() {
    $("#startdiv").load("bookingplan.html");
}

function selectclosure() {
    $("#startdiv").load("closure.html");
}

function mabooking() {
    $("#startdiv").load("mabooking.html");
}

function backtomain() {
    $("#startdiv").load("main.html");
}

function specialruleset() {
    $("#startdiv").load("rulesets.html");
}

function newruleset() {
    $("#newruleset_btn").prop("disabled", true);
    $("#newRuleset").load("newruleset.html");
}

function follow() {
    $("#startdiv").load("follow.html");
}
