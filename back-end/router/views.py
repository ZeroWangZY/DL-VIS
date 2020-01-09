from django.shortcuts import render
import sys
import json
import numpy as np
import time
from django.http import HttpResponse

def index(request):
    return render(request, 'index.html')
