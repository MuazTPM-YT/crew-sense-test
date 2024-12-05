function openTab(event, tabName) {
    $('.tab-content').hide(); 
    $('.tab-link').removeClass('active'); 

    $(`#${tabName}`).show(); 
    $(event.target).addClass('active'); 
}

$('#left-english-btn').click(function () {
    $(this).addClass('selected'); 
    $('#left-braille-btn').removeClass('selected'); 
    $('#right-braille-btn').addClass('selected'); 
    $('#right-english-btn').removeClass('selected'); 
});

$('#left-braille-btn').click(function () {
    $(this).addClass('selected'); 
    $('#left-english-btn').removeClass('selected'); 
    $('#right-english-btn').addClass('selected'); 
    $('#right-braille-btn').removeClass('selected'); 
});

$(document).ready(function() {
    $('.text-input').on('input', function() {
      var textInput = $(this).val();

      $.ajax({
        url: '/convert-text-to-braille/',
        type: 'POST',
        headers: {
          'X-CSRFToken': '{{ csrf_token }}'
        },
        data: JSON.stringify({ text: textInput }),
        contentType: 'application/json',
        success: function(response) {

          $('.content-box-right .text-output').val(response.braille);
        },
        error: function(error) {
          console.error('Error:', error);
        }
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
            icon.src = staticSpeakerUrl;
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

  