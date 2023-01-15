# Doctor website

todo crontab! 

https://www.thegeekstuff.com/2009/11/how-to-install-edit-or-remove-cron-jobs-in-batch-mode/


### Software:
- Getest op Ubuntu 18.04, andere OS wellicht ook ok :)
- Python >3.6  (Django 3 ondersteunt enkel python 3.6 en later)
- nginx
- npm (node package manager voor JavaScript: https://www.npmjs.com/ )
- moreutils (voor `ts` command dat timestamp toevoegt aan cron output, `scripts/backup_sqlite_database.sh`)
- sqlite3

### Lokaal installeren

```bash
# clone repo, cd into
git clone git@github.com:rubencart/doctor-web.git
cd doctor-web
git checkout redcap
git pull
python3 -m venv ./venv/
source venv/bin/activate
pip install -r requirements.txt

cd doctorsite/frontend
npm install
npm run build
cd ../../

# change line 33 in doctorsite/doctorsite/settings.py from `DEBUG = False` to `DEBUG = True`

python doctorsite/manage.py migrate
python doctorsite/manage.py createsuperuser

# enter 'yes'
python doctorsite/manage.py collectstatic

# get pickle files from  https://drive.google.com/drive/folders/1-Tc7z7mEE7U5D3YDzSbEJ7ahWF5bY75p?usp=sharing and copy/paste in doctorsite/doctorapp/redcap/pickles

python doctorsite/manage.py runserver

# browse to localhost:8000/admin and make some Doctor instances
```

### Wat moeten jullie nog doen

- Pickles downloaden van https://drive.google.com/drive/folders/1-Tc7z7mEE7U5D3YDzSbEJ7ahWF5bY75p?usp=sharing (enkel voor
debuggen, deze data moet uiteindelijk van redcap komen), en in doctorsite/doctorapp/redcap/pickles zetten.
- Algoritme implementeren in doctorsite/doctorapp/algorithm/algorithm.py en dit gebruiken in RedcapPatientSerializer
in doctorsite/doctorapp/serializers.py (gebruikt nu algoritme uit algorithm_mock.py)
- Kolommen etc aanmaken in redcap, volgens de `.pkl` bestanden in doctorsite/doctorapp/redcap
- Doctorsite/doctorapp/redcap/redcap_database.py aanpassen zodat deze alles van redcap haalt en naar redcap schrijft
ipv uit lokale `.pkl` bestanden.
- User accounts aanmaken voor de dokters in de SQLite DB die bij dit project hoort, via https://url/admin . Dan
deze accounts hun user_id nemen (zijn ints) en deze invullen bij de juiste patienten in de assoc_doctors kolom
van Redcap. Dit is een beetje vervelend, omdat we accounts opslaan in de SQLite DB van Django en patienten in
Redcap. Hopelijk kan je dit met een script ofzo snel doen :).

Je kan de user_ids automatisch krijgen door:
```bash
python doctorsite/manage.py shell
```
```python
from django.contrib.auth.models import User
[(u.username, u.first_name, u.last_name, u.id) for u in User.objects.all()]
```

- Deployen op jullie servers, zie "Deployment stappen".

### Werken met Django en Django Rest Framework
- Django werkt met globale instellingen etc., deze zitten in `doctorsite/doctorsite`, en verder met apps. Hier is de backend
server een app, in `doctorsite/doctorapp`, en de frontend een andere, in `doctorsite/frontend`. De JavaScript code zit in
`doctorsite/frontend/src`. Voorbeelden van nginx en gunicorn configuratiebestanden zitten in `example_config/`.

- Om te developpen zet je best `DEBUG = True` in doctorsite/doctorsite/settings.py. Niet vergeten terug op False te zetten!
Met DEBUG=False werkt de site alleen via HTTPS, en dit werkt niet via localhost. Om de website lokaal te runnen:
```
source venv/bin/activate
python doctorsite/manage.py runserver
```
Daarna kan je naar `http://127.0.0.1/app` of `http://127.0.0.1/api` gaan in je browser.

- In doctorsite/doctorsite/urls.py, doctorsite/doctorapp/urls.py, en doctorsite/frontend/urls.py worden de url-patronen
gekoppeld aan "views". Deze views zijn eigenlijk de controllers die bepalen wat er weergegeven wordt of
welke data de API teruggeeft. De views uit het MVC patroon zijn hier eerder "templates", en deze zitten bv. in doctorapp/templates.
Voor de backend zijn er niet veel templates, omdat de backend (doctorapp) een REST API implementeert. In de frontend
zit de index.html template waarin React.js de JavaScript code inlaadt.

- Met debug=True kan je de API testen door bv. naar `http://127.0.0.1:8000/api/redcap/drugs/` te gaan.

- De server schrijft logs naar `/var/log/doctorsite/doctorsite.log`.

