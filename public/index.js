

const BUTTON = document.querySelector("#buttonPOST");
const BUTTONSHRUG = document.querySelector("#buttonPostShrug");

// console.log(BUTTON.value);


/*
async function postData(url = ``, data = {}) {
	
	let fetchResponse = await fetch(url, {
		method: "POST",
		body: JSON.stringify(data),
		headers: new Headers({
			"Content-type": "application/json"
		})	
	});

	fetchResponse.json();
	
	return fetchResponse;
}
*/


BUTTON.addEventListener("click", e => {
	e.preventDefault();

	let data = {
		success: true,
		message: "new data, alright",
		channel: "bashduude",
		command: "shrug"
	};
	

	// postData("http://localhost:3000/webhooks", data)
	// .then(data => console.log(data))
	// .catch(error => console.error(error));

	fetch("http://localhost:3000/webhooks", {
		method: "POST",
		body: JSON.stringify(data),
		headers: new Headers({
			"Content-type": "application/json"
		})
	})
	.then(res => res.json())
	.then(data => console.log(data))
	.catch(error => console.error(error));


});


BUTTONSHRUG.addEventListener("click", e => {
	e.preventDefault();

	let data = {
		success: true,
		message: "shrug data, alright"
	};
	

	// postData("http://localhost:3000/webhooks", data)
	// .then(data => console.log(data))
	// .catch(error => console.error(error));

	fetch("http://localhost:3000/shrug", {
		method: "POST",
		body: JSON.stringify(data),
		headers: new Headers({
			"Content-type": "application/json"
		})
	})
	.then(res => res.json())
	.then(data => console.log(data))
	.catch(error => console.error(error));


});