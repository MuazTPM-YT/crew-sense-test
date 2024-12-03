from django.shortcuts import render

# Create your views here.
def initial_the_web(request):
    return render(request, 'index.html')