/**
 * TODO:
 * fix the fact that everything goes down when dropdown appears
 */

//Items of HTML
let initial_search = document.getElementById("initial_search");
let ok_button = document.getElementById("ok_button");
let back_button = document.getElementById("back_button");
let final_search;
let dropdown_menu = document.getElementById("dropdown_menu");
let bus_list = document.getElementById("id_bus_list");
let result_bus_list = document.getElementById("result");
let route_selection = document.getElementById("id_route_selection");

// Event listeners
window.addEventListener('load', init, false);
window.onbeforeunload = function () {
    loggingjs.logEvent(null, 'BeforeUnload', {
        eventName: 'closingWindow',
        info: {'time': (new Date).getTime()}
    });

    return "Did you memorize the bus number?";
};
ok_button.addEventListener('click', ok);
back_button.addEventListener('click', back);

// Variables to be stored
let selected_start;
let selected_end;
let selected_bus;
let data;
let system;

/* Initial function called when page is loaded */
function init(){
    initial_search.value = "";
    selected_start = null;
    document.getElementById("route").style.display = "none";

    if (document.getElementById("final_search") == null) { // System A
        console.log("System A");
        loadJSONA();
        system = "A";
    } else {
        console.log("System B");
        final_search = document.getElementById("final_search");
        final_search.value = "";
        selected_end = null;
        loadJSONB();
        system = "B";
    }
    
    console.log("sending initial informations");
    loggingjs.logEvent
}

/**
 * load database
 */
function load(filename) { // ONLY WITH A HTTP SERVER
    let xhr = new XMLHttpRequest();		
	xhr.open("GET", filename, false);
    let result;
	xhr.onload = function(){ result = JSON.parse(this.responseText); };
    xhr.send();
	return result;
}

function loadJQ(filename) { // ONLY WITH A HTTP SERVER
    $(function() {
        $.getJSON(filename, function(json) {
            return json;
        });
    });
}

function loadJSONA() {
    //Loading the json
    data = load('./systemA.json');

    //modify accordingly
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            let node = document.createElement("li"); 
            let listed = dropdown_menu.appendChild(node);
            listed.setAttribute("class", "bus_stop");
            listed.setAttribute("id", key);
            listed.setAttribute("onclick", "select(event)");
            listed.innerHTML = key;
        }
    }
}

function loadJSONB() {
    //Loading the json
    data = load('./systemB.json');

    //modify accordingly
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            // add to both bus stops lists
            let node = document.createElement("li"); 
            let listed = dropdown_menu.appendChild(node);
            listed.setAttribute("class", "bus_stop");
            listed.setAttribute("id", key);
            listed.setAttribute("onclick", "select(event)");
            listed.innerHTML = key;

            node = document.createElement("li");
            let end_listed = document.getElementById("end_dropdown").appendChild(node);
            end_listed.setAttribute("class", "end_bus_stop");
            end_listed.setAttribute("id", "e" + key);
            end_listed.setAttribute("onclick", "select(event)");
            end_listed.innerHTML = key;
        }
    }
}

/**
 * Event listeners' functions
 */
function display(id){
    let dropdown;
    let search;
    let under;

    if (id == "initial_search") {
        // no more selected bus stops
        selected_start = null;
        dropdown = document.getElementById("dropdown_menu");
        search = initial_search.value;
        under = initial_search;
    } else if (id == "final_search") { //------------------TODO: bug only the one selected before appears
        // no more selected bus stops    
        selected_end = null;
        dropdown = document.getElementById("end_dropdown");
        search = final_search.value;
        under = final_search;
    }

    if (search == ""){
        dropdown.style.display = "unset";
        let list = dropdown.getElementsByTagName('li');
        for (i = 0; i < list.length; i++) {
            list[i].style.display = "";
        }
    } else {
        dropdown.style.display = "unset";

        // filter elements in the list ------ fix uppercase letters
        let n = search.length;
        let list = dropdown.getElementsByTagName('li');
        for (i = 0; i < list.length; i++) {
            if (list[i].innerHTML.substring(0, n) == search) {
                list[i].style.display = "";
            } else {
                list[i].style.display = "none";
            }
        }
    }

    var rect = under.getBoundingClientRect();
    dropdown.style.position = "absolute"; // TODO ------- problem when resizing
    dropdown.style.left = rect.left;
    dropdown.style.top = rect.bottom;
    dropdown.style.width = rect.right - rect.left;
    dropdown.style.zIndex = 1;
}

