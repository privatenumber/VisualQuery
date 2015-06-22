VisualQuery("div#anydiv", {
	strict: true,	//Limit inputs where parameters are defined,

	placeholder: "Look up countries...",


	//	Supported Input Types:
	//		text, email, number, url
	schema: {
		"Country": {
			operators: ["is", "is not"],
			values: ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas, The","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo, Democratic Republic of the","Congo, Republic of the","Costa Rica","Cote d'Ivoire","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Korea, North","Korea, South","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia, Federated States of","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar (Burma)","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Western Sahara","Yemen","Zambia","Zimbabwe"]
		},
		
		"Continent": {
			operators: ["is", "is not"],
			values: ["Asia", "Africa", "North America", "South America", "Antarctica", "Europe", "Australia"]
		},

		"Population": {
			operators: ["is", "is greater than", "is less than"],
			type: "number",
			valueAttrs: {
				"placeholder": "In millions",
				"min": 1,
				"max": 3
			}
		},

		"Area": {
			operators: ["is", "is greater than", "is less than"],
			type: "number",
			valueAttrs: {
				"placeholder": "In sq mi",
				"min": 100,
				"max": 1000000
			}
		},

		"Time": {
			operators: ["is", "is after", "is before"],
			type: "time",
			valueAttrs: {
				"placeholder": "00:00 AM"
			}
		}
	},
	defaultQuery: [
		{
			name: "Population",
			operator: "is greater than",
			value: "2"
		},
		{
			name: "Area",
			operator: "is",
			value: "2300"
		},
		{
			name: "Continent",
			operator: "is",
			value: "Europe"
		}
	]
})
.on("result", function(searched){

	console.log( searched );

	var operators = {
		"is": "=",
		"is not": "!=",
		"is greater than": ">",
		"is less than": "<",
		"": ""
	};

	$("#sql div").text(
		"SELECT * FROM `table` WHERE " + (searched.map(function(e){
			return "`" + e.name + "` " + operators[e.operator] + " '" + e.value + "'";
		}).join(" AND ") || "...") + ";"
	);


	var operators = {
		"is": "eq",
		"is not": "ne",
		"is greater than": "gt",
		"is less than": "lt",
		"": ""
	};
	var mongodb = {};
	searched.forEach(function(e){
		(mongodb[e.name] = {})["$"+operators[e.operator]] = e.value;
	});

	$("#mongodb div").text("db.collection.find("+JSON.stringify(mongodb)+");");
});