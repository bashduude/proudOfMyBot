

const BUTTON = document.getElementById("button");

// console.log(BUTTON.value);



async function postData(url = ``, data = {}) {
	
	let fetchResponse = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: new Headers({
			'Coontent-type': 'application/json'
		})		
	});

	fetchResponse.json();
	
	return fetchResponse;
}



BUTTON.addEventListener("click", e => {
	e.preventDefault();

	let data = {
		text: "i've just clicked the button OMEGA"
	};
	

	// postData("http://localhost:3000/webhooks", data)
	// .then(data => console.log(JSON.stringify(data)))
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