function select(e){
    selected = e.target.innerHTML;

    if (e.target.className == "bus_stop") {
        selected_start = selected;
        initial_search.value = selected_start;
        document.getElementById("dropdown_menu").style.display = "none";
    } else if (e.target.className == "end_bus_stop") {
        selected_end = selected;
        document.getElementById("final_search").value = selected_end;
        document.getElementById("end_dropdown").style.display = "none";
    }
}

function ok(){
    // if no bus stop selected throw error (display toast)
    if (selected_start == null || (system == "B" && selected_end == null)) {
        console.log("null");
        // display box
    } else {
        document.getElementById("stop").style.display = "none";
        document.getElementById("route").style.display = "";
        document.getElementsByClassName("stop_selection")[0].style.display = "none";
        document.getElementsByClassName("route_selection")[0].style.display = "flex";

        if (system == "A") {
            let bus_data = data[selected_start];

            for (var key in bus_data) {
                if (bus_data.hasOwnProperty(key)) {
                    let node = document.createElement("a"); 
                    let current_bus = bus_list.appendChild(node);
                    current_bus.setAttribute("class", "bus");
                    current_bus.setAttribute("id", key);
                    current_bus.setAttribute("onclick", "bus(this.id)");
                    
                    let second_node = document.createElement("h4"); 
                    let bus_name = current_bus.appendChild(second_node);
                    bus_name.innerHTML = bus_data[key]["name"];

                    let third_node = document.createElement("p"); 
                    let bus_time = current_bus.appendChild(third_node);
                    bus_time.innerHTML = bus_data[key]["time"] + " min";
                }
            }

            // display first bus
            bus("bus1");

        } else if (system == "B") {
            let bus_data = data[selected_start][selected_end];

            if (typeof bus_data == 'undefined') {
                // display error message
                console.log("no connection");
                let node = document.createElement("p"); 
                let no_result = result_bus_list.appendChild(node);
                no_result.innerHTML = "There is no connection between those two bus stops";
            } else {
                // display automatic results
                for (var key in bus_data) {
                    if (bus_data.hasOwnProperty(key)) {
                        let node = document.createElement("div"); 
                        let one_result = result_bus_list.appendChild(node);
                        one_result.setAttribute("class", "result_list");
                        one_result.setAttribute("id", key);
                        
                        let second_node = document.createElement("div"); 
                        let bus_name = one_result.appendChild(second_node);
                        bus_name.setAttribute("class", "bus_name");
                        bus_name.innerHTML = bus_data[key]["name"];
    
                        let third_node = document.createElement("div"); 
                        let info = one_result.appendChild(third_node);
                        info.setAttribute("class", "info");

                        let fourth_node = document.createElement("p"); 
                        let bus_time = info.appendChild(fourth_node);
                        bus_time.innerHTML = bus_data[key]["time"];

                        /*let fifth_node = document.createElement("p"); 
                        let nb_stops = info.appendChild(fifth_node);
                        nb_stops.innerHTML = "Length: " + bus_data[key]["length"] + " stops";*/
                    }
                }
            }
        }
    }

}

function back() {
    document.getElementById("stop").style.display = "";
    document.getElementById("route").style.display = "none";
    document.getElementsByClassName("stop_selection")[0].style.display = "flex";
    document.getElementsByClassName("route_selection")[0].style.display = "none";

    // clear variables
    initial_search.value = "";
    selected_end = null;
    selected_start = null;

    if (system == "A") {
        while (bus_list.firstChild) {
            bus_list.removeChild(bus_list.firstChild);
        }
    } else if (system == "B") {
        final_search.value = "";
        while (result_bus_list.firstChild) {
            result_bus_list.removeChild(result_bus_list.firstChild);
        }
    }
}

function return_qualtrics() {
    console.log("closing window and sending informations");
    loggingjs.logEvent(null, 'close', {
        eventName: 'closingWindow',
        info: {'time and all': 0}
    });

    window.open('','_parent','');
    window.close();
}

function bus(id) {
    // unselect all
    let buses = document.getElementsByClassName("bus");
    for (i=0; i<buses.length; i++) {
        buses[i].style.backgroundColor = "lightgray";
    }

    // change color background of the selected
    document.getElementById(id).style.backgroundColor="gray";
    // change map
    document.getElementById("map").setAttribute("src", "./" + data[selected_start][id]["image"]);
}