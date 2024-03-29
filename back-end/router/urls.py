"""router URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('api/ms/get_summary_graph', views.get_summary_graph),
    path('api/get_local_ms_graph', views.get_local_ms_graph),

    path('api/get_model_scalars', views.get_model_scalars),
    path('api/get_metadata', views.get_metadata),
    path('api/get_node_scalars', views.get_node_scalars),
    path('api/get_node_tensors', views.get_node_tensors),
    path('api/get_node_tensor', views.get_node_tensor),
    path('api/get_layer_scalars', views.get_layer_scalars),
    path('api/get_cluster_data', views.get_cluster_data),
    path('api/get_node_line', views.get_node_line),
    path('api/get_tensor_heatmap', views.get_tensor_heatmap),

    path('api/emit_action', views.emit_action)
]