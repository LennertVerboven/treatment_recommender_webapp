import os
import pickle
import datetime

import pandas as pd
import numpy as np

from typing import Dict, List, Union

from django.utils.datetime_safe import date
from django.utils import timezone
from rest_framework.exceptions import NotFound

from doctorapp.redcap.redcap import Redcap
from doctorapp.redcap.utils import parse_date_if_obj, parse_datetime_if_obj, DATETIME_FORMAT
from doctorsite.settings import BASE_DIR, DEBUG, REPORT_PDF_DIR

LOCAL_DATAFRAME_PKL = os.path.join(BASE_DIR, 'doctorapp/redcap/pickles/patients_meta.pkl')
LOCAL_DRUG_DATAFRAME_PKL = os.path.join(BASE_DIR, 'doctorapp/redcap/pickles/drugs.pkl')
LOCAL_PRESCRIPTIONS_DATAFRAME_PKL = os.path.join(BASE_DIR, 'doctorapp/redcap/pickles/prescriptions.pkl')
LOCAL_EXCLUSIONS_DATAFRAME_PKL = os.path.join(BASE_DIR, 'doctorapp/redcap/pickles/exclusions.pkl')

META_COLUMNS = ('id', 'name', 'date_of_birth', 'assoc_doctors', 'weight_in_kg', 'sex', 'hospital', 'phone_number',
                'last_modified', 'last_confirmed', 'sequencing_report_filename')


class RedcapDatabase:
    """
    This class is an interface to the actual underlying database.
    Implement the functions called here in the actual database class
    and connect them to your database
    """

    def __init__(self):
        pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        pass

    @staticmethod
    def get_all_drugs() -> List[Dict[str, Union[str, int]]]:
        """
        :return: A list of all drugs.
            [{
                "drug_name": "levofloxacin",
                "id": 0
            },
            {
                "drug_name": "linezolid",
                "id": 1
            }]
        """
        return Redcap.get_drug_list()

    @staticmethod
    def get_clinical_info(patient_id):
        return Redcap.get_pretreatment_from_redcap(patient_id)

    def get_patients_for_list(self, doctor=None) -> List[Dict]:
        """
        :param doctor: id of the doctor for which patients should be loaded
        :type doctor: rest_framework.request.Request.user
        :return: list of all patients for a given doctor with only the listed fields in the exampe below
            [{
                "id": "R04274",
                "name": "Happi Cartuyvels",
                "date_of_birth": "2020-04-18",
                "sex": "MALE",
                "phone_number": "+32490100100",
                "hospital": "Capetown"
            },
            {
                "id": "R04275",
                "name": "Bas Indekeu",
                "date_of_birth": "2018-04-18",
                "sex": "MALE",
                "phone_number": "+32490222222",
                "hospital": "Johannesburg"
            }]
        """
        return Redcap.get_patient_list(doctor)

    def get_patient(self, patient_id) -> Dict:
        """
            Get all patient data for a given patient.
        :param patient_id:  str, bv R04274
        :return:
            {   "id": "R04274",
                "date_of_birth": "2020-04-18",
                "assoc_doctors": [{
                                        "user": 7,
                                        "full_name": "Demo Doctor"
                                    }],
                "last_modified": "2020-05-03T14:04:27Z",
                "last_confirmed": "2020-05-02T14:20:38Z",
                "last_requested_regimen": "2020-05-02T14:20:38Z",
                "sequencing_report_filename": "EC056-164.pdf",
                "susceptible": [{
                                    "drug": "linezolid",
                                    "gene": "/"
                                },
                                {
                                    "drug": "bedaquiline",
                                    "gene": "/"
                                }],
                "resistant": [{
                                "drug": "isoniazid",
                                "gene": "katG_p.Ser315Thr, fabG1_c.-15C>T"
                            }],
                ...
        """
        try:
            patient = Redcap.get_patient(patient_id)
            print(patient)
            return patient
        except IndexError:
            raise NotFound('Patient does not exist: %s' % patient_id)

    def submit_patient(self, patient_id, patient_data, timestamp) -> Dict:
        """
            Store a patient in the databse and return a complete patient.
        :param patient_id:  str, bv R04274
        :param patient_data: Only contains field which can change:
                - weight_in_kg
                - phone_number
                - last_modified (automatically set to now by serializer)
                - prescriptions (computed by algorithm)
                - toxicities (possible toxicity changes by the physician)
                - stockouts  (possible toxicity changes by the physician)
            B.v.:
                {'phone_number': '+32490100100', 'weight_in_kg': '22',
                 'toxicities': [
                    {'id': 8, 'drug_name': 'imipenem', 'date_issued': datetime.date(2020, 5, 3), 'patient_id': 'R04274',
                     'reason': 'TOXICITY'}],
                 'stockouts': [
                    {'id': 0, 'drug_name': 'clofazimine', 'date_issued': datetime.date(2020, 5, 2),
                     'patient_id': 'R04274', 'reason': 'STOCKOUT'}],
                 'last_modified': datetime.datetime(2020, 5, 3, 14, 50, 58, 266476, tzinfo= < UTC >),
                 'prescriptions': [
                    {'patient_id': 'R04274', 'drug_name': 'para_aminosalicylic_acid', 'dosage_in_mg': 4100.0,
                     'date_issued': date(2020, 5, 3)},
                    {'patient_id': 'R04274', 'drug_name': 'bedaquiline', 'dosage_in_mg': 2900.0,
                     'date_issued': date(2020, 5, 3)}]}
        :return: return a complete patient
        """
        Redcap.submit_visit_data(patient_id, patient_data, timestamp)
        return self.get_patient(patient_id)

    def set_last_confirmed(self, patient_id, regimen_number, timestamp, agreed, physician):
        """
        Set last confirmed to "now" , such that last_confirmed > last_modified, to
            facilitate warnings in the front end.
        :param patient_id:       int
        :param timestamp:   datetime.datetime
        :return:
        """
        return Redcap.submit_regimen_request(patient_id, timestamp, confirmation=int(regimen_number), agreed=agreed, physician=physician)

    def set_last_requested_regimen(self, patient_id, timestamp):
        """
        Set last request to "now" , such that last_confirmed > last_modified, to
            facilitate waiting message in the front end.
        :param patient_id:          int
        :param timestamp:      datetime.datetime
        :return:
        """
        return Redcap.submit_regimen_request(patient_id, timestamp)

    def set_new_regimen(self, patient_id, prescriptions, pdf_name, regimen_number, timestamp):
        """
        Saves computed regimen to database.
        :param patient_id:      int
        :param prescriptions:   list[dict[str, str]]
                Example:
                    [
                        {'patient_id': 'R04274', 'drug_name': 'para_aminosalicylic_acid', 'dosage_in_mg': 4100.0,
                         'date_issued': date(2020, 5, 3)},
                        {'patient_id': 'R04274', 'drug_name': 'bedaquiline', 'dosage_in_mg': 2900.0,
                         'date_issued': date(2020, 5, 3)}
                    ]
        :param timestamp:       datetime.datetime
        :return:
        """
        pdf_file = os.path.join(REPORT_PDF_DIR, pdf_name)
        Redcap.submit_regimen(patient_id, prescriptions, regimen_number, timestamp, pdf_name)
