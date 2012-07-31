// The draft save object
function smf_DraftAutoSave(oOptions)
{
	this.opt = oOptions;
	this.bInDraftMode = false;
	this.sCurDraftId = '';
	this.oCurDraftDiv = null;
	this.interval_id = null;
	this.oDraftHandle = window;
	this.sLastSaved = '';
	this.bPM = this.opt.bPM ? true : false;
	addLoadEvent(this.opt.sSelf + '.init();');
}

// Start our self calling routine
smf_DraftAutoSave.prototype.init = function ()
{
	if (this.opt.iFreq > 0)
	{
		// start the autosave timer
		this.interval_id = setInterval(this.opt.sSelf + '.draft' + (this.bPM ? 'PM' : '') + 'Save();', this.opt.iFreq);

		// Set up window focus and blur events
		this.oDraftHandle.instanceRef = this;
		this.oDraftHandle.onblur = function (oEvent) {return this.instanceRef.draftBlur(oEvent);};
		this.oDraftHandle.onfocus = function (oEvent) {return this.instanceRef.draftFocus(oEvent);};
	}
}

// Moved away from the page, where did you go? ... till you return we pause autosaving
smf_DraftAutoSave.prototype.draftBlur = function(oEvent)
{
	// save what we have and turn of the autosave
    if (this.bPM)
        this.draftPMSave();
    else
        this.draftSave();
	clearInterval(this.interval_id);
	this.interval_id = 0;
}

// Since your back we resume the autosave timer
smf_DraftAutoSave.prototype.draftFocus = function(oEvent)
{
	this.interval_id = setInterval(this.opt.sSelf + '.draft' + (this.bPM ? 'PM' : '') + 'Save();', this.opt.iFreq);
}

// Make the call to save this draft in the background
smf_DraftAutoSave.prototype.draftSave = function ()
{
	// nothing to save or already posting?
	if (isEmptyText($('#' + this.opt.sSceditorID).data("sceditor").getText()) || smf_formSubmitted)
		return false;

	// Still saving the last one or other?
	if (this.bInDraftMode)
		this.draftCancel();

	// Flag that we are saving a draft
	document.getElementById('throbber').style.display = '';
	this.bInDraftMode = true;

	// Get the form elements that we want to save
	var aSections = [
		'topic=' + parseInt(document.forms.postmodify.elements['topic'].value),
		'id_draft=' + parseInt(document.forms.postmodify.elements['id_draft'].value),
		'subject=' + escape(document.forms.postmodify['subject'].value.replace(/&#/g, "&#38;#").php_to8bit()).replace(/\+/g, "%2B"),
		'message=' + escape($('#' + this.opt.sSceditorID).data("sceditor").getText().replace(/&#/g, "&#38;#").php_to8bit()).replace(/\+/g, "%2B"),
		'icon=' + escape(document.forms.postmodify['icon'].value.replace(/&#/g, "&#38;#").php_to8bit()).replace(/\+/g, "%2B"),
		'save_draft=true',
		smf_session_var + '=' + smf_session_id,
	];

	// Get the locked an/or sticky values if they have been selected or set that is
	if (this.opt.sType == 'post')
	{
		if (document.getElementById('check_lock').checked)
			aSections[aSections.length] = 'lock=1';
		if (document.getElementById('check_sticky').checked)
			aSections[aSections.length] = 'sticky=1';
	}

	// keep track of source or wysiwyg
	aSections[aSections.length] = 'message_mode=' + $("#message").data("sceditor").inSourceMode();

	// Send in document for saving and hope for the best
	sendXMLDocument.call(this, smf_prepareScriptUrl(smf_scripturl) + "action=post2;board=" + this.opt.iBoard + ";xml", aSections.join("&"), this.onDraftDone);
}

// Make the call to save this PM draft in the background
smf_DraftAutoSave.prototype.draftPMSave = function ()
{
	// nothing to save?
	if (isEmptyText(document.forms.postmodify['message']))
		return false;

	// Still saving the last one or some other?
	if (this.bInDraftMode)
		this.draftCancel();

	// Flag that we are saving
	document.getElementById('throbber').style.display = '';
	this.bInDraftMode = true;

	// Get the to and bcc values
	var aTo = this.draftGetRecipient('recipient_to[]');
	var aBcc = this.draftGetRecipient('recipient_bcc[]');

	// Get the rest of the form elements that we want to save, and load them up
	var aSections = [
		'replied_to=' + parseInt(document.forms.postmodify.elements['replied_to'].value),
		'id_pm_draft=' + parseInt(document.forms.postmodify.elements['id_pm_draft'].value),
		'subject=' + escape(document.forms.postmodify['subject'].value.replace(/&#/g, "&#38;#").php_to8bit()).replace(/\+/g, "%2B"),
		'message=' + escape(document.forms.postmodify['message'].value.replace(/&#/g, "&#38;#").php_to8bit()).replace(/\+/g, "%2B"),
		'recipient_to=' + aTo,
		'recipient_bcc=' + aBcc,
		'save_draft=true',
		smf_session_var + '=' + smf_session_id,
	];

	// Saving a copy in the outbox?
	if (document.getElementById('outbox'))
		aSections[aSections.length] = 'outbox=' + parseInt(document.getElementById('outbox').value);

	// account for wysiwyg
	if (this.opt.sType == 'post')
		aSections[aSections.length] = 'message_mode=' + parseInt(document.forms.postmodify.elements['message_mode'].value);

	// Send in (post) the document for saving
	sendXMLDocument.call(this, smf_prepareScriptUrl(smf_scripturl) + "action=pm;sa=send2;xml", aSections.join("&"), this.onDraftDone);
}

// Callback function of the XMLhttp request for saving the draft message
smf_DraftAutoSave.prototype.onDraftDone = function (XMLDoc)
{
	// If it is not valid then clean up
	if (!XMLDoc || !XMLDoc.getElementsByTagName('draft'))
		return this.draftCancel();

	// Grab the returned draft id and saved time from the response
	this.sCurDraftId = XMLDoc.getElementsByTagName('draft')[0].getAttribute('id');
	this.sLastSaved = XMLDoc.getElementsByTagName('draft')[0].childNodes[0].nodeValue;

	// Update the form to show we finished, if the id is not set, then set it
	document.getElementById(this.opt.sLastID).value = this.sCurDraftId;
	oCurDraftDiv = document.getElementById(this.opt.sLastNote);
	setInnerHTML(oCurDraftDiv, this.sLastSaved);

	// hide the saved draft infobox in the event they pressed the save draft button at some point
	if (this.opt.sType == 'post')
		document.getElementById('draft_section').style.display = 'none';

	// thank you sir, may I have another
	this.bInDraftMode = false;
	document.getElementById('throbber').style.display = 'none';
}

// function to retrieve the to and bcc values from the pseudo arrays
smf_DraftAutoSave.prototype.draftGetRecipient = function (sField)
{
	var oRecipient = document.forms.postmodify.elements[sField];
	var aRecipient = []

	if (typeof(oRecipient) != 'undefined')
	{
		// just one recipient
		if ('value' in oRecipient)
			aRecipient.push(parseInt(oRecipient.value));
		else
		{
			// or many !
			for (var i = 0, n = oRecipient.length; i < n; i++)
				aRecipient.push(parseInt(oRecipient[i].value));
		}
	}
	return aRecipient;
}

// If another auto save came in with one still pending
smf_DraftAutoSave.prototype.draftCancel = function ()
{
	// can we do anything at all ... do we want to (e.g. sequence our async events?)
	// @todo if not remove this function
	this.bInDraftMode = false;
	document.getElementById('throbber').style.display = 'none';
}