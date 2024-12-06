from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from docx import Document
import PyPDF2
import cv2

import pytesseract
from PIL import Image

from django.core.files.storage import FileSystemStorage
import os

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Update path to Tesseract if necessary

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

@csrf_exempt
def upload_file(request):
    if request.method == 'POST' and 'file' in request.FILES:
        uploaded_file = request.FILES['file']
        fs = FileSystemStorage()
        filename = fs.save(uploaded_file.name, uploaded_file)
        file_path = fs.path(filename)

        # Process the file (e.g., extract text)
        if filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_path)
        elif filename.endswith('.docx'):
            text = extract_text_from_docx(file_path)
        else:
            text = "Unsupported file format."

        # Delete the file after processing
        os.remove(file_path)

        return JsonResponse({'translation': text})
    return JsonResponse({'error': 'Invalid request'}, status=400)

def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text()
    return text

def extract_text_from_docx(file_path):
    document = Document(file_path)
    text = "\n".join([para.text for para in document.paragraphs])
    return text

@csrf_exempt
def upload_image(request):
    if request.method == 'POST' and 'file' in request.FILES:
        uploaded_file = request.FILES['file']
        fs = FileSystemStorage()
        filename = fs.save(uploaded_file.name, uploaded_file)
        file_path = fs.path(filename)

        print(f"Uploaded file name: {uploaded_file.name}")
        print(f"Saved file path: {file_path}")

        try:
            # Check file extension
            if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
                os.remove(file_path)  # Remove unsupported files
                print("Unsupported file format.")
                return JsonResponse({'error': 'Unsupported file format. Please upload a valid image.'}, status=400)

            # Check if OpenCV can read the file
            image = cv2.imread(file_path)
            if image is None:
                print("OpenCV failed to read the image.")
                os.remove(file_path)
                return JsonResponse({'error': 'Error reading the image file. Please ensure it is a valid image.'}, status=400)

            # Convert to grayscale and threshold the image
            gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            _, thresh_image = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

            # Extract text using pytesseract
            extracted_text = pytesseract.image_to_string(thresh_image)
            print(f"Extracted text: {extracted_text}")

            # Clean up file after processing
            os.remove(file_path)

            # Return extracted text
            return JsonResponse({'file_content': extracted_text})
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            os.remove(file_path)
            return JsonResponse({'error': f'File processing error: {str(e)}'}, status=500)

    print("No file provided in request.")
    return JsonResponse({'error': 'Invalid request or file not provided.'}, status=400)


def extract_text_from_image(image_path):
    """
    Extracts text from an image file using Tesseract OCR.
    """
    # Load the image
    image = cv2.imread(image_path)

    # Convert to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply thresholding for better OCR results
    _, thresh_image = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Use pytesseract to extract text
    text = pytesseract.image_to_string(thresh_image)
    return text.strip()