$(document).ready(function() {
    // Load saved settings from local storage
    const savedModel = localStorage.getItem('selectedModel');
    const savedDevice = localStorage.getItem('selectedDevice');

    if (savedModel) {
        $('#model-selector').val(savedModel);
        $('#selected-model').text(savedModel);
    }
    if (savedDevice) {
        $('#device-selector').val(savedDevice);
        $('#selected-device').text(savedDevice);
    }

    // Load available devices
    $.get('/devices', function(data) {
        let deviceSelector = $('#device-selector');
        data.devices.forEach(function(device) {
            deviceSelector.append(new Option(device, device));
        });
    });

    // Open settings modal
    $('#open-settings').click(function() {
        $('#settings-modal').show();
    });

    // Close settings modal
    $('.close-button').click(function() {
        $('#settings-modal').hide();
    });

    // Save settings and close modal
    $('#save-settings').click(function() {
        let modelName = $('#model-selector').val();
        let deviceId = $('#device-selector').val();

        // Save settings to local storage
        localStorage.setItem('selectedModel', modelName);
        localStorage.setItem('selectedDevice', deviceId);

        // Update the displayed model and device
        $('#selected-model').text(modelName);
        $('#selected-device').text(deviceId);

        // Send requests to update model and device
        $.ajax({
            url: '/update_model',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ model_name: modelName }),
            success: function(response) {
                console.log(response.status);
            }
        });
        $.ajax({
            url: '/update_device',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ device_id: deviceId }),
            success: function(response) {
                console.log(response.status);
            }
        });

        // Close the modal
        $('#settings-modal').hide();
    });

    // Send message and generate text
    $('#send-button').click(function() {
        let userText = $('#input-field').val();
        if (userText) {
            $('#chat-display').append(`<div class="user-message"><b>You:</b> ${userText}</div>`);
            $('#input-field').val('');

            let requestData = {
                prompt: userText,
                max_length: parseInt($('#max-length-spinner').val()),
                temperature: parseFloat($('#temperature-spinner').val()),
                top_k: parseInt($('#top-k-spinner').val()),
                top_p: parseFloat($('#top-p-spinner').val()),
                repetition_penalty: parseFloat($('#repetition-penalty-spinner').val())
            };

            $('#loading-indicator').show();

            $.ajax({
                url: '/generate',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(requestData),
                success: function(response) {
                    $('#chat-display').append(`<div class="ai-message"><b>AI:</b> ${response.generated_text}</div>`);
                    $('#loading-indicator').hide();
                },
                error: function() {
                    $('#loading-indicator').hide();
                    alert('Error generating text');
                }
            });
        }
    });

    // Clear chat history
    $('#clear-chat').click(function() {
        $('#chat-display').empty();
    });

    // Send message on enter key press
    $('#input-field').keypress(function(event) {
        if (event.which == 13) {
            $('#send-button').click();
        }
    });
});
