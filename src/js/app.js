var self = null;



function AppViewModel() {
	self = this;
	self.isAsideShow = ko.observable(true);
	self.isInit = ko.observable(true);
	self.stops = ko.observableArray([]);
	self.trips = ko.observableArray([]);
	self.tarDB = null;
	self.departStop = ko.observable('');
	self.arrivalStop = ko.observable('');
	self.stopMap = {};
	self.hasTrip = ko.computed(function(){
		return self.trips().length == 0;
	})

	self.switchAside = function(){
		self.isAsideShow(!self.isAsideShow());
		mainbodyAdapt();
	};

	self.getTrips = function(){
		self.trips([]);
		self.departStop($('#depart-stop').val());
		self.arrivalStop($('#arrival-stop').val());
		if(self.departStop() === self.arrivalStop()){
			alert('Depart stop cannot be same with arrival stop!');
			return;
		}

		var day = new Date($('#date-expect').val()).getDay();

		if(day == 6){
			self.querySunTrips();
			self.tarDB = 'sundayDB';
		}else if(day == 5){
			self.querySatTrips();
			self.tarDB = 'saturdayDB';
		}else{
			self.queryWeekTrips();
			self.tarDB = 'weekdayDB';
		}		
		self.findTrips(self.tarDB);

		mainbodyAdapt();
		self.isInit(false);
	};

	self.queryStops = function(){
		$.getJSON('/public_transportation/json_data/caltrain/stops.json')
			.done(function(response){
				//Update database
				var stopDB = TAFFY().store('stops');
				stopDB().remove();
				stopDB.insert(response);
				//Update stops in view page
				stopNames = stopDB().order('stop_name').distinct('stop_name')
					.map(function(e){
					return {stop_name: e};
				});

				stopNames.unshift({stop_name: 'Select a station'});
				self.stops(stopNames);
				self.updateStopMap();
			}).fail(function(){
				var stopDB = TAFFY().store('stops');
				stopNames = stopDB().order('stop_name').distinct('stop_name')
					.map(function(e){
					return {stop_name: e};
				});
				stopNames.unshift({stop_name: 'Select a station'});
				self.stops(stopNames);
				self.updateStopMap();
			});
	};

	self.updateStopMap = function(){
		var stopDB = TAFFY().store('stops');
		stopDB().get().forEach(function(e){
			self.stopMap[e.stop_id] = e.stop_name;
		});
	};



	self.queryWeekTrips = function(){
		$.getJSON('/public_transportation/json_data/caltrain/stop_times_weekday.json')
			.done(function(response){
				var weekdayDB = TAFFY().store('weekdayDB');
				weekdayDB().remove();
				weekdayDB.insert(response);
			});
	};

	self.querySatTrips = function(){
		$.getJSON('/public_transportation/json_data/caltrain/stop_times_saturday.json')
			.done(function(response){
				var saturdayDB = TAFFY().store('saturdayDB');
				saturdayDB().remove();
				saturdayDB.insert(response);
			});
	};

	self.querySunTrips = function(){
		$.getJSON('/public_transportation/json_data/caltrain/stop_times_sunday.json')
			.done(function(response){
				var sundayDB = TAFFY().store('sundayDB');
				sundayDB().remove();
				sundayDB.insert(response);
			});
	};

	self.findTrips = function(tarDB){
		var depart = self.departStop();
		var arrival = self.arrivalStop();
		var stopDB = TAFFY().store('stops');
		var departCodes = stopDB({stop_name:depart}).select('stop_id');
		var arrivalCodes = stopDB({stop_name:arrival}).select('stop_id');


		var tripsDB = TAFFY().store(tarDB);
		var tmpDepartDB = TAFFY(tripsDB({c: departCodes}).get());
		var tmpArrivalDB = TAFFY(tripsDB({c: arrivalCodes}).get());

		var lines = tmpDepartDB().join(tmpArrivalDB, function(l,r){
			return (l.a === r.a && l.b < r.b);
		}).order('b').select('a','b','right_b');
		
		lines.forEach(function(lineObj){
			var lineStops = tripsDB(function(){
				return (this.a === lineObj[0] &&
					this.b >= lineObj[1] &&
					this.b <= lineObj[2]);
			}).order('b').get();
			self.trips.push({
				'lineStops': lineStops,
				'departTime': lineObj[1],
				'arrivalTime': lineObj[2],
				'lineNum': lineObj[0]
			});
		});
	};


	var mainbodyAdapt = function(){
		// Modify main body's left-margin
		var	tar = $('main');
		if($('#main-container').width() > 580){
			if(self.isAsideShow()){
				tar.css({'margin-left':'300px'});
			}else{
				tar.css({'margin-left':'0'});
			}
			var asideHeight = Math.max($('#welcome').height(), tar.height());
			$('aside').css({'height':asideHeight+'px'});

		}else{
			tar.css({'margin-left':'0'});
			$('aside').css({'height': 'auto', 'min-height':'auto'});
		}
	};

	var curTime = function(){
		var tar = document.getElementById('date-expect');
		var t = new Date();

		var yyyy = t.getYear() + 1900;
        var mm = t.getMonth() + 1;
        var dd = t.getDate();
        if (mm < 10) mm = "0" + mm;
        if (dd < 10) dd = "0" + dd;

        var timeText = yyyy + '-' + mm + '-' + dd;
        tar.value = timeText;
        tar.min = timeText;
	};

	self.pageInit = function(){
		self.isAsideShow($(document).width() > 600);
		mainbodyAdapt();
		curTime();
	};

	window.addEventListener("resize", self.pageInit);
	self.queryStops();
	self.pageInit();
}

navigator.serviceWorker.register('/public_transportation/sw.js');
ko.applyBindings(new AppViewModel());
$(document).ready(self.pageInit);
