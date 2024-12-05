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
    "/": "⠌", "@": "⠈⠁", "+": "⠖", "=": "⠶", "*": "⠔", "<": "⠦", ">": "⠴",

    "CAPITAL": "⠠", 
    "NUMERIC": "⠼"  
}

class Convertor:
    def text_to_braille_convert(self, text):
        braille = ""
        for char in text:
            if char.isupper():
                braille += braille_dict["CAPITAL"]
                braille += braille_dict.get(char.lower(), "")
            else:
                braille += braille_dict.get(char, "")
        return braille

@csrf_exempt
def convert_text_to_braille(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        text_input = data.get('text')
        converter = Convertor()
        braille_output = converter.text_to_braille_convert(text_input)
        return JsonResponse({'braille': braille_output})
    return JsonResponse({'error': 'Invalid request method'}, status=400)