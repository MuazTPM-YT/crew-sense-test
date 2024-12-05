function openTab(event, tabName) {
    $('.tab-content').hide(); 
    $('.tab-link').removeClass('active'); 

    $(`#${tabName}`).show(); 
    $(event.target).addClass('active'); 
}

$(document).ready(function () {
    let inputText = ''; 
    let outputText = ''; 
    let mode = "text_to_braille"; 

    $('#left-english-btn').click(function () {
        $(this).addClass('selected');
        $('#left-braille-btn').removeClass('selected');
        $('#right-braille-btn').addClass('selected');
        $('#right-english-btn').removeClass('selected');
        
        inputText = $('.text-input').val();
        outputText = $('.text-output').val();

        $('.text-input').val(outputText);
        $('.text-output').val(inputText);

        mode = "text_to_braille"; 
        $('.text-input').attr("placeholder", "Type English here...");
        $('.text-output').attr("placeholder", "Braille output...");
    });

    $('#left-braille-btn').click(function () {
        $(this).addClass('selected');
        $('#left-english-btn').removeClass('selected');
        $('#right-english-btn').addClass('selected');
        $('#right-braille-btn').removeClass('selected');

        inputText = $('.text-input').val();
        outputText = $('.text-output').val();

        $('.text-input').val(outputText);
        $('.text-output').val(inputText);

        mode = "braille_to_text"; 
        $('.text-input').attr("placeholder", "Type Braille here...");
        $('.text-output').attr("placeholder", "Text output...");
    });

    $('.text-input').on('input', function () {
        const textInput = $(this).val();

        $.ajax({
            url: '/convert-text-to-braille/',
            type: 'POST',
            headers: {
                'X-CSRFToken': '{{ csrf_token }}',
            },
            data: JSON.stringify({ text: textInput, mode: mode }),
            contentType: 'application/json',
            success: function (response) {
                $('.text-output').val(response.output);
            },
            error: function (error) {
                console.error('Error:', error);
            },
        });
    });
});

  document.getElementById("copyButton").addEventListener("click", function () {
    const icon = document.getElementById("iconImage");
    const originalSrc = icon.src;
    const textareaContent = document.querySelector(".text-output").value; 

    navigator.clipboard.writeText(textareaContent).then(() => {
        console.log("Copied to clipboard!");

        icon.classList.add("hidden");

        setTimeout(function () {
            icon.src = staticCheckUrl;
            icon.classList.remove("hidden");
        }, 100);

        setTimeout(function () {
            icon.classList.add("hidden");
            setTimeout(function () {
                icon.src = originalSrc;
                icon.classList.remove("hidden");
            }, 100);
        }, 1500);
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
});

  