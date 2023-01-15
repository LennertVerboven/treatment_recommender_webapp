import logging
import os

from django.http import FileResponse, Http404
from django.utils import timezone
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status

from doctorapp.permissions import RedcapIsDoctor
from doctorapp.redcap.redcap_database import RedcapDatabase
from doctorapp.serializers import RedcapPartialPatientSerializer, RedcapPatientSerializer, RedcapDrugSerializer
from doctorsite.settings import REPORT_PDF_DIR, REMOVE_PDF_REPORT_AFTER_SERVING

"""
Views zijn de 'controllers' van Django. Deze bepalen de REST endpoints en welke HTTP methoden er ondersteund worden
( get, put, post,... ). De meesten worden impliciet gedefinieerd door over te erven van Django Rest Framework
views zoals generics.ListAPIView. De methodes get_queryset en get_object bepalen dan welke data zichtbaar is
en of de requester de juiste permissies heeft.

Documentatie en code:
- https://www.django-rest-framework.org/api-guide/generic-views
- https://github.com/encode/django-rest-framework/blob/master/rest_framework/generics.py
- https://github.com/encode/django-rest-framework/blob/master/rest_framework/mixins.py
"""

logger = logging.getLogger('django')


def get_id_from_url_arg(self):
    lookup_url_kwarg = 'id'
    assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
    )
    patient_id = self.kwargs[lookup_url_kwarg]
    return patient_id


class RedcapPatientList(generics.ListAPIView):
    permission_classes = [IsAuthenticated & RedcapIsDoctor]
    serializer_class = RedcapPartialPatientSerializer

    def get_queryset(self):
        with RedcapDatabase() as db:
            patients = db.get_patients_for_list(doctor=self.request.user)
        return patients


class RedcapDrugList(generics.ListAPIView):
    permission_classes = [IsAuthenticated & RedcapIsDoctor]
    serializer_class = RedcapDrugSerializer

    def get_queryset(self):
        drugs = RedcapDatabase.get_all_drugs()
        return drugs


class RedcapPatientDetail(generics.RetrieveUpdateAPIView):
    """
    Supports HTTP methods:
        - GET to retrieve detailed patient info
        - PUT to update a patient's data, like weight
        - PATCH to request to (re)compute a personalized drug regimen
    """
    permission_classes = [IsAuthenticated & RedcapIsDoctor]
    serializer_class = RedcapPatientSerializer

    def get_object(self):
        patient_id = get_id_from_url_arg(self)
        with RedcapDatabase() as db:
            # May raise 404
            patient = db.get_patient(patient_id=patient_id)
        # May raise a permission denied
        self.check_object_permissions(self.request, patient)
        return patient

    def patch(self, request, *args, **kwargs):
        # # todo consider if necessary OR merge put and patch? (so move this to serializer)
        # # should it be possible to save patient metadata like new weight WITHOUT computing regimen?
        # patient_id = self.get_id_from_url_arg()
        # with RedcapDatabase() as db:
        #     # May raise 404
        #     patient = db.get_patient(patient_id=patient_id)
        #     # May raise a permission denied
        #     self.check_object_permissions(self.request, patient)
        #
        #     db.set_last_requested_regimen(patient_id, timestamp=timezone.now())
        #
        # # compute new regimen in separate process so server worker (this process) is not blocked
        # compute_new_regimen_in_new_process(patient)
        #
        # return Response(status=status.HTTP_202_ACCEPTED)
        raise MethodNotAllowed('patch')


class RedcapPatientConfirm(APIView):
    permission_classes = [IsAuthenticated & RedcapIsDoctor]

    def post(self, request, *args, **kwargs):
        patient_id = get_id_from_url_arg(self)
        last_confirmed = timezone.now()
        with RedcapDatabase() as db:
            # May raise 404
            patient = db.get_patient(patient_id=patient_id)
            # May raise a permission denied
            self.check_object_permissions(self.request, patient)

            db.set_last_confirmed(patient_id=patient['id'], regimen_number=patient['regimen_number'], timestamp=last_confirmed, agreed=request.data['agreed'], physician=self.request.user)

        response = Response(last_confirmed, status=status.HTTP_202_ACCEPTED)
        return response


class RedcapPatientReportPdf(APIView):
    permission_classes = [IsAuthenticated & RedcapIsDoctor]

    def get(self, request, *args, **kwargs):
        patient_id = get_id_from_url_arg(self)
        with RedcapDatabase() as db:
            # May raise 404
            patient = db.get_patient(patient_id=patient_id)
            # May raise a permission denied
            self.check_object_permissions(self.request, patient)
            logger.info(patient)

            #report_filename = db.download_report_pdf(patient_id=patient_id, smarttt_id=patient['smarttt_id'], regimen_number=patient['regimen_number'])
        report_path = os.path.join(REPORT_PDF_DIR, patient['pdf_name'])
        logger.info(report_path)
        try:
            return FileResponse(open(report_path, 'rb'),
                                content_type='application/pdf', as_attachment=False)
        except FileNotFoundError:
            raise Http404()
        finally:
            if REMOVE_PDF_REPORT_AFTER_SERVING:
                try:
                    os.remove(report_path)
                    logger.warning('Removed pdf report at: %s' % report_path)
                except OSError as e:
                    logger.warning('Something went wrong while removing pdf report at %s: %s' % (report_path, e))


class RedcapPatientRegimenComputed(generics.GenericAPIView):
    permission_classes = [IsAuthenticated & RedcapIsDoctor]
    serializer_class = RedcapPatientSerializer

    def get(self, request, *args, **kwargs):
        patient_id = get_id_from_url_arg(self)
        with RedcapDatabase() as db:
            # May raise 404
            patient = db.get_patient(patient_id=patient_id)
            # May raise a permission denied
            self.check_object_permissions(self.request, patient)

        # check if regimen was computed after last request to do so
        if patient['last_requested_regimen'] < patient['last_modified']:
            # modified after requested so finished
            serializer = self.get_serializer(patient)
            return Response(data={'ready': True, 'patient': serializer.data})
        else:
            # computation not yet finished or terminated before finished
            return Response(data={'ready': False, 'patient': {}})
