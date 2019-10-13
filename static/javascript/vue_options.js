var select_purpose = new Vue({
	el: '#purpose',
	data: {
		selected: 'what',
		options: [
		{ text: 'What', value: 'what' },
		{ text: 'How', value: 'how' },
		{ text: 'Why', value: 'why' }
		]
	}
})

var select_language = new Vue({
	el: '#language',
	data: {
		selected: 'eng',
		options: [
		{ text: 'Italiano', value: 'ita' },
		{ text: 'Inglese', value: 'eng' },
		{ text: 'Tedesco', value: 'deu' },
		{ text: 'Francese', value: 'fra' },
		{ text: 'Spagnolo', value: 'esp' }
		]
	}
})

var select_content = new Vue({
	el: '#content',
	data: {
		selected: 'none',
		options: [
		{ text: 'Nessuna', value: 'none' },
		{ text: 'Natura', value: 'nat' },
		{ text: 'Arte', value: 'art' },
		{ text: 'Storia', value: 'his' },
		{ text: 'Folklore', value: 'flk' },
		{ text: 'Cultura moderna', value: 'mod' },
		{ text: 'Religione', value: 'rel' },
		{ text: 'Cucina e drink', value: 'cui' },
		{ text: 'Sport', value: 'spo' },
		{ text: 'Musica', value: 'mus' },
		{ text: 'Film', value: 'mov' },
		{ text: 'Moda', value: 'fas' },
		{ text: 'Shopping', value: 'shp' },
		{ text: 'Tecnologia', value: 'tec' },
		{ text: 'Cultura pop e gossip', value: 'pop' },
		{ text: 'Esperienze personali', value: 'prs' },
		{ text: 'Altro', value: 'oth' }
		]
	}
})

var select_audience = new Vue({
	el: '#audience',
	data: {
		selected: 'gen',
		options: [
		{ text: 'Pubblico generale', value: 'gen' },
		{ text: 'Pre-scuola', value: 'pre' },
		{ text: 'Scuola primaria', value: 'elm' },
		{ text: 'Scuola media', value: 'mid' },
		{ text: 'Specialisti del settore', value: 'scl' }
		]
	}
})

var select_detail = new Vue({
	el: '#detailLevel',
	data: {
		selected: '1',
		options: [
		{ text: 'undefined', value: 'undefined' },
		{ text: '1', value: '1' },
		{ text: '2', value: '2' },
		{ text: '3', value: '3' },
		{ text: '4', value: '4' },
		{ text: '5', value: '5' }
		]
	}
})


var select_plalist = new Vue({
	el: '#playlist',
	data: {
		selected: '1',
		options: [
		{ text: '1', value: '1' },
		{ text: '2', value: '2' },
		{ text: '3', value: '3' },
		{ text: '4', value: '4' },
		{ text: '5', value: '5' }
		]
	}
})

/*
var select_day = new Vue({
	el: '#day',
	data: {
		selected: 'Monday',
		options: [
		{ text: 'Monday', value: 'mon' },
		{ text: 'Tuesday', value: 'tue' },
		{ text: 'Wednesday', value: 'wed' },
		{ text: 'Thursday', value: 'thu' },
		{ text: 'Friday', value: 'fri' },
		{ text: 'Saturday', value: 'sat' },
		{ text: 'Sunday', value: 'sun' }
		]
	}
})


var select_hour = new Vue({
	el: '#ora',
	data: {
		selected: 'All', 
		options: [
		{ text: 'All', value: 'all' },
		{ text: '8:00', value: '8' },
		{ text: '9:00', value: '9' },
		{ text: '10:00', value: '10' },
		{ text: '11:00', value: '11' },
		{ text: '12:00', value: '12' },
		{ text: '13:00', value: '13' },
		{ text: '14:00', value: '14' },
		{ text: '15:00', value: '15' },
		{ text: '16:00', value: '16' },
		{ text: '17:00', value: '17' },
		{ text: '18:00', value: '18' },
		{ text: '19:00', value: '19' },
		{ text: '20:00', value: '20' }
		]
	}
})
*/