- Installeer crontab met `sudo adduser <your_username> crontab && crontab cron-file.txt` en `mkdir $HOME/doctorsite-dataset-backups`. 
Maakt automatisch back-ups van de DB.

### Gebruikte libraries
- Django voor de server, views, modellen, users, authenticatie: https://docs.djangoproject.com/en/3.0/
- Django Rest Framework om REST API endpoints te implementeren: https://www.django-rest-framework.org/
- React.js om de frontend te implementeren als een JavaScript applicatie: https://reactjs.org/
- Material-UI om bestaande en mooi geformatteerde React-componenten te importeren: https://material-ui.com/
- nginx als server: https://www.nginx.com/ , 'serves' statische bestanden (.js, .gzip, .css, .pdf etc) en stuurt andere requests door naar
gunicorn
- gunicorn als python server: https://gunicorn.org/ , houdt enkele worker processen levend die luisteren naar inkomende requests en deze sturen
naar de eigenlijke Django/Python server met onze logica erin.

### Deployment stappen

- De configuratiebestanden die ik heb gebruikt om de app te deployen op een server met Ubuntu 18.04 en nginx, gunicorn
zitten in `example_config/`.
- Gunicorn & Nginx volgens https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-18-04 . Niet het Django / PostGreSQL deel, enkel het gunicorn en nginx deel :).
Met aanpassingen hier en daar, bv. om TLSv1.3 toe te staan.
- SSL certificate maken volgens https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04 en https://certbot.eff.org/lets-encrypt/ubuntubionic-nginx
- Encryptie-veiligheid testen met https://www.ssllabs.com/ssltest/analyze.html?d=rapps.be (domeinnaam veranderen)
- CDN opzetten: https://docs.djangoproject.com/en/3.0/howto/static-files/deployment/#serving-static-files-from-a-cloud-service-or-cdn .
O.a. om jezelf te beschermen tegen DDoS aanvallen en om gegevens te cachen tussen hier en Afrika. Bv. https://www.cloudflare.com/cdn/ , maar dit is niet gratis.
- Als je emails wil krijgen over errors, moet je een email server opzetten (of een bestaande gebruiken, van UAntwerpen ofzo),
en deze in `doctorsite/setting.py` configureren, zie ook https://docs.djangoproject.com/en/3.0/topics/email/#smtp-backend .
- Maak af en toe een back-up van de DB (gebruikers en wachtwoorden) met `python manage.py dumpdata > datadump.json`. Deze
back-up kan je terug inladen met `python3 manage.py loaddata datadump.json`.
- Je kan logs van `gunicorn` bekijken met `sudo journalctl -u gunicorn`.
- Je moet je firewall configureren om binnenkomend HTTP(S) verkeer toe te laten op TCP poorten 80 en 443, van eender welk IP adres.
- Als je een andere server dan nginx gebruikt, let er dan op dat deze main.js.gz serveert en niet main.js (kan je nakijken in de 'Network' tab van developer tools in Chrome, de bestandsnaam zal niet verschillen maar de een is 222KB groot en de andere 778KB). Zo bespaar je bandbreedte en laadt de website sneller :).

- stel cron jobs uit `cron-file.txt` in met `crontab cron-file.txt`.

```bash
sudo apt update
sudo apt install python3-pip python3-dev libpq-dev nginx

# clone repo, cd into
git clone git@github.com:rubencart/doctor-web.git
cd doctor-web
git checkout redcap
git pull
python3 -m venv ./venv/
source venv/bin/activate
pip install -r requirements.txt

cd doctorsite/frontend
npm install
npm run build
cd ../../

# put existing db.sqlite3 file (like one that you made locally) in doctorsite/ (same dir as manage.py)
# OR start a new DB by executing the following 2 lines
# python doctorsite/manage.py migrate
# python doctorsite/manage.py createsuperuser

# enter 'yes'
python doctorsite/manage.py collectstatic

# configure nginx and gunicorn
# check https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-18-04
# example files in example_config folder
# sudo vim /etc/systemd/system/gunicorn.socket
# sudo vim /etc/systemd/system/gunicorn.service
sudo systemctl start gunicorn.socket
sudo systemctl enable gunicorn.socket
# sudo vim /etc/nginx/sites-available/doctorsite 
# sudo ln -s /etc/nginx/sites-available/doctorsite /etc/nginx/sites-enabled

# generate a random secret key, like '#^vexa6*2k@sq)ue=stru3bk*(*5t*7@=d-kwsu6ku#t+)phpg' but another
# sudo vim /etc/doctorsite/config.json, containing the secret_key and a list of admin names and email-addresses
# mkdir /var/log/doctorsite and make sure user that runs the server app has write permissions to this directory

# after updating Django app
sudo systemctl restart gunicorn
# after changing Gunicorn socket or service files
sudo systemctl daemon-reload
sudo systemctl restart gunicorn.socket gunicorn.service
# after changing Nginx server block configuration
sudo nginx -t && sudo systemctl restart nginx

# configure firewall to allow incoming tcp connections on port 80/443 (from any ip address)

# go to https://url.be/admin and make User & Doctor (both!) instances for every doctor that needs to login
# set assoc_doctors field in Redcap for every patient to numpy array of ids of corresponding doctors, e.g. np.array([1, 2]) (see 'Wat moeten jullie nog doen' section)
```

