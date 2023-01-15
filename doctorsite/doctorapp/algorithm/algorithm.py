import logging
import pickle
import os

import pandas as pd

from threading import Thread

from django.utils import timezone

from doctorapp.redcap.redcap_database import RedcapDatabase
from doctorapp.algorithm.drugdatabase import DrugDatabase
from doctorapp.algorithm.generate_pdf import generate_pdf_report
from doctorsite.settings import BASE_DIR

DB = os.path.join(BASE_DIR, 'doctorapp/algorithm/pickles/')
MODEL = os.path.join(BASE_DIR, 'doctorapp/algorithm/pickles/model.pkl')
DOSAGE = os.path.join(BASE_DIR, 'doctorapp/algorithm/pickles/dosage.csv')

categories = ['cost_category', 'toxicity_category', 'bactericidal_activity_category', 'bactericidal_activity_early_category', 'sterilizing_activity_category', 'resistance_prevention_category', 'synergism_category', 'antagonism_category', 'contraindications_category']
normalised = ['cost_normalised_inverted', 'toxicity_normalised_inverted', 'bactericidal_activity_normalised', 'bactericidal_activity_early_normalised', 'sterilizing_activity_normalised', 'resistance_prevention_normalised', 'synergism_normalised', 'antagonism_normalised_inverted', 'contraindications_normalised_inverted']
binary = ['qt_prolongation', 'high_bactericidal_activity_early', 'high_bactericidal_activity', 'high_sterilizing_activity', 'efficacy', 'mechanism_of_action', 'route_of_administration', 'route_of_administration_hospitalized']

features = categories + normalised + binary
truth = 'accept'

logger = logging.getLogger('django')

def compute_new_regimen_in_new_thread(patient, clinical, regimen_number):
    # define new process with function to run and arg value
    # daemon=False because entire program may terminate while daemon threads are still active, but not while
    # non daemon threads are still active.
    thread = Thread(target=PersonalizedCocktail.run_and_save_to_db,
                    args=(patient, clinical, regimen_number,),
                    daemon=False,
                    name='python_compute_regimen')
    thread.start()


