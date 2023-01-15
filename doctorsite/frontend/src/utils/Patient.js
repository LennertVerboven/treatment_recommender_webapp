import moment from "moment";


export class DrugPrescription {
    constructor(data) {
        this.id = data.id;
        this.drug_name = data.drug_name;
        this.dosage_in_mg = data.dosage_in_mg;
        this.date_issued = moment.utc(data.date_issued);
        this.patient_id = data.patient_id;
    }

    equals(prescription) {
        return (this.drug_name === prescription.drug_name
            && this.dosage_in_mg === prescription.dosage_in_mg
            && this.date_issued.isSame(prescription.date_issued, 'date'));
    }
}

export class DrugToxicity {
    constructor(data) {
        this.id = data.id;
        this.drug_name = data.drug_name;
        this.date_issued = moment.utc(data.date_issued);
        this.patient_id = data.patient_id;
    }
}

export class DrugStockout {
    constructor(data) {
        this.id = data.id;
        this.drug_name = data.drug_name;
        this.date_issued = moment.utc(data.date_issued);
        this.patient_id = data.patient_id;
    }
}

export class Doctor {
    constructor(data) {
        this.user = data.user;
        this.full_name = data.full_name;
    }
}

export class Drug {
    constructor(data) {
        this.id = data.id;
        this.drug_name = data.drug_name;
    }
}

export class ContraIndication {
    constructor(data) {
        this.id = data.id;
        this.drug_name = data.drug_name;
        this.indication = data.indication;
        this.date_issued = moment.utc(data.date_issued);
        this.patient_id = data.patient_id;
    }
}

export class Patient {
    constructor(data) {
        this.id = data.id;
        this.assoc_doctors = data.assoc_doctors.map(doc => new Doctor(doc));
        this.prescriptions = data.prescriptions.map(presc => new DrugPrescription(presc));
        this.toxicities = data.toxicities.map(excl => new DrugToxicity(excl));
        this.stockouts = data.stockouts.map(excl => new DrugStockout(excl));
        this.contra_indications = data.contra_indications.map(ci => new ContraIndication(ci));
        this.susceptible = data.susceptible;
        this.resistant = data.resistant;
        this.phone_number = data.phone_number;
        this.name = data.name;
        this.created_on = moment(data.created_on);
        this.date_of_birth = moment(data.date_of_birth);
        this.active = data.active;
        this.weight_in_kg = data.weight_in_kg;
        this.sex = data.sex;
        this.last_confirmed = moment(data.last_confirmed);
        this.last_modified = moment(data.last_modified);
        this.last_requested_regimen = moment(data.last_requested_regimen);
        this.pcc = data.pcc;
        this.pcc_phone_number = data.pcc_phone_number;
        this.nimdr_phone_number = data.nimdr_phone_number;
        this.nimdr = data.nimdr;
        this.intern = data.intern;
        this.intern_phone_number = data.intern_phone_number;
        this.study_id = data.smarttt_id;  // 'study_id' in data ? data.study_id : data.id;
    }
}

export class PatientForList {
    constructor(data) {
        this.id = data.id;
        this.study_id = data.study_id;
        this.name = data.name;
        this.date_of_birth = moment(data.date_of_birth);
        this.sex = data.sex;
        this.phone_number = data.phone_number;
        this.pcc = data.pcc;
        this.disabled = data.hasOwnProperty('disabled') ? data.disabled : false;
    }
}

export function patientForListMatchesQuery(patient, query) {
    if (!patient instanceof PatientForList) return false;
    return (
        patient.date_of_birth.toString().toLowerCase().includes(query.toLowerCase())
        || patient.study_id.toString().toLowerCase().includes(query.toLowerCase())
        || patient.name.toString().toLowerCase().includes(query.toLowerCase())
        || patient.pcc.toString().toLowerCase().includes(query.toLowerCase())
        || patient.phone_number.toString().toLowerCase().includes(query.toLowerCase())
    );
}
