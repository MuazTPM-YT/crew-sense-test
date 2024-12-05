from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Create your views here.
def initial_the_web(request):
    return render(request, 'index.html')

braille_dict = {
    "a": "⠁", "b": "⠃", "c": "⠉", "d": "⠙", "e": "⠑", "f": "⠋", "g": "⠛", "h": "⠓", "i": "⠊", "j": "⠚",
    "k": "⠅", "l": "⠇", "m": "⠍", "n": "⠝", "o": "⠕", "p": "⠏", "q": "⠟", "r": "⠗", "s": "⠎", "t": "⠞",
    "u": "⠥", "v": "⠧", "w": "⠺", "x": "⠭", "y": "⠽", "z": "⠵",

    "1": "⠼⠁", "2": "⠼⠃", "3": "⠼⠉", "4": "⠼⠙", "5": "⠼⠑", "6": "⠼⠋", "7": "⠼⠛", "8": "⠼⠓", "9": "⠼⠊", "0": "⠼⠚",

    ".": "⠲", ",": "⠂", ";": "⠆", ":": "⠒", "!": "⠖", "?": "⠦", "'": "⠄", "-": "⠤", "(": "⠶", ")": "⠶",
    "/": "⠌", "@": "⠈⠁", "=": "⠶", "*": "⠔", "<": "⠦", ">": "⠴",

    "CAPITAL": "⠠", 
    "NUMERIC": "⠼"  
}

inverse_braille_dict = {v: k for k, v in braille_dict.items()}

class Convertor:
    def __init__(self):
        self.braille = ""
        self.text = ""
        
    def text_to_braille_convert(self, text):
        self.braille = ""  
        for char in text:
            if char == " ":
                self.braille += " "
            elif char == "\n":
                self.braille += "\n"
            elif char.isupper():
                self.braille += braille_dict["CAPITAL"]
                self.braille += braille_dict.get(char.lower(), "")
            elif char.isdigit():
                self.braille += braille_dict["NUMERIC"]
                self.braille += braille_dict.get(char, "")
            else:
                self.braille += braille_dict.get(char, "")
        return self.braille

    def braille_to_text_convert(self, braille):
        text = ""
        skip_next = False
        for i, char in enumerate(braille):
            if skip_next:
                skip_next = False
                continue
            if char == braille_dict["CAPITAL"]:
                if i + 1 < len(braille):  # Ensure we don't go out of bounds
                    text += inverse_braille_dict.get(braille[i + 1], "").upper()
                    skip_next = True
                else:
                    # Handle case where CAPITAL is the last character (optional)
                    text += ""
            elif char == " ":
                text += " "
            else:
                text += inverse_braille_dict.get(char, "")
        return text


@csrf_exempt
def convert_text_to_braille(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        text_input = data.get('text')
        mode = data.get('mode')  # Either "text_to_braille" or "braille_to_text"

        converter = Convertor()
        if mode == "text_to_braille":
            output = converter.text_to_braille_convert(text_input)
        elif mode == "braille_to_text":
            output = converter.braille_to_text_convert(text_input)
        else:
            return JsonResponse({'error': 'Invalid mode'}, status=400)

        return JsonResponse({'output': output})
    return JsonResponse({'error': 'Invalid request method'}, status=400)
