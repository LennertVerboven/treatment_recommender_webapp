from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from doctorapp import views

app_name = 'patients'
urlpatterns = [

    path('redcap/patients/', views.RedcapPatientList.as_view(), name='redcap-api-list'),
    path('redcap/drugs/', views.RedcapDrugList.as_view(), name='redcap-api-list'),
    path('redcap/patients/<int:id>/', views.RedcapPatientDetail.as_view(), name='redcap-api-detail'),
    path('redcap/patients/<int:id>/confirm_changes', views.RedcapPatientConfirm.as_view(), name='redcap-api-confirm'),
    path('redcap/patients/<int:id>/report.pdf', views.RedcapPatientReportPdf.as_view(), name='redcap-api-report'),
    path('redcap/patients/<int:id>/poll_regimen_computed',
         views.RedcapPatientRegimenComputed.as_view(), name='redcap-api-regimen-computed'),

]

urlpatterns = format_suffix_patterns(urlpatterns)
