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

$(document).ready(function () {
    // File input change handler for documents
    $('#fileInput').change(function () {
        const fileInput = $(this)[0].files[0];
        if (!fileInput) {
            alert("No file selected.");
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput);
        formData.append('csrfmiddlewaretoken', csrfToken); // CSRF token for Django

        // Show a loading indicator in the output box
        $('.content-box-right .text-output').val("Processing file...");

        // Step 1: Upload the file and extract its content
        $.ajax({
            url: '/upload-file/', // Backend endpoint for file content extraction
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.translation) {
                    const englishText = response.translation;

                    // Show the extracted English text in the left content box
                    $('.content-box-left .text-input').val(englishText);

                    // Step 2: Translate English text to Braille
                    translateTextToBraille(englishText);
                } else {
                    alert("File processing failed. No text extracted.");
                    $('.content-box-right .text-output').val("");
                }
            },
            error: function (xhr, status, error) {
                alert("An error occurred while processing the file.");
                console.error("File Processing Error:", xhr.responseText || error);
                $('.content-box-right .text-output').val("File processing error.");
            },
        });
    });

    // File input change handler for images
    $('#imageInput').change(function () {
        const fileInput = $(this)[0].files[0];
        if (!fileInput) {
            alert("No image selected.");
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput);
        formData.append('csrfmiddlewaretoken', csrfToken);

        // Show a loading indicator
        $('.content-box-right .text-output').val("Processing image...");

        // Step 1: Extract text from the image
        $.ajax({
            url: '/upload-image/', // Backend endpoint for extracting text
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.file_content) {
                    const extractedText = response.file_content;

                    // Show the extracted text in the left content box
                    $('.content-box-left .text-input').val(extractedText);

                    // Step 2: Translate extracted text to Braille
                    translateTextToBraille(extractedText);
                } else {
                    alert("No text content extracted from the image.");
                    $('.content-box-right .text-output').val("");
                }
            },
            error: function (xhr, status, error) {
                alert("An error occurred while processing the image.");
                console.error("Image Processing Error:", xhr.responseText || error);
                $('.content-box-right .text-output').val("Image processing error.");
            },
        });
    });

    // Function to translate text to Braille
    function translateTextToBraille(text) {
        $('.content-box-right .text-output').val("Translating to Braille...");
        $.ajax({
            url: '/convert-text-to-braille/', // Backend endpoint for Braille translation
            type: 'POST',
            headers: {
                'X-CSRFToken': csrfToken, // CSRF token for Django
            },
            data: JSON.stringify({ text: text, mode: "text_to_braille" }),
            contentType: 'application/json',
            success: function (response) {
                if (response.output) {
                    // Show Braille translation in the right content box
                    $('.content-box-right .text-output').val(response.output);
                } else {
                    alert("Failed to translate text to Braille.");
                    $('.content-box-right .text-output').val("");
                }
            },
            error: function (xhr, status, error) {
                alert("An error occurred while translating text to Braille.");
                console.error("Braille Translation Error:", xhr.responseText || error);
                $('.content-box-right .text-output').val("Translation error.");
            },
        });
    }
});

$(document).ready(function () {
    $('.listen-button').on('click', function () {
      const text = $('.content-box-left .text-input').val(); 

      if (text) {
        try {
          const speech = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(speech);
        } catch (e) {
          console.error("Error speaking text:", e);
        }
      } else {
        alert("Please enter some text to speak!");
      }
    });
  });

  $(document).ready(function () {
    $('.print-button').on('click', function () {
      const translationContent = $('.content-box-right .text-output').val();
  
      if ($.trim(translationContent)) {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Translation</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
              </style>
            </head>
            <body>
              ${translationContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      } else {
        alert("There is no content to print!");
      }
    });
  });
  