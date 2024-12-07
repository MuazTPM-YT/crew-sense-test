from django.urls import path
from . import views

urlpatterns = [
    path('',views.initial_the_web),
    path('convert-text-to-braille/', views.convert_text_to_braille, name='convert_text_to_braille'),
    path('upload-file/', views.upload_file, name='upload_file'),
    path('upload-image/', views.upload_image, name='upload_image'),
]
