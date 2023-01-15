from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import serializers
from rest_framework.exceptions import MethodNotAllowed

from doctorapp.algorithm.algorithm import compute_new_regimen_in_new_thread
from doctorapp.models import Doctor
from doctorapp.redcap.redcap_database import RedcapDatabase
from doctorapp.redcap.utils import DATE_FORMAT

"""
Serializers worden door de views gebruikt om
- uitgaande data van interne Python data-formaten (zoals objecten) naar primitive types om te zetten (zoals JSON),
zodat deze over een netwerk verstuurd kan worden.
- het omgekeerde te doen met inkomende data, deze data te valideren,
    en deze indien nodig op te slaan in een DB ( bv RedcapPatientSerializer.update )

RedcapPatientSerializer.update bevat code om een patient te updaten (en dit in de DB/redcap op te slaan). Ergens
een beetje raar dat dat hier gebeurt, maar dat is volgens Django conventie.
"""


class PatientDoctorSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name')

    class Meta:
        model = Doctor
        fields = ['user', 'full_name']


class RedcapPartialPatientSerializer(serializers.Serializer):
    """
    Serializer voor gedeeltelijke patient zoals die in list view weergegeven wordt (/app/)
    """

    id = serializers.CharField(read_only=True,)
    name = serializers.CharField(read_only=True,)
    date_of_birth = serializers.DateField(read_only=True,)
    sex = serializers.CharField(read_only=True,)
    phone_number = serializers.CharField(read_only=True,)
    hospital = serializers.CharField(read_only=True,)
    disabled = serializers.BooleanField(read_only=True,)


class RedcapPatientSerializer(serializers.Serializer):
    """
    Serializer voor volledige patient zoals die in detail view weergegeven wordt (/app/patient/<int:id>/)
    """

    id = serializers.CharField(read_only=True,)
    phone_number = serializers.CharField()
    weight_in_kg = serializers.FloatField()

    toxicities = serializers.JSONField()
    stockouts = serializers.JSONField()

    def to_representation(self, instance):
        """
        Uitgaand, zet de interne patient om naar een formaat dat over het netwerk verstuurd kan worden.
            Hier is er niet veel verschil, enkel de dokter(s) van de patient worden nog opgehaald.
        :param instance:
        :return:
        """
        doc_serializer = PatientDoctorSerializer(
            Doctor.objects.filter(pk__in=instance['assoc_doctors']), many=True, read_only=True
        )
        doctors = doc_serializer.data
        return {
            **instance,
            'assoc_doctors': doctors,
        }

    def to_internal_value(self, data):
        """
        Inkomend, voordat patient geupdate wordt.
        :param data:
        :return:
        """
        phone_number = data.get('phone_number')
        weight_in_kg = data.get('weight_in_kg')
        toxicities = data.get('toxicities')
        stockouts = data.get('stockouts')
        contra_indications = data.get('contra_indications')

        for field, name in ((phone_number, 'phone_number'),
                            (weight_in_kg, 'weight_in_kg'),
                            (toxicities, 'toxicities'),
                            (stockouts, 'stockouts'),
                            (contra_indications, 'contra_indications')):
            if field is None:
                raise serializers.ValidationError({
                    name: 'This field is required.'
                })

        processed_toxicities, tox_names = [], set()
        for tox in toxicities:
            if tox['drug_name'] not in tox_names:
                date_issued = parse_datetime(tox['date_issued']).date().strftime(DATE_FORMAT)
                processed_toxicities.append({**tox,
                                             'date_issued': date_issued,
                                             'reason': 'TOXICITY'})
                tox_names.add(tox['drug_name'])

        processed_stockouts, so_names = [], set()
        for so in stockouts:
            if so['drug_name'] not in so_names:
                date_issued = parse_datetime(so['date_issued']).date().strftime(DATE_FORMAT)
                processed_stockouts.append({**so,
                                            'date_issued': date_issued,
                                            'reason': 'STOCKOUT'})
                so_names.add(so['drug_name'])

        processed_contra_indications = []
        for ci in contra_indications:
            date_issued = parse_datetime(ci['date_issued']).date().strftime(DATE_FORMAT)
            processed_contra_indications.append({**ci, 'date_issued': date_issued,})
        # cis_as_dict = {ci['drug_name']: ci['indication'] for ci in processed_contra_indications}

        return {
            'phone_number': phone_number, 'weight_in_kg': weight_in_kg,
            'toxicities': processed_toxicities, 'stockouts': processed_stockouts,
            'contra_indications': processed_contra_indications,
        }

    def update(self, instance, validated_data):
        """
        Update patient (overschrijft vorige of voegt nieuwe rij toe, afhankelijk van implementatie in RedcapDatabase).
        :param instance: bestaande patient
        :param validated_data: nieuwe, inkomende data om patient mee te updaten
        :return:
        """
        with RedcapDatabase() as db:
            timestamp = timezone.now()
            patient = db.submit_patient(patient_id=instance['id'], patient_data=validated_data, timestamp=timestamp)
            clinical = db.get_clinical_info(patient_id=instance['id'])
            regimen_number = db.set_last_requested_regimen(instance['id'], timestamp=timestamp)

            # compute new regimen in separate thread so server worker (this process) is not blocked
            compute_new_regimen_in_new_thread(patient, clinical, regimen_number)
        return patient

    def create(self, validated_data):
        raise MethodNotAllowed('create')


class RedcapDrugSerializer(serializers.Serializer):
    drug_name = serializers.CharField(read_only=True,)
    id = serializers.IntegerField(read_only=True,)
