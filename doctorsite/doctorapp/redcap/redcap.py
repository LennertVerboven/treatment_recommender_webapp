import logging
from io import StringIO

import requests

import pandas as pd
import numpy as np
import datetime
import json


from django.utils.dateparse import parse_datetime

# minimum contra-indication score to be considered a CI
from doctorsite.settings import REPORT_PDF_DIR
from doctorapp.redcap.utils import DATETIME_FORMAT_REDCAP

logger = logging.getLogger('django')

DRUG_MAPPING = {0: 'levofloxacin',
                1: 'linezolid',
                2: 'imipenem',
                3: 'meropenem',
                4: 'moxifloxacin',
                5: 'moxifloxacin_high_dose',
                6: 'bedaquiline',
                7: 'amikacin',
                8: 'clofazimine',
                9: 'cycloserine',
                10: 'terizidone',
                11: 'streptomycin',
                12: 'ethambutol',
                13: 'para_aminosalicylic_acid',
                14: 'ethionamide',
                15: 'prothionamide',
                16: 'rifampicin',
                17: 'rifampicin_high_dose',
                18: 'rifabutin',
                19: 'delamanid',
                20: 'isoniazid',
                21: 'isoniazid_high_dose',
                22: 'pyrazinamide',
                23: 'pretomanid'
                }

class Redcap:
    """
    This class is a dummy interface which saves and stores the patients
    and their data in json files.
    """
    @staticmethod
    def get_drug_list():
        x = [{
            'drug_name': DRUG_MAPPING[drug],
            'id': drug
        } for drug in DRUG_MAPPING]
        return x

    @staticmethod
    def get_patient_list(doctor):
        with open('./dummy_patients.json', 'r') as f:
            patients = json.load(f)
            patients = [{
                "id": int(patient["id"]),
                "name": patient["name"],
                "date_of_birth": patient["date_of_birth"],
                "sex": patient["sex"],
                "phone_number": patient["phone_number"],
                "hospital": patient["hospital"]
            } for patient in patients.values() if (doctor.is_superuser) or (doctor.id in patient['assoc_doctors'])]
            return patients

    @staticmethod
    def get_patient(patient_id):
        with open('./dummy_patients.json', 'r') as f:
            patients = json.load(f)
            patient = patients[str(patient_id)]
            prescriptions = [patient["prescriptions"][i] for i in patient["prescriptions"] if "treatment_computed" in patient["prescriptions"][i]]
            requested_prescriptions = [patient["prescriptions"][i] for i in patient["prescriptions"]]
            patient["regimen_number"] = len(prescriptions)
            if prescriptions:
                patient["pdf_name"] = prescriptions[-1]["pdf_name"]
                patient["prescriptions"] = prescriptions[-1]["treatment"]
                patient["last_requested_regimen"] = requested_prescriptions[-1]["treatment_requested"]
                patient["last_modified"] = requested_prescriptions[-1]["treatment_computed"] if "treatment_computed" in requested_prescriptions[-1] else datetime.datetime.fromtimestamp(0).strftime(DATETIME_FORMAT_REDCAP)
                patient["last_confirmed"] = requested_prescriptions[-1]["treatment_confirmed"] if "treatment_confirmed" in requested_prescriptions[-1] else datetime.datetime.fromtimestamp(0).strftime(DATETIME_FORMAT_REDCAP)
            else:
                patient["prescriptions"] = []
                patient["last_requested_regimen"] = datetime.datetime.fromtimestamp(0).strftime(DATETIME_FORMAT_REDCAP)
                patient["last_modified"] = datetime.datetime.fromtimestamp(0).strftime(DATETIME_FORMAT_REDCAP)
                patient["last_confirmed"] = datetime.datetime.fromtimestamp(0).strftime(DATETIME_FORMAT_REDCAP)
            return patient

    @staticmethod
    def submit_visit_data(patient_id, patient_data, timestamp):
        with open('./dummy_patients.json', 'r') as f:
            patients = json.load(f)
            patient = patients[str(patient_id)]
            patient.update(patient_data)
            patients[str(patient_id)] = patient
        with open('./dummy_patients.json', 'w') as f:
            json.dump(patients, f)
        return None

    @staticmethod
    def submit_regimen(patient_id, regimen, regimen_number, timestamp, pdf_name):
        regimen_number = int(regimen_number)
        with open('./dummy_patients.json', 'r') as f:
            patients = json.load(f)
        patients[str(patient_id)]["prescriptions"][str(regimen_number)].update({"treatment_computed": str(timestamp.strftime(DATETIME_FORMAT_REDCAP)),
            "pdf_name": pdf_name,
            "treatment": [{
                "drug_name": x["drug_name"],
                "dosage_in_mg": x["dosage_in_mg"]} for x in regimen],
            })
        with open('./dummy_patients.json', 'w') as f:
            json.dump(patients, f)

    @staticmethod
    def submit_regimen_request(patient_id, timestamp, confirmation=False, agreed=False, physician=None):
        with open('./dummy_patients.json', 'r') as f:
            patients = json.load(f)
        patient = patients[str(patient_id)]

        if not confirmation:
            regimen_number = len(patient['prescriptions']) + 1
            prescription = {
                "treatment_requested": str(timestamp.strftime(DATETIME_FORMAT_REDCAP))
            }
            patients[str(patient_id)]["prescriptions"][regimen_number] = prescription
            with open('./dummy_patients.json', 'w') as f:
                json.dump(patients, f)
            return regimen_number

        if confirmation:
            patients[str(patient_id)]["prescriptions"][str(confirmation)]["treatment_confirmed"] = str(timestamp.strftime(DATETIME_FORMAT_REDCAP))
            patients[str(patient_id)]["prescriptions"][str(confirmation)]["treatment_accepted"] = '1' if agreed else '0'
            patients[str(patient_id)]["prescriptions"][str(confirmation)]["confirming_physician"] = physician.id
            with open('./dummy_patients.json', 'w') as f:
                json.dump(patients, f)
            return confirmation

    @staticmethod
    def get_pretreatment_from_redcap(patient_id):
        with open('./dummy_patients.json', 'r') as f:
            patients = json.load(f)
        return patients[str(patient_id)]["clinical_info"]

    @staticmethod
    def download_report_pdf(patient_id, smarttt_id, regimen_number):
        """
        todo implementeer dit: download report pdf van redcap, sla op in REPORT_PDF_DIR,
                                return filename (zonder directory)
        :param patient_id:
        :return:
        """
        #raise NotImplementedError
        report_pdf_dir = REPORT_PDF_DIR
        Redcap.download_file_from_redcap_json(patient_id, '/Users/lennertverboven/Desktop/', regimen_number)
        report_pdf_filename = Redcap.get_data_from_redcap(patient_id, forms=['report_pdf'])
        return report_pdf_filename
