function openTab(event, tabName) {
    $('.tab-content').hide(); // Hide all tab contents
    $('.tab-link').removeClass('active'); // Remove 'active' class from all links

    $(`#${tabName}`).show(); // Show the selected tab content
    $(event.target).addClass('active'); // Add 'active' class to the clicked link
}

$('#left-english-btn').click(function () {
    $(this).addClass('selected'); // Highlight left English button
    $('#left-braille-btn').removeClass('selected'); // Remove highlight from left Braille button
    $('#right-braille-btn').addClass('selected'); // Highlight right Braille button
    $('#right-english-btn').removeClass('selected'); // Remove highlight from right English button
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

      // AJAX request to send input to backend
      $.ajax({
        url: '/convert-text-to-braille/',
        type: 'POST',
        headers: {
          'X-CSRFToken': '{{ csrf_token }}'
        },
        data: JSON.stringify({ text: textInput }),
        contentType: 'application/json',
        success: function(response) {
          // Update the right text box with Braille output
          $('.content-box-right .text-output').val(response.braille);
        },
        error: function(error) {
          console.error('Error:', error);
        }
      });
    });
  });

document.getElementById('copyButton').addEventListener('click', function() {
    // Get the content of the right text area
    var brailleText = document.getElementById('rightContent').value;

    // Copy to clipboard
    navigator.clipboard.writeText(brailleText).then(function() {
      console.log("Braille text copied to clipboard!");
    }).catch(function(err) {
      console.error('Error copying text: ', err);
    });

    // Send copied text to the server using AJAX
    $.ajax({
      url: '/save-braille-text/',  // Django URL to handle saving
      type: 'POST',
      data: {
        text: brailleText,
        csrfmiddlewaretoken: '{{ csrf_token }}' // Django CSRF token
      },
      success: function(response) {
        alert('Text copied and sent to the server!');
      },
      error: function(xhr, status, error) {
        console.error('AJAX Error: ' + error);
      }
    });
  });

  document.getElementById("copyButton").addEventListener("click", function () {
    const icon = document.getElementById("iconImage");
  
    // Add a fade-out effect
    icon.classList.add("hidden");
  
    setTimeout(function () {
      icon.src = "{% static 'assets/Speaker.svg' %}";
      icon.classList.remove("hidden");
    }, 150);
  });
  