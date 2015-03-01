(function() {
	var MAX_VARIETY = 10;
	var MAX_QUANTITY = 20;

	var snacks = {};
	var varietyCount = 0;

    /**
     * Gets the template of one snack item. This includes the name, quantity, and buttons in one
     * list element.
     *
     * @param name
     * @param quantity
     * @returns {string}
     */
	var getSnackItemTemplate = function(name, quantity) {
		var removeBtn = '<button class="removeSnack btn btn-link" data-toggle="tooltip" data-placement="bottom" title="Click to remove this snack" name="'+ name + '">X</button>';
		var refillBtn = '<button class="refillSnack btn btn-info" name="'+name + '">Refill</button>';
		var buttons = '<span class="snackBtns pull-right">' + refillBtn + removeBtn + '</span>';

		var nameLabel = '<label class="nameLabel" name="' + name + '"]>' + name + '</label>';
		var quantityLabel = '<label class="quantityLabel" name="'+name+'"]>' + quantity + '</label>';
		var template = '<li name="' + name +'">' + nameLabel  + quantityLabel + buttons + '</li>';

		return template;
	};

    /**
     * Gets the refill form template. This includes the refill input and buttons necessary to process a refill.
     *
     * @param name
     * @returns {string}
     */
	var getRefillFormTemplate = function(name) {
		var refillToMaxBtn = '<button class="maxRefill btn btn-link" name="' + name + '">Refill to max</button>';
		var submitBtn = '<button class="refillSubmit btn btn-primary" name="' + name + '">Refill</button>';
		var refillBtns = '<span class="refillBtns">'+submitBtn + refillToMaxBtn + '</span>';
		var refillInput = '<input type="number" min="0" name="'+name+'">'

		var template = '<div class="refill" name="' + name +
		'"> Refill Amount: ' + refillInput + refillBtns + '</div>';

		return template;
	};

    /**
     * Gets the message that is displayed when a snack is about to be dispensed.
     * This includes the message as well as the accept and reject buttons.
     *
     * @param name
     * @param isOutOfStock
     * @returns {string}
     */
	var getChosenSnackTemplate = function(name, isOutOfStock) {
		var disabled = isOutOfStock ? ' disabled' : '';
		var acceptBtn = '<button class="btn btn-success" id="acceptSnack" name="'+name+'"'+disabled+'>Yes Please!</button>';
		var rejectBtn = '<button class="btn btn-danger" id="rejectSnack" name="'+name+'"> Nah</button>';

		var buttons = '<div class="actionBtns">'+acceptBtn+rejectBtn+'</div>'
		var OOSMessage = isOutOfStock ? " But it's out of stock :(" : '';
		var message = 'Woohoo! Your lucky snack is <b>' + name + '</b>!' + OOSMessage;

		var template = '<h4 id="chosenSnack">' + message + '</h4>' + buttons;
		return template;
	};

    /**
     * Updates the message with a new message and level.
     * Pass an empty message to remove the message.
     *
     * Levels indicates the message level, supported levels are:
     * - success: green message
     * - info: blue message
     * - warning: yellow message
     * - danger: red message
     *
     * @param newMessage
     * @param level
     */
	var updateMessage = function(newMessage, level) {
		$('#message').empty();
		$('#message').attr('class', '');

		if (_.isEmpty(newMessage)) {
			$('#message').addClass('hide');
			return;
		}

		var bgClass;

		switch(level) {
			case 'success':
				bgClass = 'bg-success';
				break;
			case 'warning':
			 	bgClass = 'bg-warning';
			 	break;
			case 'danger':
				bgClass = 'bg-danger';
				break;
			case 'info':
			default:
				bgClass = 'bg-info'
		}

		$('#message').append(newMessage);
		$('#message').addClass(bgClass);
	};

    /**
     * This is the event handler for adding a snack.
     *
     * @param evt
     */
	var addSnack = function(evt) {
		updateMessage();
		if (MAX_VARIETY === varietyCount) {
			var msg = 'Max variety reached! This machine cannot hold more than ' + MAX_VARIETY + ' kinds of snacks!'
			updateMessage(msg, 'danger');
			return;
		}
		$('#inputForm').removeClass('hide');
	};

    /**
     * This displays a new snack into the DOM.
     * @param name
     */
	var showNewSnack = function(name) {
		var newSnackTemplate = getSnackItemTemplate(name, snacks[name].quantity);
		$('#snackList').append(newSnackTemplate);
		
		$('.removeSnack[name="'+name+'"]').tooltip();
		$('.removeSnack[name="'+name+'"]').on('click', removeSnack);
		$('.refillSnack[name="'+name+'"]').on('click', refillSnack);
	};

    /**
     * Clears the input form for adding a new snack.
     */
    var clearNewSnackForm = function() {
        updateMessage();
        $('#inputForm').addClass('hide');
        $('#newSnackName').val('');
        $('#newSnackQuantity').val('');
    };

    /**
     * This is the event handler when a new snack is submitted.
     *
     * @param evt
     */
	var submitNewSnack = function(evt) {
        updateMessage();

		var newSnackName = _.escape($('#newSnackName').val().trim());
		var quantityVal = $('#newSnackQuantity').val();
		var newQuantity = parseInt(quantityVal, 10);
		var snackAttributes = {};

		if (!newSnackName) {
			updateMessage('Give your new snack a name!', 'warning');
			return;
		}

		if (_.isNaN(newQuantity)) {
			updateMessage('You must use a positive integer as your quantity!', 'warning');
			return;
		}

		if (newQuantity < 0 || newQuantity > MAX_QUANTITY) {
			updateMessage('The quantity must be a positive integer less than' + MAX_QUANTITY + '!', 'warning');
			return;
		}

		if (snacks[newSnackName]) {
			updateMessage('You already have this snack! Try adding a different snack.', 'danger');
			return;
		}
		snackAttributes.quantity = newQuantity;
		addSnackToList(newSnackName, snackAttributes);
        clearNewSnackForm();
		showNewSnack(newSnackName);
		updateMessage('<b>' + newSnackName + '</b> has been added!', 'success');
	};

    /**
     * Adds a new snack to the list of snacks.
     *
     * @param name
     * @param snackAttributes
     */
	var addSnackToList = function(name, snackAttributes) {
		snacks[name] = snackAttributes;
		varietyCount += 1;
	};

    /**
     * Removes a snack from the DOM and from the list of stored snacks.
     * @param evt
     */
	var removeSnack = function(evt) {
		var name = this.name;
		$('li[name="' + name + '"]').remove();
		delete snacks[name];
		varietyCount -= 1;
		updateMessage('You have removed ' + name + ' from this snack machine!', 'success');

		if (varietyCount === 0) {
			updateMessage('There are no more snacks! Try adding a new snack.', 'warning');
		}
	};

    /**
     * Brings up the form to refill a particular snack.
     *
     * @param evt
     */
	var refillSnack = function(evt) {
        updateMessage();

		var name = this.name;
		var refillForm = $('.refill[name="'+name+'"]');
		// if refill form is already open, do not do anything!
		if (refillForm.length > 0) {
			return;
		}

		var template = getRefillFormTemplate(name);
		$('li[name="'+name+'"]').append(template);

		$('.maxRefill[name="'+name+'"]').on('click', refillToMax);
		$('.refillSubmit[name="'+name+'"]').on('click', refillSubmitted);
	};

    /**
     * Updates the quantity of a snack in both the snack list and the DOM.
     *
     * @param name
     */
	var updateQuantity = function(name) {
		var quantity = snacks[name].quantity;
		$('.quantityLabel[name="' + name + '"]').text(quantity);
	};

    /**
     * The actions to take when a refill is made.
     *
     * @param name
     */
	var postRefill = function(name) {
		$('.refill[name="' + name + '"]').remove();
		updateQuantity(name);
	};

    /**
     * Refills a snack to the maximum quantity;
     *
     * @param evt
     */
	var refillToMax = function(evt) {
        updateMessage();
		var name = this.name;
		snacks[name].quantity = MAX_QUANTITY;

		postRefill(name);
	};

    /**
     * Refills a snack to a custom quantity;
     *
     * @param evt
     */
	var refillSubmitted = function(evt) {
        updateMessage();
		var name = this.name;
		var quantityVal = $('.refill input[name="'+name+'"]').val();
		var quantity = parseInt(quantityVal, 10);

		if (_.isNaN(quantity) || quantity < 0) {
			updateMessage('You must specify a positive integer as your refill quantity!', 'warning');
			return;
		}
		var newQuantity = snacks[name].quantity += quantity;
		if (newQuantity > MAX_QUANTITY) {
			updateMessage('You can have a maximum of ' + MAX_QUANTITY + ' units of the same good', 'warning');
			newQuantity = MAX_QUANTITY;
		}

		snacks[name].quantity = newQuantity;
		postRefill(name);
	};

    /**
     * Displays the chosen snack message when a snack is about to be dispensed.
     *
     * @param name
     */
	var displayChosenSnackMsg = function(name) {
		var isOutOfStock = snacks[name].quantity === 0;
		var template = getChosenSnackTemplate(name, isOutOfStock);
		updateMessage(template, 'info');
		toggleForm(false);

		$('#acceptSnack').on('click', acceptSnack);
		$('#rejectSnack').on('click', rejectSnack);
	};

    /**
     * Toggles the main view.
     *
     * @param isEnabled
     */
	var toggleForm = function(isEnabled) {
		if (_.isUndefined(isEnabled)) {
			isEnabled = true;
		}

		isEnabled ? $('#main').removeClass('hide') : $('#main').addClass('hide');
	};

    /**
     * Dispenses the snack when a user clicks to accept a snack.
     *
     * @param evt
     */
	var acceptSnack = function(evt) {
		var name = this.name;

		snacks[name].quantity -= 1;
		updateQuantity(name);

		updateMessage('Enjoy your <b>' + name + '</b>!', 'success');
		toggleForm(true);
	};

    /**
     * Cancels the snack about to be dispensed when a user clicks to reject a snack.
     *
     * @param evt
     */
	var rejectSnack = function(evt) {
		var name = this.name;
		updateMessage();
		toggleForm(true);
	};

    /**
     * Handles the user's request to get a random snack.
     *
     * @param evt
     */
	var getSnack = function(evt) {
		var size = _.size(snacks);
		if (size === 0) {
			updateMessage('There are no snacks in the machine :( ', 'danger');
			return;
		}
		var snackNames = _.keys(snacks);
		var randomNum = Math.floor(Math.random()*size);
		var chosenSnack = snackNames[randomNum];

		displayChosenSnackMsg(chosenSnack);
	};

    /**
     * Handles the initial loading of the page.
     */
	var onLoad = function() {
		var exampleSnacks = {Jerky: {quantity: 2}, Chips: {quantity: 3}, Candy: {quantity: 5}};
		_.each(exampleSnacks, function(attrs, name) {
			addSnackToList(name, attrs);
			showNewSnack(name);
		});
	};

	$('#addSnackBtn').on('click', addSnack);
	$('#inputFormSubmit').on('click', submitNewSnack);
	$('#inputFormCancel').on('click', clearNewSnackForm);
	$('#randomize').on('click', getSnack);
	onLoad();
}());