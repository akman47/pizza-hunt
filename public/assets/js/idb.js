// create variable to hold db connection
let db;

// establish connection to IndexedDB database called pizza hunt and set it to version 1
const request = indexedDB.open('pizza_hunt', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc)
request.onupgradeneeded = function(event) {
    // save a reference to the database
    const db = event.target.result;
    // create object store (table) called new pizza
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

// upon a successful
request.onsuccess = function(event) {
    // when db is successfully created with its object store from onupgrade or simply established a connection,
    // save reference to db in global variable

    db = event.target.result;

    // check if app is online
    // if yes, run uploadPizza to send all local db data to api
    if (navigator.online) {
        uploadPizza();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// function will be executed if attempt to submit new pizza with no internet connection
function saveRecord(record) {
    // open new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_pizza'], 'readwrite');
  
    // access the object store for `new_pizza`
    const pizzaObjectStore = transaction.objectStore('new_pizza');
  
    // add record to your store with add method
    pizzaObjectStore.add(record);
}

function uploadPizza() {
    // open transaction on db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    // access object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // get all records from store
    const getAll = pizzaObjectStore.getAll();
     
    // upon successful getAll async execution, event handler
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_pizza'], 'readwrite');
                    // access object store
                    const pizzaObjectStore = transaction.objectStore('new_pizza');
                    // clear all items
                    pizzaObjectStore.clear();

                    alert('All saved pizza has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

// listen for app coming back online/any network status change
window.addEventListener('online', uploadPizza);