class PersonalizedCocktail:
    @staticmethod
    def _get_dosage(weight, drug, dosage_table):
        round_weight = (weight // 5) * 5 + (weight % 5 != 0) * 5
        notes = ''
        if round_weight > 70:
            round_weight = 1000
        if round_weight <= 30:
            notes = 'patient weighs less than 30kg'
            round_weight = 35

        return (str(dosage_table.loc[round_weight, drug]) + ' ' + dosage_table.loc[0, drug], notes)

    @staticmethod
    def compute(patient):
        """
        De rest van de applicatie geeft invoer en verwacht uitvoer volgens het volgende formaat.

        :param patient:  dict like for example:
            {'id': 'R04274',
            'name': 'Happi Cartuyvels',
            'date_of_birth': datetime.date(2020, 4, 18),
             'assoc_doctors': array([0, 1, 7]),
             'weight_in_kg': '23',
             'sex': 'MALE',
             'hospital': 'Capetown',
             'phone_number': '+32490100100',
             'last_modified': datetime.datetime(2020, 5, 2, 14, 20, 33, tzinfo=datetime.timezone(datetime.timedelta(0), '+0000')),
             'last_confirmed': datetime.datetime(2020, 5, 2, 14, 20, 38, tzinfo=datetime.timezone(datetime.timedelta(0), '+0000')),
             'sequencing_report_filename': 'EC056-164.pdf', 'disabled': False,
             'susceptible': [{'drug': 'bedaquiline', 'gene': '/'}, {'drug': 'cycloserine', 'gene': '/'},
                             {'drug': 'linezolid', 'gene': '/'}, {'drug': 'terizidone', 'gene': '/'},
                             {'drug': 'para_aminosalicylic_acid', 'gene': '/'}, {'drug': 'pretomanid', 'gene': '/'},
                             {'drug': 'meropenem', 'gene': '/'}, {'drug': 'clofazimine', 'gene': '/'},
                             {'drug': 'imipenem', 'gene': '/'}, {'drug': 'delamanid', 'gene': '/'}],
             'resistant': [{'drug': 'rifampicin_high_dose', 'gene': 'rpoB_p.Ser450Leu'},
                           {'drug': 'ethambutol', 'gene': 'embB_p.Met306Ile'}, {'drug': 'pyrazinamide', 'gene': 'pncA_p.Cys14Arg'},
                           {'drug': 'isoniazid', 'gene': 'katG_p.Ser315Thr, fabG1_c.-15C>T'},
                           {'drug': 'streptomycin', 'gene': 'rrs_r.514a>c'},
                           {'drug': 'moxifloxacin_high_dose', 'gene': 'gyrA_p.Ala90Val'},
                           {'drug': 'ethionamide', 'gene': 'ethA_p.Ala381Pro, fabG1_c.-15C>T'},
                           {'drug': 'isoniazid_high_dose', 'gene': 'katG_p.Ser315Thr'},
                           {'drug': 'rifampicin', 'gene': 'rpoB_p.Ser450Leu'}, {'drug': 'rifabutin', 'gene': 'rpoB_p.Ser450Leu'},
                           {'drug': 'moxifloxacin', 'gene': 'gyrA_p.Ala90Val'},
                           {'drug': 'prothionamide', 'gene': 'ethA_p.Ala381Pro, fabG1_c.-15C>T'},
                           {'drug': 'amikacin', 'gene': 'rrs_r.1401a>g'}, {'drug': 'levofloxacin', 'gene': 'gyrA_p.Ala90Val'}],
             'contra_indications': [{'drug_name': 'amikacin', 'indication': 'eGFR: 45, Hearing loss', 'id': 0},
                                    {'drug_name': 'bedaquiline', 'indication': 'QTc: 500ms', 'id': 1},
                                    {'drug_name': 'clofazimine', 'indication': 'QTc: 500ms', 'id': 2},
                                    {'drug_name': 'delamanid', 'indication': 'QTc: 500ms', 'id': 3},
                                    {'drug_name': 'isoniazid_high_dose', 'indication': 'Painful peripheral neuropathy', 'id': 5},
                                    {'drug_name': 'linezolid',
                                     'indication': 'Haemoglobin: 7g/dL, Platelets: 38*10^9/L, Neutrophils: 800cells/mcL, Painful peripheral neuropathy',
                                     'id': 6}, {'drug_name': 'moxifloxacin', 'indication': 'QTc: 500ms', 'id': 7},
                                    {'drug_name': 'moxifloxacin_high_dose', 'indication': 'QTc: 500ms', 'id': 8},
                                    {'drug_name': 'terizidone', 'indication': 'Patient suffers from psychosis', 'id': 13}],
             'toxicities': [],
             'stockouts': [
                {'patient_id': 'R04274', 'drug_name': 'clofazimine', 'reason': 'STOCKOUT', 'date_issued': datetime.date(2020, 5, 2),
                 'id': 0},
                 {'patient_id': 'R04274', 'drug_name': 'moxifloxacin_high_dose', 'reason': 'STOCKOUT',
                            'date_issued': datetime.date(2020, 5, 2), 'id': 2},
                {'patient_id': 'R04274', 'drug_name': 'imipenem', 'reason': 'STOCKOUT', 'date_issued': datetime.date(2020, 5, 2),
                 'id': 5}],
             'prescriptions': [{'patient_id': 'R04274', 'drug_name': 'terizidone', 'dosage_in_mg': 1700.0,
                               'date_issued': datetime.date(2020, 5, 2), 'id': 0},
                              {'patient_id': 'R04274', 'drug_name': 'imipenem', 'dosage_in_mg': 4700.0,
                               'date_issued': datetime.date(2020, 5, 2), 'id': 9},
                              {'patient_id': 'R04274', 'drug_name': 'delamanid', 'dosage_in_mg': 1400.0,
                               'date_issued': datetime.date(2020, 5, 2), 'id': 14}]}

                    :return:    (timestamp etc worden ergens anders toegevoegd)
                            E.g.
                    [{'patient_id': 'R04274', 'drug_name': 'linezolid', 'dosage_in_mg': 1400.0},
                    {'patient_id': 'R04274', 'drug_name': 'delamanid', 'dosage_in_mg': 1200.0}]

        """
        # todo add algorithm :)

        #with pickle.load(open(DB, 'rb')) as production_db, pickle.load(open(MODEL, 'rb')) as model, pd.read_csv(DOSAGE, index_col=0) as dosage_table:

        logger.info('Loading model')
        #logger.info(patient)
        production_db = DrugDatabase(drug_db=os.path.join(DB, 'drugdatabase_v9.csv'), ddi_db=os.path.join(DB, 'drug-drug_interactions_v2.xls'))
        production_db.load_rules_matrix(os.path.join(DB, 'all_regimens.csv'))

        production_model = pickle.load(open(MODEL, 'rb'))
        dosage_table = pd.read_csv(DOSAGE, index_col=0)
        profile = pd.Series(index=production_db.drugs.name_formatted, data=0)
        for drug in patient['resistant']:
            profile[drug['drug']] = 2

        for drug in patient['contra_indications']:
            profile[drug['drug_name']] = 2

        for drug in patient['toxicities']:
            profile[drug['drug_name']] = 2

        for drug in patient['stockouts']:
            profile[drug['drug_name']] = 2

        for drug in patient['excluded_drugs']:
            profile[drug['drug']] = 2

        logger.info('Computing regimens')
        print(profile)
        regimens = production_db.get_top_regimens(profile.reset_index(drop=True), -1)
        regimens['patient_id'] = patient['id']
        regimens['regimen_id'] = regimens.regimen.apply(lambda regimen: str(sorted(regimen)))
        regimens['score'] = pd.DataFrame(production_model.predict_proba(regimens[features]), columns=['p_reject', 'p_accept'])['p_accept'].values
        regimens = regimens.sort_values('score', ascending=False)

        logger.info('Computing dosage')
        prescriptions = [
            {
                'patient_id': patient['id'],
                'drug_name': drug,
                'dosage_in_mg': PersonalizedCocktail._get_dosage(int(patient['weight_in_kg']), drug, dosage_table)[0]
            }
            for drug in regimens.iloc[0].regimen_name_formatted
        ]
        return prescriptions

    @staticmethod
    def run_and_save_to_db(patient, clinical, regimen_number):
        new_prescriptions = PersonalizedCocktail.compute(patient)
        patient['prescriptions'] = new_prescriptions
        timestamp = timezone.now()
        pdf_name = generate_pdf_report(patient, clinical, regimen_number, timestamp)
        with RedcapDatabase() as db:
            logger.info('Saving to database')
            db.set_new_regimen(patient_id=patient['id'], prescriptions=new_prescriptions, pdf_name=pdf_name, regimen_number=regimen_number, timestamp=timestamp)


if __name__ == "__main__":
    pass