### API specificatie

De front-end verwacht de volgende formaten als antwoord op requests.

#### GET-request naar /api/redcap/patients/
De count, next, previous velden worden door Django Rest Framework ingevuld. De door ons geimplementeerde view
moet teruggeven wat in results staat.
```
{
    "count": 4,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": "2",
            "name": "Happi Cartuyvels",
            "date_of_birth": "2020-04-18",
            "sex": "MALE",
            "phone_number": "+32490100100",
            "hospital": "Capetown",
            "disabled": false
        },
        {
            "id": "0",
            "name": "Bas Indekeu",
            "date_of_birth": "2018-04-18",
            "sex": "MALE",
            "phone_number": "+32490222222",
            "hospital": "Johannesburg",
            "disabled": true
        },
        {
            "id": "1",
            "name": "Sam Goris",
            "date_of_birth": "1985-08-11",
            "sex": "OTHER",
            "phone_number": "+32490343434",
            "hospital": "Antwerpen",
            "disabled": true
        },
        {
            "id": "3",
            "name": "Erika Deckers",
            "date_of_birth": "2016-02-12",
            "sex": "FEMALE",
            "phone_number": "+32490123456",
            "hospital": "Hasselt",
            "disabled": true
        }
    ]
}
```
#### GET-request naar /api/redcap/drugs/
De count, next, previous velden worden door Django Rest Framework ingevuld. De door ons geimplementeerde view
moet teruggeven wat in results staat.
```
{
    "count": 24,
    "next": null,
    "previous": null,
    "results": [
        {
            "drug_name": "levofloxacin",
            "id": 0
        },
        {
            "drug_name": "linezolid",
            "id": 1
        },
        {
            "drug_name": "imipenem",
            "id": 2
        },
        {
            "drug_name": "meropenem",
            "id": 3
        },
        {
            "drug_name": "moxifloxacin",
            "id": 4
        },
        {
            "drug_name": "moxifloxacin_high_dose",
            "id": 5
        },
        {
            "drug_name": "bedaquiline",
            "id": 6
        },
        {
            "drug_name": "amikacin",
            "id": 7
        },
        {
            "drug_name": "clofazimine",
            "id": 8
        },
        {
            "drug_name": "cycloserine",
            "id": 9
        },
        {
            "drug_name": "terizidone",
            "id": 10
        },
        {
            "drug_name": "streptomycin",
            "id": 11
        },
        {
            "drug_name": "ethambutol",
            "id": 12
        },
        {
            "drug_name": "para_aminosalicylic_acid",
            "id": 13
        },
        {
            "drug_name": "ethionamide",
            "id": 14
        },
        {
            "drug_name": "prothionamide",
            "id": 15
        },
        {
            "drug_name": "rifampicin",
            "id": 16
        },
        {
            "drug_name": "rifampicin_high_dose",
            "id": 17
        },
        {
            "drug_name": "rifabutin",
            "id": 18
        },
        {
            "drug_name": "delamanid",
            "id": 19
        },
        {
            "drug_name": "isoniazid",
            "id": 20
        },
        {
            "drug_name": "isoniazid_high_dose",
            "id": 21
        },
        {
            "drug_name": "pyrazinamide",
            "id": 22
        },
        {
            "drug_name": "pretomanid",
            "id": 23
        }
    ]
}
```
#### GET-request naar /api/redcap/patients/R04274
```
{
    "id": "2",
    "name": "Happi Cartuyvels",
    "date_of_birth": "2020-04-18",
    "assoc_doctors": [
        {
            "user": 1,
            "full_name": ""
        },
        {
            "user": 6,
            "full_name": ""
        }
    ],
    "weight_in_kg": "22",
    "sex": "MALE",
    "hospital": "Capetown",
    "phone_number": "+32490100100",
    "last_modified": "2020-05-03T14:50:58Z",
    "last_confirmed": "2020-05-02T14:20:38Z",
    "disabled": false,
    "susceptible": [
        {
            "drug": "clofazimine",
            "gene": "/"
        },
        {
            "drug": "pretomanid",
            "gene": "/"
        },
        {
            "drug": "imipenem",
            "gene": "/"
        },
        {
            "drug": "para_aminosalicylic_acid",
            "gene": "/"
        },
        {
            "drug": "delamanid",
            "gene": "/"
        },
        {
            "drug": "terizidone",
            "gene": "/"
        },
        {
            "drug": "meropenem",
            "gene": "/"
        },
        {
            "drug": "linezolid",
            "gene": "/"
        },
        {
            "drug": "cycloserine",
            "gene": "/"
        },
        {
            "drug": "bedaquiline",
            "gene": "/"
        }
    ],
    "resistant": [
        {
            "drug": "ethambutol",
            "gene": "embB_p.Met306Ile"
        },
        {
            "drug": "isoniazid",
            "gene": "katG_p.Ser315Thr, fabG1_c.-15C>T"
        },
        {
            "drug": "levofloxacin",
            "gene": "gyrA_p.Ala90Val"
        },
        {
            "drug": "prothionamide",
            "gene": "ethA_p.Ala381Pro, fabG1_c.-15C>T"
        },
        {
            "drug": "moxifloxacin_high_dose",
            "gene": "gyrA_p.Ala90Val"
        },
        {
            "drug": "ethionamide",
            "gene": "ethA_p.Ala381Pro, fabG1_c.-15C>T"
        },
        {
            "drug": "rifampicin_high_dose",
            "gene": "rpoB_p.Ser450Leu"
        },
        {
            "drug": "amikacin",
            "gene": "rrs_r.1401a>g"
        },
        {
            "drug": "rifampicin",
            "gene": "rpoB_p.Ser450Leu"
        },
        {
            "drug": "pyrazinamide",
            "gene": "pncA_p.Cys14Arg"
        },
        {
            "drug": "rifabutin",
            "gene": "rpoB_p.Ser450Leu"
        },
        {
            "drug": "streptomycin",
            "gene": "rrs_r.514a>c"
        },
        {
            "drug": "moxifloxacin",
            "gene": "gyrA_p.Ala90Val"
        },
        {
            "drug": "isoniazid_high_dose",
            "gene": "katG_p.Ser315Thr"
        }
    ],
    "contra_indications": [
        {
            "drug_name": "amikacin",
            "indication": "eGFR: 45, Hearing loss",
            "id": 0
        },
        {
            "drug_name": "bedaquiline",
            "indication": "QTc: 500ms",
            "id": 1
        },
        {
            "drug_name": "clofazimine",
            "indication": "QTc: 500ms",
            "id": 2
        },
        {
            "drug_name": "delamanid",
            "indication": "QTc: 500ms",
            "id": 3
        },
        {
            "drug_name": "isoniazid_high_dose",
            "indication": "Painful peripheral neuropathy",
            "id": 5
        },
        {
            "drug_name": "linezolid",
            "indication": "Haemoglobin: 7g/dL, Platelets: 38*10^9/L, Neutrophils: 800cells/mcL, Painful peripheral neuropathy",
            "id": 6
        },
        {
            "drug_name": "moxifloxacin",
            "indication": "QTc: 500ms",
            "id": 7
        },
        {
            "drug_name": "moxifloxacin_high_dose",
            "indication": "QTc: 500ms",
            "id": 8
        },
        {
            "drug_name": "terizidone",
            "indication": "Patient suffers from psychosis",
            "id": 13
        }
    ],
    "toxicities": [
        {
            "patient_id": "2",
            "drug_name": "imipenem",
            "reason": "TOXICITY",
            "date_issued": "2020-05-03",
            "id": 8
        }
    ],
    "stockouts": [
        {
            "patient_id": "2",
            "drug_name": "clofazimine",
            "reason": "STOCKOUT",
            "date_issued": "2020-05-02",
            "id": 0
        },
        {
            "patient_id": "2",
            "drug_name": "moxifloxacin_high_dose",
            "reason": "STOCKOUT",
            "date_issued": "2020-05-02",
            "id": 2
        },
        {
            "patient_id": "2",
            "drug_name": "imipenem",
            "reason": "STOCKOUT",
            "date_issued": "2020-05-02",
            "id": 5
        }
    ],
    "prescriptions": [
        {
            "patient_id": "2",
            "drug_name": "para_aminosalicylic_acid",
            "dosage_in_mg": 4100.0,
            "date_issued": "2020-05-03",
            "id": 0
        },
        {
            "patient_id": "2",
            "drug_name": "bedaquiline",
            "dosage_in_mg": 2900.0,
            "date_issued": "2020-05-03",
            "id": 9
        }
    ]
}
```
#### POST-request naar /api/redcap/patients/R04274/confirm_changes
Staat geen GET-requests toe.

Frontend naar backend:
```
(leeg bericht)
```
Antwoord van backend: timestamp = nieuwe opgeslagen 'last_confirmed'.
```
"2020-05-03T15:35:07.457610Z"
```
